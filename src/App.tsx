import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import AuthModal from "./components/AuthModal";
import CountryList from "./components/CountryList";
import CountrySearch from "./components/CountrySearch";
import Page, { linkButtonClass, primaryButtonClass } from "./components/Page";
import Stats from "./components/Stats";
import WorldMap from "./components/WorldMap";
import { addCountries, loadCountries, removeCountry } from "./lib/countriesDB";
import { supabase } from "./lib/supabase";
import type { CountryCode } from "./types";
import {
	ALL_COUNTRY_CODES,
	countStates,
	filterCountries,
	getCountryName,
	toShareParam,
} from "./utils/countries";

const LOCAL_STORAGE_KEY = "visitedCountries";

function readLocalCountries(): CountryCode[] {
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function writeLocalCountries(codes: CountryCode[]) {
	try {
		if (codes.length > 0) {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(codes));
		} else {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		}
	} catch (e) {
		console.warn("Could not save to localStorage:", e);
	}
}

type Notice = { text: string; error?: boolean };

const errorClass = "m-0 text-sm font-semibold text-stamp-red";

const App = () => {
	const [user, setUser] = useState<User | null>(null);
	const [countries, setCountries] = useState<CountryCode[]>(readLocalCountries);
	// Editing is blocked unless the account's list loaded: saving on top of a
	// failed load would make the UI disagree with what's stored.
	const [remote, setRemote] = useState<"loading" | "ok" | "failed">("ok");
	const [search, setSearch] = useState("");
	const [showAuth, setShowAuth] = useState(false);
	const [notice, setNotice] = useState<Notice | null>(null);

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
			setCountries(await loadCountries(signedIn.id));
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
					setUser(null);
					setRemote("ok");
					setCountries(readLocalCountries());
					setNotice({
						text: "Signed out. Your countries are saved to your account.",
					});
				} else if (
					(event === "INITIAL_SESSION" || event === "SIGNED_IN") &&
					session
				) {
					syncUser(session.user);
				}
			}, 0);
		});
		return () => data.subscription.unsubscribe();
	}, []);

	const toggleCountry = async (code: CountryCode) => {
		if (user && remote !== "ok") return;
		const adding = !countries.includes(code);
		const next = adding
			? [...countries, code]
			: countries.filter((c) => c !== code);
		setCountries(next);

		if (!user) {
			writeLocalCountries(next);
			return;
		}
		try {
			await (adding
				? addCountries(user.id, [code])
				: removeCountry(user.id, code));
			setNotice(null);
		} catch (e) {
			console.error("Save failed:", e);
			setCountries((current) => {
				const without = current.filter((c) => c !== code);
				return adding ? without : [...without, code];
			});
			setNotice({
				text: `Couldn't save ${getCountryName(code)}, please try again.`,
				error: true,
			});
		}
	};

	const share = async () => {
		const url = `${location.origin}/?visited=${toShareParam(countries)}`;
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

	const searchResults = useMemo(
		() => (search ? filterCountries(ALL_COUNTRY_CODES, search) : []),
		[search],
	);

	return (
		<Page
			actions={
				<>
					{countries.length > 0 && (
						<button type="button" onClick={share} className={linkButtonClass}>
							Share map
						</button>
					)}
					{supabase &&
						(user ? (
							<button
								type="button"
								onClick={() => supabase?.auth.signOut()}
								className={linkButtonClass}
							>
								Sign out
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

			<section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
				<h1 className="m-0 font-display font-normal text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-xl">
					Where have <em className="text-stamp-red">you</em> been?
				</h1>
				<Stats countries={countries} />
			</section>

			<div
				aria-live="polite"
				className="empty:hidden -my-4 flex flex-col gap-2"
			>
				{user && remote === "loading" && (
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

			<section className="page-frame px-2 md:px-8 pt-9 md:pt-10 pb-2 md:pb-6">
				<div className="label absolute top-3 left-4 right-4 flex justify-between">
					<span>Page 01 — The world</span>
					<span className="hidden sm:inline">Tap a country to stamp it</span>
				</div>
				<WorldMap
					selected={countries}
					highlighted={searchResults}
					onToggle={toggleCountry}
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

			<section className="page-frame px-2 md:px-6 pt-11 pb-6">
				<div className="label absolute top-3 left-4 right-4 flex justify-between">
					<span>Page 02 — Entries</span>
					{countries.length > 0 && (
						<span className="hidden sm:inline">Tap a stamp to remove it</span>
					)}
				</div>
				{countries.length > 0 ? (
					<CountryList countries={countries} onToggle={toggleCountry} />
				) : (
					<p className="m-0 py-10 text-center font-display italic text-xl text-muted">
						No stamps yet. Tap a country on the map, or search for one.
					</p>
				)}
			</section>
		</Page>
	);
};

export default App;
