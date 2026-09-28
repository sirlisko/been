import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import AuthModal from "./components/AuthModal";
import CountryList from "./components/CountryList";
import CountrySearch from "./components/CountrySearch";
import Page, { linkButtonClass } from "./components/Page";
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
			action={
				supabase &&
				(user ? (
					<button
						type="button"
						onClick={() => supabase?.auth.signOut()}
						className={linkButtonClass}
					>
						sign out
					</button>
				) : (
					<button
						type="button"
						onClick={() => setShowAuth(true)}
						className={linkButtonClass}
					>
						sign in to sync
					</button>
				))
			}
		>
			{showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

			<WorldMap
				selected={countries}
				highlighted={searchResults}
				onToggle={toggleCountry}
			/>

			<Stats countries={countries} />

			<div className="text-center text-sm px-4" aria-live="polite">
				{user && remote === "loading" && (
					<p className="text-gray-600">Loading your countries&hellip;</p>
				)}
				{user && remote === "failed" && (
					<p role="alert" className="text-red-700 font-bold">
						Couldn't load your countries.{" "}
						<button
							type="button"
							onClick={() => syncUser(user)}
							className="underline"
						>
							Retry
						</button>
					</p>
				)}
				{notice && (
					<p
						className={`break-all ${notice.error ? "text-red-700 font-bold" : "text-gray-600"}`}
					>
						{notice.text}
					</p>
				)}
				{countries.length > 0 && (
					<button
						type="button"
						onClick={share}
						className={`${linkButtonClass} mt-4`}
					>
						share my map
					</button>
				)}
			</div>

			<CountrySearch
				value={search}
				onChange={setSearch}
				results={searchResults}
				selected={countries}
				onSelect={toggleCountry}
			/>

			<CountryList countries={countries} onToggle={toggleCountry} />
		</Page>
	);
};

export default App;
