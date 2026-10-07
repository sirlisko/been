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
				blue: "rgb(var(--blue) / <alpha-value>)",
				red: "rgb(var(--red) / <alpha-value>)",
				green: "rgb(var(--green) / <alpha-value>)",
			},
			fontFamily: {
				display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
				sans: ['"Instrument Sans"', "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};
