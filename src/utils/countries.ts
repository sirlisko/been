import { getCodes, getName } from "country-list";
import type { CountryCode } from "../types";
import { UN_STATES } from "./unStates";

export { UN_STATES };

export const TOTAL_COUNTRIES = UN_STATES.size;

export const ALL_COUNTRY_CODES: CountryCode[] =
	getCodes().sort() as CountryCode[];

const KNOWN_CODES = new Set<string>(ALL_COUNTRY_CODES);

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

// Everyday names ("United States") rather than ISO ones ("United States of America (the)")
export function getCountryName(code: CountryCode): string {
	try {
		return displayNames.of(code) ?? getName(code) ?? code;
	} catch {
		return getName(code) ?? code;
	}
}

export interface NativeName {
	name: string;
	lang: string;
}

const nativeNames = new Map<CountryCode, NativeName | null>();

// The name in the country's most spoken language, as CLDR has it ("日本",
// "Deutschland"); null when that's the English name anyway
export function getNativeName(code: CountryCode): NativeName | null {
	if (nativeNames.has(code)) return nativeNames.get(code) ?? null;
	let native: NativeName | null = null;
	try {
		const lang = new Intl.Locale(`und-${code}`).maximize().baseName;
		const name = new Intl.DisplayNames([lang], { type: "region" }).of(code);
		if (name && name !== code && name !== getCountryName(code))
			native = { name, lang };
	} catch {}
	nativeNames.set(code, native);
	return native;
}

export function filterCountries(
	codes: CountryCode[],
	search: string,
): CountryCode[] {
	const term = search.toLowerCase();
	return codes.filter((code) =>
		[
			code,
			getCountryName(code),
			getName(code) ?? "",
			getNativeName(code)?.name ?? "",
		].some((name) => name.toLowerCase().includes(term)),
	);
}

export function sortByName(codes: CountryCode[]): CountryCode[] {
	return [...codes].sort((a, b) =>
		getCountryName(a).localeCompare(getCountryName(b)),
	);
}

export function countStates(codes: CountryCode[]) {
	const count = codes.filter((code) => UN_STATES.has(code)).length;
	return {
		count,
		territories: codes.length - count,
		percentage: ((count / TOTAL_COUNTRIES) * 100).toFixed(1),
	};
}

export function toShareParam(codes: CountryCode[]): string {
	return [...codes].sort().join(".");
}

export function parseShareParam(param: string | null): CountryCode[] | null {
	if (param === null) return null;
	const codes = param
		.toUpperCase()
		.split(".")
		.filter((code) => KNOWN_CODES.has(code));
	return [...new Set(codes)] as CountryCode[];
}
