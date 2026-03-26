import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Stats from "./Stats";

describe("Stats", () => {
	it("shows the visited count", () => {
		render(<Stats count={10} />);
		expect(screen.getByText(/10/)).toBeInTheDocument();
	});

	it("shows the correct percentage of the world", () => {
		// 10 / 195 * 100 = 5.1%
		render(<Stats count={10} />);
		expect(screen.getByText(/5\.1%/)).toBeInTheDocument();
	});

	it("shows 0.0% when no countries are visited", () => {
		render(<Stats count={0} />);
		expect(screen.getByText(/0\.0%/)).toBeInTheDocument();
	});

	it("shows 100.0% when all countries are visited", () => {
		render(<Stats count={195} />);
		expect(screen.getByText(/100\.0%/)).toBeInTheDocument();
	});
});
