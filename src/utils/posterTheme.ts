import type { Fill } from "./mapFill";

// The light airmail palette, fixed so the print never follows dark mode
export const PAPER = "#f6f7f9";
export const INK = "#23262e";
export const MUTED = "#4a5163";
export const BLUE = "#1d4e9e";
export const RED = "#d42a35";
export const PRINT_FILL: Record<Fill, string> = {
	shared: "#2e7d5b",
	selected: BLUE,
	highlighted: RED,
	land: "#dce2ea",
};

export const DISPLAY =
	'"Bricolage Grotesque", "Noto Sans", "Noto Sans JP", "Noto Sans Arabic", system-ui, sans-serif';
export const BODY = '"Instrument Sans", system-ui, sans-serif';
