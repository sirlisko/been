import type { CountryCode } from "../types";
import { ALL_COUNTRY_CODES } from "./countries";
import { countryLocator, countryOutline } from "./shapes";

const box = (code: string) =>
	countryOutline(code as CountryCode)
		?.viewBox.split(" ")
		.map(Number);

it("frames a country on its outline", () => {
	const [x, y, w, h] = box("IT") ?? [];
	// Italy sits around x 1000-1080, y 270-335 on the 2000×1001 map
	expect(x).toBeGreaterThan(990);
	expect(x + w).toBeLessThan(1090);
	expect(y).toBeGreaterThan(260);
	expect(y + h).toBeLessThan(345);
});

it("frames the mainland, not far-flung islands", () => {
	const [, , w] = box("US") ?? [];
	// Alaska and Hawaii would make it most of the map's width
	expect(w).toBeLessThan(400);
});

it("has no outline for countries too small to draw as one", () => {
	expect(countryOutline("VA" as CountryCode)).toBeNull();
	expect(countryOutline("LU" as CountryCode)).toBeNull();
});

it("locates a country the map leaves out among its neighbours", () => {
	const locator = countryLocator("VA" as CountryCode);
	expect(locator?.own).toBeUndefined();
	expect(locator?.neighbours.map(({ code }) => code)).toContain("IT");
});

it("draws a tiny country itself in its locator", () => {
	expect(countryLocator("LU" as CountryCode)?.own).toBeTruthy();
});

it("wraps neighbours across the date line", () => {
	const shifted = countryLocator("TV" as CountryCode)?.neighbours.filter(
		({ dx }) => dx !== 0,
	);
	expect(shifted?.length).toBeGreaterThan(0);
});

it("can place every country", () => {
	const unplaced = ALL_COUNTRY_CODES.filter(
		(code) => !countryOutline(code) && !countryLocator(code),
	);
	expect(unplaced).toEqual([]);
});
