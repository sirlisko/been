import type { CountryCode } from "../types";
import { ALL_COUNTRY_CODES } from "./countries";
import { contrast, stampColours } from "./flags";

it("takes a stamp's colours from the flag", () => {
	expect(stampColours("IT" as CountryCode)).toEqual({
		ground: "#009246",
		figure: "#ffffff",
		band: "#ce2b37",
	});
	expect(stampColours("JP" as CountryCode)).toEqual({
		ground: "#bc002d",
		figure: "#ffffff",
		band: "#ffffff",
	});
});

it("keeps every country's name and outline readable on its stamp", () => {
	for (const code of ALL_COUNTRY_CODES) {
		const { ground, figure } = stampColours(code);
		expect(contrast(ground, figure), code).toBeGreaterThanOrEqual(3);
	}
});

it("swaps in white or black when no flag colour stands out", () => {
	expect(stampColours("KZ" as CountryCode).figure).toBe("#1a1a1a");
});
