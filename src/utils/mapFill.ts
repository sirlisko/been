import type { CountryCode } from "../types";

export type Fill = "shared" | "selected" | "highlighted" | "land";

interface Groups {
	selected: CountryCode[];
	highlighted?: CountryCode[];
	shared?: CountryCode[];
}

export function fillFor({ selected, highlighted = [], shared = [] }: Groups) {
	const selectedSet = new Set(selected);
	const highlightedSet = new Set(highlighted);
	const sharedSet = new Set(shared);
	return (code: CountryCode): Fill => {
		if (sharedSet.has(code)) return "shared";
		if (selectedSet.has(code)) return "selected";
		if (highlightedSet.has(code)) return "highlighted";
		return "land";
	};
}
