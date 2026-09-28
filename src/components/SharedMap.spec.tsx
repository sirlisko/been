import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import type { CountryCode } from "../types";

const { loadPublicMap } = vi.hoisted(() => ({ loadPublicMap: vi.fn() }));
vi.mock("../lib/countriesDB", () => ({ loadPublicMap }));

import SharedMap, { ProfileMap } from "./SharedMap";

const codes = (list: string) => list.split(" ") as CountryCode[];

beforeEach(() => localStorage.clear());

it("compares the shared map with the visitor's own stamps", () => {
	localStorage.setItem("visitedCountries", JSON.stringify(codes("IT FR JP")));
	render(<SharedMap countries={codes("IT FR ES PT")} />);
	const group = (name: string) =>
		Array.from(document.querySelectorAll("details")).find((d) =>
			d.querySelector("summary")?.textContent?.startsWith(name),
		);
	expect(group("Both of you · 2")?.textContent).toMatch(/France.*Italy/);
	expect(group("Both of you · 2")?.textContent).not.toMatch(/Spain|Japan/);
	expect(group("Both of you · 2")?.open).toBe(false);
	expect(group("Only them · 2")?.textContent).toMatch(/Portugal.*Spain/);
	expect(group("Only them · 2")?.open).toBe(true);
	expect(group("Only you · 1")?.textContent).toMatch(/Japan/);
	expect(screen.getAllByText(/^You · \d+%$/)).not.toHaveLength(0);
	expect(screen.getAllByText(/· You \d+\/\d+/)).not.toHaveLength(0);
	const fill = (country: string) =>
		Array.from(document.querySelectorAll("path"))
			.find((p) => p.textContent === country)
			?.getAttribute("class");
	expect(fill("Italy")).toContain("fill-stamp-green");
	expect(fill("Spain")).toContain("fill-stamp-red");
	expect(fill("Japan")).toContain("fill-stamp-blue");
});

it("uses the sharer's name when given", () => {
	localStorage.setItem("visitedCountries", JSON.stringify(codes("IT JP")));
	render(<SharedMap countries={codes("IT FR")} name="Luca" />);
	expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
		"Where Luca's been",
	);
	expect(document.querySelector("details[open] summary")?.textContent).toMatch(
		/^Only Luca · 1/,
	);
});

it("skips the comparison for visitors without stamps", () => {
	render(<SharedMap countries={codes("IT FR")} />);
	expect(screen.queryByText(/Both of you/)).toBeNull();
	expect(screen.queryByText(/You ·/)).toBeNull();
});

it("loads a /@username map from the account", async () => {
	loadPublicMap.mockResolvedValue(["IT"]);
	render(<ProfileMap username="ada" />);
	expect(
		await screen.findByRole("heading", { name: "Where ada's been" }),
	).toBeInTheDocument();
	expect(loadPublicMap).toHaveBeenCalledWith("ada");
});

it("says when nobody has the username", async () => {
	loadPublicMap.mockResolvedValue(null);
	render(<ProfileMap username="nobody" />);
	expect(
		await screen.findByText("There's no public map at @nobody."),
	).toBeInTheDocument();
});
