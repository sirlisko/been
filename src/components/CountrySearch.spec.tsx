import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CountrySearch from "./CountrySearch";

describe("CountrySearch", () => {
	it("renders the search input", () => {
		render(<CountrySearch value="" onChange={vi.fn()} />);
		expect(
			screen.getByPlaceholderText("Search countries..."),
		).toBeInTheDocument();
	});

	it("shows the current value", () => {
		render(<CountrySearch value="france" onChange={vi.fn()} />);
		expect(screen.getByDisplayValue("france")).toBeInTheDocument();
	});

	it("calls onChange with each typed character", async () => {
		const onChange = vi.fn();
		render(<CountrySearch value="" onChange={onChange} />);
		await userEvent.type(screen.getByRole("textbox"), "it");
		expect(onChange).toHaveBeenCalledWith("i");
		expect(onChange).toHaveBeenCalledWith("t");
	});
});
