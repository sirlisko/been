import { describe, expect, it } from "vitest";
import type { CountryCode } from "../types";
import {
	ALL_COUNTRY_CODES,
	TOTAL_COUNTRIES,
	filterCountries,
	getCountryName,
	getFlagUrl,
} from "./countries";

describe("getCountryName", () => {
	it("returns the country name for a known code", () => {
		expect(getCountryName("US" as CountryCode)).toBe("United States of America (the)");
	});

	it("falls back to the code for an unknown code", () => {
		expect(getCountryName("XX" as CountryCode)).toBe("XX");
	});
});

describe("getFlagUrl", () => {
	it("returns a flagcdn URL with lowercased code", () => {
		expect(getFlagUrl("US" as CountryCode)).toBe(
			"https://flagcdn.com/w40/us.png",
		);
	});

	it("lowercases the country code", () => {
		expect(getFlagUrl("GB" as CountryCode)).toContain("gb");
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

describe("TOTAL_COUNTRIES", () => {
	it("is 195", () => {
		expect(TOTAL_COUNTRIES).toBe(195);
	});
});
