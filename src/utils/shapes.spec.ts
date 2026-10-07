import type { CountryCode } from "../types";
import { countryOutline } from "./shapes";

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

it("has nothing to draw for countries too small for the map", () => {
	expect(countryOutline("VA" as CountryCode)).toBeNull();
});
