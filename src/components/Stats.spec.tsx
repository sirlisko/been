import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CountryCode } from "../types";
import { UN_STATES } from "../utils/countries";
import Stats from "./Stats";

const codes = (...c: string[]) => c as CountryCode[];

describe("Stats", () => {
	it("shows the count and percentage of UN states", () => {
		render(<Stats countries={codes("IT", "FR")} />);
		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("1.0%")).toBeInTheDocument();
	});

	it("counts territories separately", () => {
		render(<Stats countries={codes("IT", "GL", "PR")} />);
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("Territories").nextSibling).toHaveTextContent("2");
	});

	it("never exceeds 100%", () => {
		render(<Stats countries={codes(...UN_STATES, "GL", "PR")} />);
		expect(screen.getByText("100.0%")).toBeInTheDocument();
	});
});
