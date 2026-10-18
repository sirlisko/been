import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { track, trackOnce } from "../lib/analytics";
import type { CountryCode } from "../types";
import PrintPage from "./PrintPage";

vi.mock("../lib/analytics", () => ({ track: vi.fn(), trackOnce: vi.fn() }));

const spec = { size: "30x40" as const, visited: ["IT", "FR"] as CountryCode[] };

afterEach(() => {
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

it("tracks the print page view", () => {
	render(<PrintPage spec={spec} />);
	expect(track).toHaveBeenCalledWith("print_view", { map: "solo" });
});

it("tracks a paid order once per checkout session", () => {
	render(<PrintPage spec={spec} ordered="cs_1" />);
	expect(trackOnce).toHaveBeenCalledWith("cs_1", "order_paid", { map: "solo" });
	expect(track).not.toHaveBeenCalledWith("print_view", expect.anything());
});

it("tracks nothing on the fulfilment view", () => {
	render(<PrintPage spec={spec} fulfil />);
	expect(track).not.toHaveBeenCalled();
	expect(trackOnce).not.toHaveBeenCalled();
});

it("tracks the poster choices when checkout opens", async () => {
	const assign = vi.fn();
	vi.stubGlobal("location", { assign });
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(Response.json({ url: "https://stripe.test" })),
	);
	render(<PrintPage spec={spec} />);
	await userEvent.click(screen.getByRole("button", { name: /^Order for/ }));
	expect(track).toHaveBeenCalledWith("checkout_open", {
		map: "solo",
		size: "30x40",
		style: "ground",
		border: "bold",
		worldMap: "on",
		countries: 2,
	});
	expect(assign).toHaveBeenCalledWith("https://stripe.test");
});
