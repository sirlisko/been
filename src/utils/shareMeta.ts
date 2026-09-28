import { UN_STATES } from "./unStates.ts";

export function parseShareName(param: string | null): string | undefined {
	return param?.trim().slice(0, 40) || undefined;
}

const escapeAttr = (s: string) =>
	s.replace(
		/[&<>"]/g,
		(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c,
	);

// Link previews don't run JS, so shared maps get their stats in the HTML here
export function shareMeta(
	html: string,
	visited: string,
	name?: string,
): string {
	const count = new Set(
		visited
			.toUpperCase()
			.split(".")
			.filter((code) => UN_STATES.has(code)),
	).size;
	if (count === 0) return html;
	const percentage = ((count / UN_STATES.size) * 100).toFixed(1);
	const title = `${count} ${count === 1 ? "country" : "countries"}, ${percentage}% of the world`;
	const who = name ? `${escapeAttr(name)}'s` : "they've";
	return html
		.replace(/(property="og:title" content=")[^"]*/, `$1${title}`)
		.replace(
			/(property="og:description" content=")[^"]*/,
			`$1See where ${who} been on Been.`,
		);
}
