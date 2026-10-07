import countriesShapes, { WIDTH } from "world-map-country-shapes";
import allBounds, {
	type Bounds,
	type CountryBounds,
} from "world-map-country-shapes/bounds";
import type { CountryCode } from "../types";
import { MISSING_POINTS } from "./mapPoints";

export interface Outline {
	path: string;
	viewBox: string;
}

const SHAPES = new Map<string, string>(
	countriesShapes.map(({ id, shape }) => [id, shape]),
);

const ALL_BOUNDS = allBounds as Record<string, CountryBounds | undefined>;

// Keyed by the map's ids; looked up with any code, so some are missing
export const countryBounds = (code: string): CountryBounds | undefined =>
	ALL_BOUNDS[code];

// Map shapes are stored to a tenth of a unit, so below this a country is a
// handful of points: blown up to fill a stamp it comes out a jagged lump
const MIN_OUTLINE_SIZE = 5;

const size = ([minX, minY, maxX, maxY]: Bounds) =>
	Math.max(maxX - minX, maxY - minY);

// Framed on the largest landmass so far-flung islands (Hawaii, the Canaries)
// don't shrink the country to a dot; the rest is drawn if it falls inside
export function countryOutline(code: CountryCode): Outline | null {
	const path = SHAPES.get(code);
	const box = countryBounds(code)?.mainland;
	if (!path || !box || size(box) < MIN_OUTLINE_SIZE) return null;
	const [minX, minY, maxX, maxY] = box;
	const pad = size(box) * 0.04;
	return {
		path,
		viewBox: [
			minX - pad,
			minY - pad,
			maxX - minX + pad * 2,
			maxY - minY + pad * 2,
		]
			.map((n) => n.toFixed(1))
			.join(" "),
	};
}

export interface Locator {
	viewBox: string;
	point: [number, number];
	// The square window's side, to size the marker by
	span: number;
	// The country itself, when the map has it at all
	own?: string;
	// `dx` shifts a shape a map's width over, for windows across the date line
	neighbours: { code: string; path: string; dx: number }[];
}

const overlaps = (a: Bounds, b: Bounds) =>
	a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

const shifted = ([minX, minY, maxX, maxY]: Bounds, dx: number): Bounds => [
	minX + dx,
	minY,
	maxX + dx,
	maxY,
];

// Countries too small to draw as an outline are shown where they are instead:
// a window on the map around them, widened until it takes in enough land
export function countryLocator(code: CountryCode): Locator | null {
	const box = countryBounds(code)?.mainland;
	const point: [number, number] | undefined = box
		? [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2]
		: MISSING_POINTS[code];
	if (!point) return null;
	const others = Object.entries(ALL_BOUNDS).filter(
		(entry): entry is [string, CountryBounds] =>
			entry[0] !== code && entry[1] !== undefined,
	);

	const windowAt = (span: number): Bounds => [
		point[0] - span / 2,
		point[1] - span / 2,
		point[0] + span / 2,
		point[1] + span / 2,
	];
	const near = (span: number, pick: keyof CountryBounds) =>
		others.flatMap(([id, b]) =>
			[0, -WIDTH, WIDTH]
				.filter((dx) => overlaps(windowAt(span), shifted(b[pick], dx)))
				.map((dx) => ({ code: id, dx })),
		);

	// Share of the window covered by land, roughly: neighbours' boxes, clipped to it
	const land = (span: number) => {
		const win = windowAt(span);
		const area = near(span, "mainland").reduce((sum, { code: id, dx }) => {
			const b = shifted((ALL_BOUNDS[id] as CountryBounds).mainland, dx);
			const w = Math.min(b[2], win[2]) - Math.max(b[0], win[0]);
			const h = Math.min(b[3], win[3]) - Math.max(b[1], win[1]);
			return sum + w * h;
		}, 0);
		return area / (span * span);
	};

	let span = 60;
	while (span < 480 && land(span) < 0.15) span *= 1.5;
	const [minX, minY] = windowAt(span);

	return {
		viewBox: [minX, minY, span, span].map((n) => n.toFixed(1)).join(" "),
		point,
		span,
		own: SHAPES.get(code),
		neighbours: near(span, "bounds").map(({ code: id, dx }) => ({
			code: id,
			path: SHAPES.get(id) ?? "",
			dx,
		})),
	};
}
