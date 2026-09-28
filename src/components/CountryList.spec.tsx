import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CountryCode } from "../types";
import CountryList from "./CountryList";

const us = "US" as CountryCode;
const fr = "FR" as CountryCode;

describe("CountryList", () => {
	it("renders country names sorted alphabetically", () => {
		render(<CountryList countries={[us, fr]} onToggle={vi.fn()} />);
		expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
			"France",
			"United States of America (the)",
		]);
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
		expect(screen.getByRole("button")).toBeDisabled();
	});
});
