import type { CountryCode } from "../types";
import { ALL_COUNTRY_CODES } from "./countries";
import { checkoutParams, parseCodes, parsePosterParams } from "./poster";

const codes = (list: string) => list.split(" ") as CountryCode[];

it("reads codes dotted, as in share links, or packed, as in order metadata", () => {
	expect(parseCodes("FR.IT")).toEqual(codes("FR IT"));
	expect(parseCodes("FRIT")).toEqual(codes("FR IT"));
	expect(parseCodes("it")).toEqual(codes("IT"));
	expect(parseCodes(null)).toBeNull();
});

it("falls back to the small size and caps names", () => {
	const spec = parsePosterParams(
		new URLSearchParams({
			visited: "IT",
			size: "A0",
			name: ` ${"x".repeat(50)} `,
		}),
	);
	expect(spec?.size).toBe("30x40");
	expect(spec?.name).toHaveLength(30);
});

describe("checkoutParams", () => {
	const origin = "https://been.example";

	it("prices the chosen size and keeps the poster in the metadata", () => {
		const params = checkoutParams(
			{ size: "50x70", visited: "IT.FR", name: "Ada" },
			origin,
		);
		expect(params?.line_items?.[0].price_data?.unit_amount).toBe(5500);
		expect(params?.metadata).toEqual({
			size: "50x70",
			visited: "FRIT",
			name: "Ada",
			stamps: "0",
		});
		expect(params?.success_url).toBe(
			`${origin}/print?size=50x70&visited=FR.IT&name=Ada&stamps=0&ordered=1`,
		);
	});

	it("fits every country in a single metadata value", () => {
		const params = checkoutParams(
			{ size: "30x40", visited: ALL_COUNTRY_CODES.join(".") },
			origin,
		);
		const visited = String(params?.metadata?.visited);
		expect(visited).toHaveLength(ALL_COUNTRY_CODES.length * 2);
		expect(visited.length).toBeLessThanOrEqual(500);
	});

	it("rejects invalid posters", () => {
		expect(checkoutParams(null, origin)).toBeNull();
		expect(checkoutParams({ size: "A0", visited: "IT" }, origin)).toBeNull();
		expect(checkoutParams({ size: "30x40", visited: "" }, origin)).toBeNull();
		expect(
			checkoutParams({ size: "30x40", visited: "IT", with: "FR" }, origin),
		).toBeNull();
	});

	it("needs both names to print together", () => {
		const params = checkoutParams(
			{ size: "30x40", visited: "IT", with: "FR", name: "Ada", partner: "Bo" },
			origin,
		);
		expect(params?.metadata).toMatchObject({ with: "FR", partner: "Bo" });
	});
});

it("records stamps and subtitle explicitly so fulfilment prints what was ordered", () => {
	const params = checkoutParams(
		{ size: "30x40", visited: "GB.IE", stamps: "1", subtitle: " Since 2019 " },
		"https://been.example",
	);
	expect(params?.metadata).toMatchObject({
		stamps: "1",
		subtitle: "Since 2019",
	});
	expect(params?.line_items?.[0].price_data?.product_data?.name).toMatch(
		/with stamps/,
	);
	const spec = parsePosterParams(new URLSearchParams("visited=IT&stamps=0"));
	expect(spec?.stamps).toBe(false);
	expect(parsePosterParams(new URLSearchParams("visited=IT"))?.stamps).toBe(
		undefined,
	);
});
