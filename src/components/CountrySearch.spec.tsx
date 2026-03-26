import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CountryCode } from "../types";
import CountrySearch from "./CountrySearch";

const defaultProps = {
	value: "",
	onChange: vi.fn(),
	results: [],
	selected: [],
	onSelect: vi.fn(),
};

describe("CountrySearch", () => {
	it("renders the search input", () => {
		render(<CountrySearch {...defaultProps} />);
		expect(
			screen.getByPlaceholderText("Search countries..."),
		).toBeInTheDocument();
	});

	it("shows the current value", () => {
		render(<CountrySearch {...defaultProps} value="france" />);
		expect(screen.getByDisplayValue("france")).toBeInTheDocument();
	});

	it("calls onChange with each typed character", async () => {
		const onChange = vi.fn();
		render(<CountrySearch {...defaultProps} onChange={onChange} />);
		await userEvent.type(screen.getByRole("textbox"), "it");
		expect(onChange).toHaveBeenCalledWith("i");
		expect(onChange).toHaveBeenCalledWith("t");
	});

	it("shows dropdown results when focused and results are provided", async () => {
		render(
			<CountrySearch
				{...defaultProps}
				value="it"
				results={["IT", "FR"] as CountryCode[]}
			/>,
		);
		await userEvent.click(screen.getByRole("textbox"));
		expect(screen.getByRole("list")).toBeInTheDocument();
	});

	it("calls onSelect when a result is clicked", async () => {
		const onSelect = vi.fn();
		render(
			<CountrySearch
				{...defaultProps}
				value="ital"
				results={["IT"] as CountryCode[]}
				onSelect={onSelect}
			/>,
		);
		await userEvent.click(screen.getByRole("textbox"));
		await userEvent.click(screen.getByRole("button", { name: /italy/i }));
		expect(onSelect).toHaveBeenCalledWith("IT");
	});

	it("marks already-selected countries with a checkmark", async () => {
		render(
			<CountrySearch
				{...defaultProps}
				value="ital"
				results={["IT"] as CountryCode[]}
				selected={["IT"] as CountryCode[]}
			/>,
		);
		await userEvent.click(screen.getByRole("textbox"));
		expect(screen.getByText("✓")).toBeInTheDocument();
	});
});
