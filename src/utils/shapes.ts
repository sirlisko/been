import countriesShapes from "world-map-country-shapes";
import type { CountryCode } from "../types";

export interface Outline {
	path: string;
	viewBox: string;
}

const SHAPES = new Map(countriesShapes.map(({ id, shape }) => [id, shape]));
const cache = new Map<string, Outline | null>();

type Box = { minX: number; minY: number; maxX: number; maxY: number };

// The shapes only use M/m, L/l, H/h, V/v and z, so tracking points is enough
function subpathBoxes(path: string): Box[] {
	const boxes: Box[] = [];
	let box: Box | null = null;
	let x = 0;
	let y = 0;
	let startX = 0;
	let startY = 0;
	const visit = () => {
		if (!box) return;
		box.minX = Math.min(box.minX, x);
		box.maxX = Math.max(box.maxX, x);
		box.minY = Math.min(box.minY, y);
		box.maxY = Math.max(box.maxY, y);
	};
	for (const [, command, args] of path.matchAll(/([a-zA-Z])([^a-zA-Z]*)/g)) {
		const n = (args.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
		const relative = command === command.toLowerCase();
		switch (command.toLowerCase()) {
			case "m":
			case "l":
				for (let i = 0; i + 1 < n.length; i += 2) {
					x = relative ? x + n[i] : n[i];
					y = relative ? y + n[i + 1] : n[i + 1];
					if (command.toLowerCase() === "m" && i === 0) {
						[startX, startY] = [x, y];
						box = { minX: x, minY: y, maxX: x, maxY: y };
						boxes.push(box);
					}
					visit();
				}
				break;
			case "h":
				for (const v of n) {
					x = relative ? x + v : v;
					visit();
				}
				break;
			case "v":
				for (const v of n) {
					y = relative ? y + v : v;
					visit();
				}
				break;
			case "z":
				[x, y] = [startX, startY];
				break;
		}
	}
	return boxes;
}

const area = (b: Box) => (b.maxX - b.minX) * (b.maxY - b.minY);

// Framed on the largest landmass so far-flung islands (Hawaii, the Canaries)
// don't shrink the country to a dot; the rest is drawn if it falls inside
export function countryOutline(code: CountryCode): Outline | null {
	if (cache.has(code)) return cache.get(code) ?? null;
	const path = SHAPES.get(code);
	let outline: Outline | null = null;
	if (path) {
		const main = subpathBoxes(path).reduce((a, b) =>
			area(b) > area(a) ? b : a,
		);
		const pad = Math.max(main.maxX - main.minX, main.maxY - main.minY) * 0.04;
		outline = {
			path,
			viewBox: [
				main.minX - pad,
				main.minY - pad,
				main.maxX - main.minX + pad * 2,
				main.maxY - main.minY + pad * 2,
			]
				.map((n) => n.toFixed(1))
				.join(" "),
		};
	}
	cache.set(code, outline);
	return outline;
}
