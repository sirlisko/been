import { UN_STATES } from "./unStates.ts";

// Link previews don't run JS, so shared maps get their stats in the HTML here
export function shareMeta(html: string, visited: string): string {
	const count = new Set(
		visited
			.toUpperCase()
			.split(".")
			.filter((code) => UN_STATES.has(code)),
	).size;
	if (count === 0) return html;
	const percentage = ((count / UN_STATES.size) * 100).toFixed(1);
	const title = `${count} ${count === 1 ? "country" : "countries"}, ${percentage}% of the world`;
	return html
		.replace(/(property="og:title" content=")[^"]*/, `$1${title}`)
		.replace(
			/(property="og:description" content=")[^"]*/,
			"$1See where they've been on Been.",
		);
}
