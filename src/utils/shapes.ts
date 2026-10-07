import countriesShapes from "world-map-country-shapes";
import allBounds, { type CountryBounds } from "world-map-country-shapes/bounds";
import type { CountryCode } from "../types";

export interface Outline {
	path: string;
	viewBox: string;
}

const SHAPES = new Map<string, string>(
	countriesShapes.map(({ id, shape }) => [id, shape]),
);

// Keyed by the map's ids; looked up with any code, so some are missing
export const countryBounds = (code: string): CountryBounds | undefined =>
	(allBounds as Record<string, CountryBounds | undefined>)[code];

// Framed on the largest landmass so far-flung islands (Hawaii, the Canaries)
// don't shrink the country to a dot; the rest is drawn if it falls inside
export function countryOutline(code: CountryCode): Outline | null {
	const path = SHAPES.get(code);
	const box = countryBounds(code)?.mainland;
	if (!path || !box) return null;
	const [minX, minY, maxX, maxY] = box;
	const pad = Math.max(maxX - minX, maxY - minY) * 0.04;
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
