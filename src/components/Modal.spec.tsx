import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Modal from "./Modal";

describe("Modal Component", () => {
	it("opens as a modal dialog", () => {
		render(
			<Modal onClose={vi.fn()}>
				<div data-testid="content">foo</div>
			</Modal>,
		);
		expect(screen.getByRole("dialog")).toHaveAttribute("open");
		expect(screen.getByTestId("content")).toBeVisible();
	});

	it("calls onClose from the close button", async () => {
		const onClose = vi.fn();
		render(
			<Modal onClose={onClose}>
				<div>foo</div>
			</Modal>,
		);
		await userEvent.click(screen.getByRole("button", { name: "Close" }));
		expect(onClose).toHaveBeenCalled();
	});
});
