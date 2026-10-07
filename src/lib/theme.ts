export type Theme = "light" | "dark";

const THEME_KEY = "theme";
// Browser toolbar colours, matching --paper
const BAR_COLORS = { light: "#EEF1F5", dark: "#101726" };

export function storedTheme(): Theme | null {
	try {
		const theme = localStorage.getItem(THEME_KEY);
		return theme === "light" || theme === "dark" ? theme : null;
	} catch {
		return null;
	}
}

export function applyTheme(theme: Theme | null) {
	if (!theme) return;
	document.documentElement.dataset.theme = theme;
	for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
		meta.setAttribute("content", BAR_COLORS[theme]);
	}
}

export function currentTheme(): Theme {
	const set = document.documentElement.dataset.theme;
	if (set === "light" || set === "dark") return set;
	return window.matchMedia?.("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function saveTheme(theme: Theme) {
	applyTheme(theme);
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {}
}
