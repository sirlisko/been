import { render, screen } from "@testing-library/react";
import type { CountryCode } from "../types";
import Poster, { layoutSheet } from "./Poster";

const codes = (list: string) => list.split(" ") as CountryCode[];

const fill = (code: string) =>
	document.querySelector(`path[data-code="${code}"]`)?.getAttribute("fill");

it("prints one person's stamps under their map", () => {
	render(
		<Poster spec={{ size: "30x40", visited: codes("IT FR"), name: "Ada" }} />,
	);
	expect(screen.getByRole("img")).toHaveAccessibleName("Poster: Ada’s stamps");
	expect(fill("IT")).toBe("#1d4e9e");
	expect(fill("JP")).toBe("#dce2ea");
	expect(screen.getByText("Italia")).toBeInTheDocument();
	expect(screen.getByText("2 countries")).toBeInTheDocument();
});

it("prints two maps together like the shared comparison", () => {
	render(
		<Poster
			spec={{
				size: "50x70",
				visited: codes("IT JP"),
				with: codes("IT FR"),
				name: "Ada",
				partner: "Bo",
			}}
		/>,
	);
	expect(screen.getByRole("img")).toHaveAccessibleName("Poster: Ada & Bo");
	expect(fill("IT")).toBe("#2e7d5b");
	expect(fill("JP")).toBe("#1d4e9e");
	expect(fill("FR")).toBe("#d42a35");
	// Stamps only one of them has carry their initial
	expect(screen.getByText("A")).toBeInTheDocument();
	expect(screen.getByText("B")).toBeInTheDocument();
	expect(screen.getByText("3 countries")).toBeInTheDocument();
});

it("falls back to a generic title and can leave the map off", () => {
	render(
		<Poster
			spec={{
				size: "30x40",
				visited: codes("IT"),
				map: false,
				subtitle: "Since 2019",
			}}
		/>,
	);
	expect(screen.getByRole("img")).toHaveAccessibleName("Poster: My stamps");
	expect(fill("IT")).toBeUndefined();
	expect(screen.getByText("Since 2019")).toBeInTheDocument();
});

describe("layoutSheet", () => {
	it("makes few stamps big, up to the cap", () => {
		expect(layoutSheet(2, 200, 200, 5, 50)).toEqual({ cols: 1, width: 50 });
	});

	it("fits every stamp in the space", () => {
		const { cols, width } = layoutSheet(195, 260, 150, 2, 50);
		const rows = Math.ceil(195 / cols);
		expect(rows * width * 1.2 + (rows - 1) * 2).toBeLessThanOrEqual(150);
		expect(cols * width + (cols - 1) * 2).toBeLessThanOrEqual(260);
	});
});
