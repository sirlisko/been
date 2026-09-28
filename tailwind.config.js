/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#EA580B",
				secondary: "#F59E0B",
				"warm-bg": "#FFEDD5",
			},
			fontFamily: {
				display: ['"Limelight"', "cursive"],
			},
		},
	},
	plugins: [],
};
