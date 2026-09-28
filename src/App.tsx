import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";
import AccountModal from "./components/AccountModal";
import AuthModal from "./components/AuthModal";
import Collections from "./components/Collections";
import CountryList from "./components/CountryList";
import CountrySearch from "./components/CountrySearch";
import Page, { linkButtonClass, primaryButtonClass } from "./components/Page";
import Stats from "./components/Stats";
import WorldMap from "./components/WorldMap";
import {
	type Profile,
	addCountries,
	loadCountries,
	loadProfile,
	removeCountry,
} from "./lib/countriesDB";
import {
	ACCOUNT_CACHE_KEY,
	forgetSharedMap,
	readLocalCountries,
	readOwnCountries,
	readSharedMap,
	writeLocalCountries,
} from "./lib/localCountries";
import { supabase } from "./lib/supabase";
import type { CountryCode } from "./types";
import { completedTitles } from "./utils/collections";
import {
	ALL_COUNTRY_CODES,
	countStates,
	filterCountries,
	getCountryName,
	toShareParam,
} from "./utils/countries";
type Notice = { text: string; error?: boolean };
type Toggled = { code: CountryCode; adding: boolean };

const NUDGE_KEY = "signInNudgeDismissed";
// Enough stamps that losing them to a cleared browser would hurt
const NUDGE_AFTER = 10;
const TOAST_MS = 5000;
const SIGNED_OUT = "Signed out. Your countries are saved to your account.";
const errorClass = "m-0 text-sm font-semibold text-stamp-red";

