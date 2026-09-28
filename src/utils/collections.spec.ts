import { describe, expect, it } from "vitest";
import type { CountryCode } from "../types";
import {
	COLLECTIONS,
	CONTINENTS,
	collectionViewBox,
	completedTitles,
	pathBounds,
	progress,
} from "./collections";
import { UN_STATES } from "./countries";

const codes = (list: string) => list.split(" ") as CountryCode[];

describe("continents", () => {
	it("partition the UN states with the M49 counts", () => {
		expect(
			Object.fromEntries(CONTINENTS.map((c) => [c.name, c.codes.length])),
		).toEqual({ Europe: 44, Americas: 35, Asia: 48, Oceania: 14, Africa: 54 });
		const all = CONTINENTS.flatMap((c) => c.codes);
		expect(new Set(all)).toEqual(UN_STATES);
		expect(all).toHaveLength(UN_STATES.size);
	});
});

describe("collections", () => {
	it.each(COLLECTIONS)("$title lists distinct UN states", ({ codes }) => {
		expect(codes.filter((c) => !UN_STATES.has(c))).toEqual([]);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it("names what's missing, or counts it when the list is long", () => {
		const [alps] = COLLECTIONS.filter((c) => c.title === "The Alps");
		const [danube] = COLLECTIONS.filter((c) => c.title === "Down the Danube");
		expect(
			progress(alps, new Set(["AT", "CH", "DE", "FR", "IT"])),
		).toMatchObject({
			have: 5,
			total: 8,
			detail: "Missing Liechtenstein, Monaco, and Slovenia.",
		});
		expect(progress(danube, new Set(["DE"])).detail).toBe("9 to go.");
	});

	it("finds completed collections", () => {
		expect(completedTitles(["GB", "IE", "BE", "NL"] as CountryCode[])).toEqual(
			new Set(["British Isles"]),
		);
	});
});

describe("pathBounds", () => {
	it("tracks absolute and relative commands across subpaths", () => {
		expect(pathBounds("M10 10l5 5h-20v-3zm1-20L30 1H2V40")).toEqual([
			-5, -10, 30, 40,
		]);
	});
});

describe("collectionViewBox", () => {
	it("frames the countries at 2:1", () => {
		const [, , w, h] = (collectionViewBox(codes("NL BE LU")) ?? "")
			.split(" ")
			.map(Number);
		expect(Math.abs(w - h * 2)).toBeLessThanOrEqual(1);
	});

	it("is null when no country has a shape", () => {
		expect(collectionViewBox(codes("KI"))).toBeNull();
	});
});
