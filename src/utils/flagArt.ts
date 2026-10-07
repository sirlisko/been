import { useEffect, useState } from "react";
import type { CountryCode } from "../types";

export interface FlagArt {
	viewBox: string;
	body: string;
}

export type Flags = Partial<Record<CountryCode, FlagArt>>;

// Many flags share one poster SVG, so their internal ids (clip paths,
// gradients, reused shapes) get the country as a prefix to stay unique
export function parseFlag(code: CountryCode, raw: string): FlagArt | null {
	const match = raw.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/);
	if (!match) return null;
	const prefix = `flag-${code}-`;
	const body = match[2]
		.replace(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
		.replace(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
		.replace(/href="#([^"]+)"/g, `href="#${prefix}$1"`);
	return { viewBox: match[1], body };
}

// Parsed once per session: the home grid, the picker and the poster share them
const cache = new Map<CountryCode, Promise<FlagArt | null>>();

async function loadFlag(code: CountryCode): Promise<FlagArt | null> {
	const { FLAG_FILES } = await import("./flagFiles");
	const file =
		FLAG_FILES[`/node_modules/flag-icons/flags/4x3/${code.toLowerCase()}.svg`];
	return file ? parseFlag(code, await file()) : null;
}

export async function loadFlags(codes: CountryCode[]): Promise<Flags> {
	const flags: Flags = {};
	await Promise.all(
		codes.map(async (code) => {
			if (!cache.has(code)) cache.set(code, loadFlag(code));
			const art = await cache.get(code);
			if (art) flags[code] = art;
		}),
	);
	return flags;
}

// The flags for `codes` while `enabled`; null until the first batch arrives.
// Earlier flags stay up while a changed list loads, so stamps don't flicker
export function useFlags(codes: CountryCode[], enabled: boolean): Flags | null {
	const [flags, setFlags] = useState<Flags | null>(null);
	const key = codes.join(".");

	useEffect(() => {
		if (!enabled) return;
		let current = true;
		loadFlags(key ? (key.split(".") as CountryCode[]) : []).then(
			(loaded) => current && setFlags(loaded),
		);
		return () => {
			current = false;
		};
	}, [key, enabled]);

	return enabled ? flags : null;
}
