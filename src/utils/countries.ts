import { getCodes, getName } from "country-list";
import type { CountryCode } from "../types";

export const TOTAL_COUNTRIES = 195;

export const ALL_COUNTRY_CODES: CountryCode[] =
	getCodes().sort() as CountryCode[];

export function getCountryName(code: CountryCode): string {
	return getName(code) ?? code;
}

export function getFlagUrl(code: CountryCode): string {
	return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
}

export function filterCountries(
	codes: CountryCode[],
	search: string,
): CountryCode[] {
	const term = search.toLowerCase();
	return codes.filter(
		(code) =>
			code.toLowerCase().includes(term) ||
			getCountryName(code).toLowerCase().includes(term),
	);
}
