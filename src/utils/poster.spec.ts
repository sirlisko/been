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
			map: "1",
			style: "ground",
			border: "bold",
		});
		expect(params?.success_url).toBe(
			`${origin}/print?size=50x70&visited=FR.IT&name=Ada&ordered=1`,
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

it("records the map choice and subtitle so fulfilment prints what was ordered", () => {
	const params = checkoutParams(
		{ size: "30x40", visited: "GB.IE", map: "0", subtitle: " Since 2019 " },
		"https://been.example",
	);
	expect(params?.metadata).toMatchObject({ map: "0", subtitle: "Since 2019" });
	expect(params?.line_items?.[0].price_data?.product_data?.name).not.toMatch(
		/with map/,
	);
	expect(parsePosterParams(new URLSearchParams("visited=IT&map=0"))?.map).toBe(
		false,
	);
	expect(parsePosterParams(new URLSearchParams("visited=IT"))?.map).toBe(true);
});

it("records the stamp style so fulfilment prints the one that was ordered", () => {
	const params = checkoutParams(
		{ size: "30x40", visited: "GB.IE", style: "frame" },
		"https://been.example",
	);
	expect(params?.metadata?.style).toBe("frame");
	expect(params?.cancel_url).toMatch(/&style=frame$/);
	expect(
		checkoutParams({ size: "30x40", visited: "GB", style: "glitter" }, "")
			?.metadata?.style,
	).toBe("ground");
	expect(
		parsePosterParams(new URLSearchParams("visited=IT&style=type"))?.style,
	).toBe("type");
	expect(
		parsePosterParams(new URLSearchParams("visited=IT&style=nope"))?.style,
	).toBeUndefined();
});

it("records a subtle border so fulfilment prints the one that was ordered", () => {
	const params = checkoutParams(
		{ size: "50x70", visited: "GB", border: "subtle" },
		"https://been.example",
	);
	expect(params?.metadata?.border).toBe("subtle");
	expect(params?.cancel_url).toMatch(/&border=subtle$/);
	expect(
		parsePosterParams(new URLSearchParams("visited=IT&border=loud"))?.border,
	).toBeUndefined();
});
