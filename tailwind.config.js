/** @type {import('tailwindcss').Config} */
export default {
	// Colours are CSS variables (src/styles/index.css) so dark mode is a variable swap
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				paper: "rgb(var(--paper) / <alpha-value>)",
				page: "rgb(var(--page) / <alpha-value>)",
				ink: "rgb(var(--ink) / <alpha-value>)",
				muted: "rgb(var(--muted) / <alpha-value>)",
				line: "rgb(var(--line) / <alpha-value>)",
				land: "rgb(var(--land) / <alpha-value>)",
				stamp: {
					red: "rgb(var(--stamp-red) / <alpha-value>)",
					blue: "rgb(var(--stamp-blue) / <alpha-value>)",
					green: "rgb(var(--stamp-green) / <alpha-value>)",
					purple: "rgb(var(--stamp-purple) / <alpha-value>)",
				},
			},
			fontFamily: {
				display: ['"Fraunces"', "Georgia", "serif"],
				sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
				mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [],
};
