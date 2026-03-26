import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import Modal from "./Modal";

describe("Modal Component", () => {
	const props = {
		isModalOpen: true,
		onClose: vi.fn(),
	};

	it("should render properly", () => {
		render(
			<Modal {...props}>
				<div data-testid="content">foo</div>
			</Modal>,
		);
		expect(screen.getByTestId("content")).toBeVisible();
	});

	it("should NOT render if isModalOpen is false", () => {
		render(
			<Modal {...props} isModalOpen={false}>
				<div data-testid="content">foo</div>
			</Modal>,
		);
		expect(screen.queryByTestId("content")).not.toBeInTheDocument();
	});
});
