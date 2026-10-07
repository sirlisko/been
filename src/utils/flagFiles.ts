// A table of every flag's lazy import; itself loaded only when a poster needs flags
export const FLAG_FILES = import.meta.glob<string>(
	"/node_modules/flag-icons/flags/4x3/*.svg",
	{ query: "?raw", import: "default" },
);
