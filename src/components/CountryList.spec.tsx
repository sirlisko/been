import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CountryCode } from "../types";
import CountryList from "./CountryList";

const us = "US" as CountryCode;
const fr = "FR" as CountryCode;

describe("CountryList", () => {
	it("renders country names", () => {
		render(<CountryList countries={[us, fr]} selected={[]} onToggle={vi.fn()} />);
		expect(screen.getByText("United States of America (the)")).toBeInTheDocument();
		expect(screen.getByText("France")).toBeInTheDocument();
	});

	it("renders nothing when the list is empty", () => {
		const { container } = render(
			<CountryList countries={[]} selected={[]} onToggle={vi.fn()} />,
		);
		expect(container.querySelectorAll("button")).toHaveLength(0);
	});

	it("calls onToggle with the country code when clicked", async () => {
		const onToggle = vi.fn();
		render(<CountryList countries={[us]} selected={[]} onToggle={onToggle} />);
		await userEvent.click(screen.getByRole("button", { name: /united states of america/i }));
		expect(onToggle).toHaveBeenCalledWith(us);
	});

	it("does not call onToggle for a different country", async () => {
		const onToggle = vi.fn();
		render(<CountryList countries={[us, fr]} selected={[]} onToggle={onToggle} />);
		await userEvent.click(screen.getByRole("button", { name: /france/i }));
		expect(onToggle).toHaveBeenCalledWith(fr);
		expect(onToggle).not.toHaveBeenCalledWith(us);
	});
});
