import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import AuthModal from "./components/AuthModal";
import CountryList from "./components/CountryList";
import CountrySearch from "./components/CountrySearch";
import Stats from "./components/Stats";
import WorldMap from "./components/WorldMap";
import { loadCountries, saveCountries } from "./lib/countriesDB";
import { supabase } from "./lib/supabase";
import type { CountryCode } from "./types";
import {
	ALL_COUNTRY_CODES,
	TOTAL_COUNTRIES,
	filterCountries,
} from "./utils/countries";

const LOCAL_STORAGE_KEY = "visitedCountries";

function readLocalCountries(): CountryCode[] {
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		return [];
	}
}

const App = () => {
	const [user, setUser] = useState<User | null>(null);
	const [countries, setCountries] = useState<CountryCode[]>([]);
	const [search, setSearch] = useState("");
	const [showAuth, setShowAuth] = useState(false);
	const [loading, setLoading] = useState(true);
	const handlingSignIn = useRef(false);

	const handleSignIn = async (signedInUser: User) => {
		handlingSignIn.current = true;
		try {
			const local = readLocalCountries();
			const dbCountries = await loadCountries(signedInUser.id);
			const merged = [...new Set([...dbCountries, ...local])];
			if (local.length > 0) {
				await saveCountries(signedInUser.id, merged);
			}
			localStorage.removeItem(LOCAL_STORAGE_KEY);
			setCountries(merged);
		} catch (e) {
			console.error("Sync failed:", e);
			setCountries(readLocalCountries());
		}
		setUser(signedInUser);
		setShowAuth(false);
		handlingSignIn.current = false;
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: bootstrap effect
	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			const sessionUser = data.session?.user ?? null;
			if (sessionUser) {
				loadCountries(sessionUser.id).then(setCountries).catch(console.error);
			} else {
				setCountries(readLocalCountries());
			}
			setUser(sessionUser);
			setLoading(false);
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (event === "SIGNED_OUT") {
					setUser(null);
					setCountries(readLocalCountries());
				}
				if (event === "SIGNED_IN" && session?.user && !handlingSignIn.current) {
					handleSignIn(session.user);
				}
			},
		);
		return () => listener.subscription.unsubscribe();
	}, []);

	const toggleCountry = async (code: CountryCode) => {
		const prev = countries;
		const isSelected = countries.includes(code);
		const updated = isSelected
			? countries.filter((c) => c !== code)
			: [...countries, code];

		setCountries(updated);

		if (user) {
			try {
				await saveCountries(user.id, updated);
			} catch {
				setCountries(prev);
			}
		} else {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
		}
	};

	const count = countries.length;
	const percentage = ((count / TOTAL_COUNTRIES) * 100).toFixed(1);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
	useEffect(() => {
		document.title =
			count > 0 ? `Been — ${count} countries (${percentage}%)` : "Been";
	}, [count]);

	if (loading) return null;

	const searchResults = search
		? filterCountries(ALL_COUNTRY_CODES, search)
		: [];
	const highlighted = search ? searchResults : [];
	const displayedCountries = search ? searchResults : countries;

	return (
		<div>
			<header className="font-luckiest-guy text-center my-12">
				<h1 className="text-5xl">Been.</h1>
				<p className="font-sans font-normal text-gray-400 mt-1">
					where have you been?
				</p>
				{user ? (
					<button
						type="button"
						onClick={() => supabase.auth.signOut()}
						className="text-xs font-sans font-normal text-gray-400 underline mt-1"
					>
						sign out
					</button>
				) : (
					<button
						type="button"
						onClick={() => setShowAuth(true)}
						className="text-xs font-sans font-normal text-gray-400 underline mt-1"
					>
						sign in to sync
					</button>
				)}
			</header>

			{showAuth && (
				<AuthModal
					onClose={() => setShowAuth(false)}
					onSuccess={handleSignIn}
				/>
			)}

			<WorldMap
				selected={countries}
				highlighted={highlighted}
				onToggle={toggleCountry}
			/>

			<Stats count={count} />

			<CountrySearch value={search} onChange={setSearch} />

			<CountryList
				countries={displayedCountries}
				selected={countries}
				onToggle={toggleCountry}
			/>

			<footer className="text-center mt-8 mb-4">
				<p>
					Made with ♥ by{" "}
					<a
						href="https://sirlisko.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-current font-bold"
					>
						Luca Lischetti (@sirLisko)
					</a>
				</p>
			</footer>
		</div>
	);
};

export default App;
