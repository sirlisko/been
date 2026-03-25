import { act, render, screen } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import { vi } from "vitest";

vi.mock("./lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
			signOut: vi.fn(),
		},
	},
}));

import App from "./App";

it("renders without crashing", async () => {
	const div = document.createElement("div");
	const root = createRoot(div);
	await act(async () => {
		root.render(<App />);
	});
	root.unmount();
});

describe("App Component", () => {
	it("should render properly", async () => {
		await act(async () => {
			render(<App />);
		});
		expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Been.");
	});
});
