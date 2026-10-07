import type { CountryCode } from "../types";
import { loadFlags, parseFlag } from "./flagArt";

it("gives each flag's internal ids the country, so flags can share a poster", () => {
	const art = parseFlag(
		"US" as CountryCode,
		'<svg xmlns="http://www.w3.org/2000/svg" id="flag-icons-us" viewBox="0 0 640 480"><defs><path id="a" d="M0 0h1"/></defs><use href="#a"/><use xlink:href="#a"/><g clip-path="url(#a)"/></svg>',
	);
	expect(art?.viewBox).toBe("0 0 640 480");
	expect(art?.body).toBe(
		'<defs><path id="flag-US-a" d="M0 0h1"/></defs><use href="#flag-US-a"/><use xlink:href="#flag-US-a"/><g clip-path="url(#flag-US-a)"/>',
	);
});

it("loads the poster's flags and skips codes without one", async () => {
	const flags = await loadFlags(["IT", "ZZ"] as CountryCode[]);
	expect(flags["IT" as CountryCode]?.body).toContain("#009246");
	expect(flags).not.toHaveProperty("ZZ");
});
