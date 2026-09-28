import { render, screen } from "@testing-library/react";
import { beforeEach } from "vitest";
import type { CountryCode } from "../types";
import SharedMap from "./SharedMap";

const codes = (list: string) => list.split(" ") as CountryCode[];

beforeEach(() => localStorage.clear());

it("compares the shared map with the visitor's own stamps", () => {
	localStorage.setItem("visitedCountries", JSON.stringify(codes("IT FR JP")));
	render(<SharedMap countries={codes("IT FR ES PT")} />);
	expect(screen.getByText(/both been to/)).toHaveTextContent(
		"You've both been to 2. They've been to 2 you haven't; you've been to 1 they haven't.",
	);
});

it("skips the comparison for visitors without stamps", () => {
	render(<SharedMap countries={codes("IT FR")} />);
	expect(screen.queryByText(/both been to/)).toBeNull();
});
