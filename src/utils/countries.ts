import { getCodes, getName } from "country-list";
import type { CountryCode } from "../types";

// 193 UN member states + 2 observer states (VA, PS)
export const UN_STATES = new Set<string>(
	"AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW".split(
		" ",
	),
);

export const TOTAL_COUNTRIES = UN_STATES.size;

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
