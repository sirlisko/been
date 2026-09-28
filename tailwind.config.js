/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				paper: "#F3EDE2",
				page: "#F8F4EC",
				ink: "#1F2A44",
				muted: "#6B6457",
				line: "#CFC6B4",
				land: "#E2D9C6",
				stamp: {
					red: "#B8432F",
					blue: "#2B4C8C",
					green: "#2F6B4F",
					purple: "#6A3E7C",
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
