import { expect, it } from "vitest";
import { shareMeta } from "./shareMeta";

const html =
	'<meta property="og:title" content="Been." /><meta property="og:description" content="Track." />';

it("puts the shared map's stats in the preview tags", () => {
	expect(shareMeta(html, "it.fr.pr.xx")).toBe(
		'<meta property="og:title" content="2 countries, 1.0% of the world" /><meta property="og:description" content="See where they\'ve been on Been." />',
	);
});

it("leaves the page alone without any countries", () => {
	expect(shareMeta(html, "pr")).toBe(html);
});
