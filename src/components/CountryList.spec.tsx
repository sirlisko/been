import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CountryCode } from "../types";
import CountryList from "./CountryList";
import { stampTilt } from "./Stamp";

const us = "US" as CountryCode;
const fr = "FR" as CountryCode;

describe("CountryList", () => {
	it("renders country names sorted alphabetically", () => {
		render(<CountryList countries={[us, fr]} onToggle={vi.fn()} />);
		expect(
			screen.getAllByRole("button").map((b) => b.getAttribute("aria-label")),
		).toEqual(["Remove France", "Remove United States"]);
	});

	it("renders nothing when the list is empty", () => {
		const { container } = render(
			<CountryList countries={[]} onToggle={vi.fn()} />,
		);
		expect(container.querySelectorAll("button")).toHaveLength(0);
	});

	it("calls onToggle with the clicked country", async () => {
		const onToggle = vi.fn();
		render(<CountryList countries={[us, fr]} onToggle={onToggle} />);
		await userEvent.click(screen.getByRole("button", { name: /france/i }));
		expect(onToggle).toHaveBeenCalledExactlyOnceWith(fr);
	});

	it("is read-only without onToggle", () => {
		render(<CountryList countries={[us]} />);
		expect(
			screen.getByRole("button", { name: "United States" }),
		).toBeDisabled();
	});

	it("titles each stamp with the name as the country writes it", () => {
		render(<CountryList countries={["JP" as CountryCode, fr]} />);
		expect(screen.getByText("日本")).toHaveAttribute("lang", "ja-Jpan-JP");
		expect(screen.getByText("Japan")).toBeInTheDocument();
		// Same in English: no second name underneath
		expect(screen.getAllByText("France")).toHaveLength(1);
	});

	it("ends with an extra cell when given one", () => {
		render(<CountryList countries={[fr]} after={<span>Add a stamp</span>} />);
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("tilts each country the same wherever it sits in the list", () => {
		expect(stampTilt(fr)).toBe(stampTilt("FR" as CountryCode));
		const tilts = ["IT", "FR", "JP", "BR", "US", "EG"].map((c) =>
			stampTilt(c as CountryCode),
		);
		expect(new Set(tilts).size).toBeGreaterThan(1);
	});
});
