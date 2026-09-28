import type { CountryCode } from "../types";

const LOCAL_STORAGE_KEY = "visitedCountries";
// Last list loaded for the signed-in account, shown on reload while it refreshes
export const ACCOUNT_CACHE_KEY = "accountCountries";

export function readLocalCountries(key = LOCAL_STORAGE_KEY): CountryCode[] {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function writeLocalCountries(
	codes: CountryCode[],
	key = LOCAL_STORAGE_KEY,
) {
	try {
		if (codes.length > 0) {
			localStorage.setItem(key, JSON.stringify(codes));
		} else {
			localStorage.removeItem(key);
		}
	} catch (e) {
		console.warn("Could not save to localStorage:", e);
	}
}

// The account's cached list if signed in on this device, else the anonymous one
export function readOwnCountries(): CountryCode[] {
	const cached = readLocalCountries(ACCOUNT_CACHE_KEY);
	return cached.length > 0 ? cached : readLocalCountries();
}