const App = () => {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [countries, setCountries] = useState<CountryCode[]>(readOwnCountries);
	// Editing is blocked unless the account's list loaded: saving on top of a
	// failed load would make the UI disagree with what's stored.
	// Starts loading until the stored session is known.
	const [remote, setRemote] = useState<"loading" | "ok" | "failed">(
		supabase ? "loading" : "ok",
	);
	const [search, setSearch] = useState("");
	const [showAuth, setShowAuth] = useState(false);
	const [showAccount, setShowAccount] = useState(false);
	const [toggled, setToggled] = useState<Toggled | null>(null);
	const [notice, setNotice] = useState<Notice | null>(null);
	const [nudgeDismissed, setNudgeDismissed] = useState(() => {
		try {
			return localStorage.getItem(NUDGE_KEY) !== null;
		} catch {
			return false;
		}
	});
	const [justCompleted, setJustCompleted] = useState<string | null>(null);
	const [sharedMap, setSharedMap] = useState(readSharedMap);
	const bannerRef = useRef<HTMLDivElement>(null);
	// Saves per country run in order, so a quick add+remove can't land reversed
	const saves = useRef(new Map<CountryCode, Promise<void>>());
	const signedOutText = useRef(SIGNED_OUT);

	useEffect(() => {
		if (!toggled) return;
		const timer = setTimeout(() => setToggled(null), TOAST_MS);
		return () => clearTimeout(timer);
	}, [toggled]);

	useEffect(() => {
		if (!justCompleted) return;
		const dismiss = (e: Event) => {
			if (
				e instanceof KeyboardEvent
					? e.key === "Escape"
					: !bannerRef.current?.contains(e.target as Node)
			) {
				setJustCompleted(null);
			}
		};
		document.addEventListener("pointerdown", dismiss);
		document.addEventListener("keydown", dismiss);
		return () => {
			document.removeEventListener("pointerdown", dismiss);
			document.removeEventListener("keydown", dismiss);
		};
	}, [justCompleted]);

	const syncUser = async (signedIn: User) => {
		setUser(signedIn);
		setShowAuth(false);
		setRemote("loading");
		try {
			const local = readLocalCountries();
			if (local.length > 0) {
				await addCountries(signedIn.id, local);
				writeLocalCountries([]);
			}
			const [codes, loadedProfile] = await Promise.all([
				loadCountries(signedIn.id),
				// Without it sharing falls back to a link with the codes, so don't block on it
				loadProfile(signedIn.id).catch(() => null),
			]);
			setCountries(codes);
			setProfile(loadedProfile);
			setRemote("ok");
		} catch (e) {
			console.error("Sync failed:", e);
			setRemote("failed");
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: syncUser only touches state setters
	useEffect(() => {
		if (!supabase) return;
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			// Deferred: awaiting supabase calls inside this callback can deadlock the auth lock.
			setTimeout(() => {
				if (event === "SIGNED_OUT") {
					writeLocalCountries([], ACCOUNT_CACHE_KEY);
					setUser(null);
					setProfile(null);
					setShowAccount(false);
					setRemote("ok");
					setCountries(readLocalCountries());
					setNotice({ text: signedOutText.current });
					signedOutText.current = SIGNED_OUT;
				} else if (
					(event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
					session
				) {
					syncUser(session.user);
				} else if (event === "INITIAL_SESSION") {
					writeLocalCountries([], ACCOUNT_CACHE_KEY);
					setCountries(readLocalCountries());
					setRemote("ok");
				}
			}, 0);
		});
		return () => data.subscription.unsubscribe();
	}, []);

	useEffect(() => {
		if (user && remote === "ok") {
			writeLocalCountries(countries, ACCOUNT_CACHE_KEY);
		}
	}, [user, remote, countries]);

	// Pick up changes made on another device while this tab was in the background
	useEffect(() => {
		if (!user || remote !== "ok") return;
		const refresh = async () => {
			if (document.visibilityState !== "visible") return;
			try {
				const latest = await loadCountries(user.id);
				if (saves.current.size === 0) setCountries(latest);
			} catch {}
		};
		document.addEventListener("visibilitychange", refresh);
		return () => document.removeEventListener("visibilitychange", refresh);
	}, [user, remote]);

	const toggleCountry = async (code: CountryCode) => {
		if (remote !== "ok") return;
		const adding = !countries.includes(code);
		const next = adding
			? [...countries, code]
			: countries.filter((c) => c !== code);
		setCountries(next);
		setToggled({ code, adding });
		const before = completedTitles(countries);
		const after = completedTitles(next);
		const gained = [...after].find((t) => !before.has(t));
		setJustCompleted(
			(shown) => gained ?? (shown && after.has(shown) ? shown : null),
		);

		if (!user) {
			writeLocalCountries(next);
			return;
		}
		const save = (saves.current.get(code) ?? Promise.resolve())
			.catch(() => {})
			.then(() =>
				adding ? addCountries(user.id, [code]) : removeCountry(user.id, code),
			);
		saves.current.set(code, save);
		try {
			await save;
			setNotice(null);
		} catch (e) {
			console.error("Save failed:", e);
			setJustCompleted(null);
			setToggled(null);
			setCountries((current) => {
				const without = current.filter((c) => c !== code);
				return adding ? without : [...without, code];
			});
			setNotice({
				text: `Couldn't save ${getCountryName(code)}, please try again.`,
				error: true,
			});
		} finally {
			if (saves.current.get(code) === save) saves.current.delete(code);
		}
	};

	const undo = () => {
		if (!toggled) return;
		toggleCountry(toggled.code);
		setToggled(null);
	};

	const deleteAccount = async () => {
		if (!supabase) return;
		const { error } = await supabase.rpc("delete_account");
		if (error) throw error;
		signedOutText.current = "Account deleted.";
		// The user no longer exists, so there's no server session to revoke
		await supabase.auth.signOut({ scope: "local" });
	};

	const dismissNudge = () => {
		setNudgeDismissed(true);
		try {
			localStorage.setItem(NUDGE_KEY, "1");
		} catch {}
	};

	const forgetShared = () => {
		forgetSharedMap();
		setSharedMap(null);
	};

	const share = async () => {
		const url = profile?.isPublic
			? `${location.origin}/@${profile.username}`
			: `${location.origin}/?visited=${toShareParam(countries)}`;
		if (navigator.share) {
			await navigator.share({ title: "Where I've been", url }).catch(() => {});
			return;
		}
		try {
			await navigator.clipboard.writeText(url);
			setNotice({ text: "Link copied to clipboard." });
		} catch {
			setNotice({ text: `Share this link: ${url}` });
		}
	};

	const { count, percentage } = countStates(countries);

	useEffect(() => {
		document.title =
			count > 0 ? `Been — ${count} countries (${percentage}%)` : "Been";
	}, [count, percentage]);

	// Nothing to show yet: hide rather than flash an empty page
	const loading = remote === "loading" && countries.length === 0;

	const searchResults = useMemo(
		() => (search ? filterCountries(ALL_COUNTRY_CODES, search) : []),
		[search],
	);

	return (
		<Page
			actions={
				<>
					{!loading && countries.length > 0 && (
						<button type="button" onClick={share} className={linkButtonClass}>
							Share map
						</button>
					)}
					{supabase &&
						(user || remote !== "loading") &&
						(user ? (
							<button
								type="button"
								onClick={() => setShowAccount(true)}
								className={linkButtonClass}
							>
								Account
							</button>
						) : (
							<button
								type="button"
								onClick={() => setShowAuth(true)}
								className={primaryButtonClass}
							>
								Sign in<span className="hidden md:inline"> to sync</span>
							</button>
						))}
				</>
			}
		>
			{showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
			{showAccount && user && (
				<AccountModal
					user={user}
					profile={profile}
					onProfileChange={setProfile}
					onClose={() => setShowAccount(false)}
					onDelete={deleteAccount}
				/>
			)}

			<div
				ref={bannerRef}
				aria-live="polite"
				className="empty:hidden fixed z-20 inset-x-4 bottom-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
			>
				{justCompleted && (
					<div className="flex flex-col gap-3 p-5 bg-ink text-paper shadow-[6px_6px_0_theme(colors.stamp.red)]">
						<span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/70">
							Collection complete
						</span>
						<p className="m-0 font-display text-2xl leading-tight">
							<em>{justCompleted}</em> — every country stamped.
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={share}
								className="font-mono text-xs uppercase tracking-wider min-h-11 px-4 bg-paper text-ink hover:bg-paper/90"
							>
								Share map
							</button>
							<button
								type="button"
								onClick={() => setJustCompleted(null)}
								className="font-mono text-xs uppercase tracking-wider min-h-11 px-3 underline underline-offset-4"
							>
								Dismiss
							</button>
						</div>
					</div>
				)}
			</div>

			<section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
				<h1 className="m-0 font-display font-normal text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-xl">
					Where have <em className="text-stamp-red">you</em> been?
				</h1>
				<div className={loading ? "invisible" : undefined}>
					<Stats countries={countries} />
				</div>
			</section>

			<div
				aria-live="polite"
				className="empty:hidden -my-4 flex flex-col gap-2"
			>
				{user && loading && (
					<p className="label m-0">Loading your stamps&hellip;</p>
				)}
				{user && remote === "failed" && (
					<p role="alert" className={errorClass}>
						Couldn&apos;t load your stamps, so editing is paused.{" "}
						<button
							type="button"
							onClick={() => syncUser(user)}
							className="underline underline-offset-2 font-semibold"
						>
							Retry
						</button>
					</p>
				)}
				{supabase &&
					!user &&
					remote === "ok" &&
					!nudgeDismissed &&
					countries.length >= NUDGE_AFTER && (
						<p className="m-0 text-sm text-muted">
							Your stamps are only saved in this browser.{" "}
							<button
								type="button"
								onClick={() => setShowAuth(true)}
								className="underline underline-offset-2 font-semibold text-ink"
							>
								Sign in to keep them
							</button>{" "}
							·{" "}
							<button
								type="button"
								onClick={dismissNudge}
								className="underline underline-offset-2"
							>
								Not now
							</button>
						</p>
					)}
				{sharedMap && (
					<p className="m-0 text-sm text-muted">
						<a
							href={sharedMap}
							className="underline underline-offset-2 font-semibold text-ink"
						>
							Compare with the map you were sent
						</a>{" "}
						·{" "}
						<button
							type="button"
							onClick={forgetShared}
							className="underline underline-offset-2"
						>
							Forget it
						</button>
					</p>
				)}
				{notice && (
					<p
						className={
							notice.error ? errorClass : "m-0 text-sm text-muted break-all"
						}
					>
						{notice.text}
					</p>
				)}
			</div>

			<section
				id="world"
				className="scroll-mt-6 page-frame px-2 md:px-8 pt-9 md:pt-10 pb-2 md:pb-6"
			>
				<div className="label absolute top-3 left-4 right-4 flex justify-between">
					<span>Page 01 — The world</span>
					<span className="hidden sm:inline">Tap a country to stamp it</span>
				</div>
				<WorldMap
					selected={countries}
					highlighted={searchResults}
					onToggle={toggleCountry}
					status={
						toggled && (
							<>
								{toggled.adding ? "Stamped" : "Removed"}{" "}
								{getCountryName(toggled.code)} ·{" "}
								<button
									type="button"
									onClick={undo}
									className="min-h-11 uppercase underline underline-offset-4 text-ink"
								>
									Undo
								</button>
							</>
						)
					}
				/>
			</section>

			<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
				<h2 className="m-0 font-display italic font-normal text-3xl md:text-4xl">
					Stamps
				</h2>
				<CountrySearch
					value={search}
					onChange={setSearch}
					results={searchResults}
					selected={countries}
					onSelect={toggleCountry}
				/>
			</div>

			<section
				id="entries"
				className="scroll-mt-6 page-frame px-2 md:px-6 pt-11 pb-6"
			>
				<div className="label absolute top-3 left-4 right-4 flex justify-between">
					<span>Page 02 — Entries</span>
					{countries.length > 0 && (
						<span className="hidden sm:inline">Tap a stamp to remove it</span>
					)}
				</div>
				{loading ? null : countries.length > 0 ? (
					<CountryList countries={countries} onToggle={toggleCountry} />
				) : (
					<p className="m-0 py-10 text-center font-display italic text-xl text-muted">
						No stamps yet. Tap a country on the map, or search for one.
					</p>
				)}
			</section>

			<section
				id="collections"
				className="scroll-mt-6 page-frame px-4 md:px-8 pt-11 pb-6"
			>
				<p className="label absolute top-3 left-4 m-0">Page 03 — Collections</p>
				{!loading && <Collections countries={countries} />}
			</section>
		</Page>
	);
};

export default App;
