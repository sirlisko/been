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
			screen.getByRole("combobox", { name: "Search countries" }),
		).toBeInTheDocument();
	});

	it("calls onChange with each typed character", async () => {
		const onChange = vi.fn();
		render(<CountrySearch {...defaultProps} onChange={onChange} />);
		await userEvent.type(screen.getByRole("combobox"), "it");
		expect(onChange).toHaveBeenCalledWith("i");
		expect(onChange).toHaveBeenCalledWith("t");
	});

	it("shows results when focused", async () => {
		render(
			<CountrySearch
				{...defaultProps}
				value="it"
				results={["IT", "FR"] as CountryCode[]}
			/>,
		);
		await userEvent.click(screen.getByRole("combobox"));
		expect(screen.getAllByRole("option")).toHaveLength(2);
	});

	it("selects a clicked result and clears the query", async () => {
		const onSelect = vi.fn();
		const onChange = vi.fn();
		render(
			<CountrySearch
				{...defaultProps}
				value="ital"
				results={["IT"] as CountryCode[]}
				onSelect={onSelect}
				onChange={onChange}
			/>,
		);
		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.click(screen.getByRole("option", { name: /italy/i }));
		expect(onSelect).toHaveBeenCalledWith("IT");
		expect(onChange).toHaveBeenCalledWith("");
	});

	it("selects with arrow keys and Enter", async () => {
		const onSelect = vi.fn();
		render(
			<CountrySearch
				{...defaultProps}
				value="a"
				results={["IT", "FR"] as CountryCode[]}
				onSelect={onSelect}
			/>,
		);
		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.keyboard("{ArrowDown}{Enter}");
		expect(onSelect).toHaveBeenCalledWith("FR");
	});

	it("marks already-selected countries", async () => {
		render(
			<CountrySearch
				{...defaultProps}
				value="ital"
				results={["IT"] as CountryCode[]}
				selected={["IT"] as CountryCode[]}
			/>,
		);
		await userEvent.click(screen.getByRole("combobox"));
		expect(screen.getByText("visited")).toBeInTheDocument();
	});
});
