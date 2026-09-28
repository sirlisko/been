import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

const { authCallback, db } = vi.hoisted(() => ({
	authCallback: { current: null as null | ((e: string, s: unknown) => void) },
	db: {
		loadCountries: vi.fn(),
		addCountries: vi.fn(),
		removeCountry: vi.fn(),
	},
}));

vi.mock("./lib/supabase", () => ({
	supabase: {
		auth: {
			onAuthStateChange: vi.fn((cb) => {
				authCallback.current = cb;
				return { data: { subscription: { unsubscribe: vi.fn() } } };
			}),
			signOut: vi.fn(),
		},
	},
}));
vi.mock("./lib/countriesDB", () => db);

import App from "./App";

const signIn = async () => {
	await act(async () => {
		authCallback.current?.("INITIAL_SESSION", { user: { id: "user-1" } });
		await new Promise((r) => setTimeout(r, 0));
	});
};

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
});

it("renders the header", () => {
	render(<App />);
	expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Been.");
});

it("saves to localStorage when signed out", async () => {
	render(<App />);
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(localStorage.getItem("visitedCountries")).toBe('["IT"]');
});

it("adds a single country for signed-in users", async () => {
	db.loadCountries.mockResolvedValue(["FR"]);
	db.addCountries.mockResolvedValue(undefined);
	render(<App />);
	await signIn();
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(db.addCountries).toHaveBeenCalledWith("user-1", ["IT"]);
});

it("blocks saving when the account's countries failed to load", async () => {
	db.loadCountries.mockRejectedValue(new Error("offline"));
	render(<App />);
	await signIn();
	expect(screen.getByRole("alert")).toHaveTextContent(
		"Couldn't load your countries",
	);
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(db.addCountries).not.toHaveBeenCalled();
	expect(db.removeCountry).not.toHaveBeenCalled();
});
