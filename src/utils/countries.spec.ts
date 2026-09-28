import { describe, expect, it } from "vitest";
import type { CountryCode } from "../types";
import {
	ALL_COUNTRY_CODES,
	TOTAL_COUNTRIES,
	UN_STATES,
	filterCountries,
	getCountryName,
	parseShareParam,
	toShareParam,
} from "./countries";

describe("getCountryName", () => {
	it("returns the country name for a known code", () => {
		expect(getCountryName("US" as CountryCode)).toBe("United States");
	});

	it("falls back to the code for an unknown code", () => {
		expect(getCountryName("XX" as CountryCode)).toBe("XX");
	});
});

describe("filterCountries", () => {
	const codes = ["US", "GB", "FR"] as CountryCode[];

	it("filters by country code (case-insensitive)", () => {
		expect(filterCountries(codes, "us")).toEqual(["US"]);
	});

	it("filters by country name", () => {
		expect(filterCountries(codes, "france")).toEqual(["FR"]);
	});

	it("also matches the official ISO name", () => {
		expect(filterCountries(codes, "america")).toEqual(["US"]);
	});

	it("returns multiple matches", () => {
		expect(filterCountries(codes, "united")).toHaveLength(2);
	});

	it("returns empty array when no match", () => {
		expect(filterCountries(codes, "zzz")).toEqual([]);
	});

	it("is case-insensitive for names", () => {
		expect(filterCountries(codes, "FRANCE")).toEqual(["FR"]);
	});
});

describe("ALL_COUNTRY_CODES", () => {
	it("contains known country codes", () => {
		expect(ALL_COUNTRY_CODES).toContain("US");
		expect(ALL_COUNTRY_CODES).toContain("FR");
	});

	it("is sorted alphabetically", () => {
		expect(ALL_COUNTRY_CODES).toEqual([...ALL_COUNTRY_CODES].sort());
	});

	it("has no duplicates", () => {
		expect(new Set(ALL_COUNTRY_CODES).size).toBe(ALL_COUNTRY_CODES.length);
	});
});

describe("UN_STATES", () => {
	it("has 195 states, all known country codes", () => {
		expect(TOTAL_COUNTRIES).toBe(195);
		for (const code of UN_STATES) expect(ALL_COUNTRY_CODES).toContain(code);
	});
});

describe("share param", () => {
	it("round-trips a list of codes", () => {
		const codes = ["IT", "FR"] as CountryCode[];
		expect(parseShareParam(toShareParam(codes))).toEqual(["FR", "IT"]);
	});

	it("drops unknown codes and duplicates", () => {
		expect(parseShareParam("it.xx.IT.<script>")).toEqual(["IT"]);
	});

	it("returns null when there's no param", () => {
		expect(parseShareParam(null)).toBeNull();
	});
});
