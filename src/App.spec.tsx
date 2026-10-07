import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

const { authCallback, db } = vi.hoisted(() => ({
	authCallback: { current: null as null | ((e: string, s: unknown) => void) },
	db: {
		loadCountries: vi.fn(),
		addCountries: vi.fn(),
		removeCountry: vi.fn(),
		loadProfile: vi.fn(),
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

const signedOut = async () => {
	await act(async () => {
		authCallback.current?.("INITIAL_SESSION", null);
		await new Promise((r) => setTimeout(r, 0));
	});
};

beforeEach(() => {
	vi.clearAllMocks();
	db.loadProfile.mockResolvedValue(null);
	localStorage.clear();
});

it("renders the header", () => {
	render(<App />);
	expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
		"Where have you been?",
	);
});

it("waits for the stored session before showing the signed-out state", async () => {
	render(<App />);
	expect(screen.queryByRole("button", { name: /sign in/i })).toBeNull();
	await signedOut();
	expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
});

it("saves to localStorage when signed out", async () => {
	render(<App />);
	await signedOut();
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
		"Couldn't load your stamps",
	);
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(db.addCountries).not.toHaveBeenCalled();
	expect(db.removeCountry).not.toHaveBeenCalled();
});

it("celebrates a completed collection", async () => {
	render(<App />);
	await signedOut();
	const search = screen.getByRole("combobox");
	await userEvent.type(search, "estonia{Enter}");
	await userEvent.type(search, "latvia{Enter}");
	const banner = () => screen.queryByText("Baltic states: complete");
	expect(banner()).not.toBeInTheDocument();
	await userEvent.type(search, "lithuania{Enter}");
	expect(banner()).toBeInTheDocument();
	await userEvent.click(banner() as HTMLElement);
	expect(banner()).toBeInTheDocument();
	await userEvent.click(document.body);
	expect(banner()).not.toBeInTheDocument();
});

it("nudges anonymous users with many stamps to sign in", async () => {
	localStorage.setItem(
		"visitedCountries",
		JSON.stringify("IT FR ES PT DE AT CH BE NL LU".split(" ")),
	);
	render(<App />);
	await signedOut();
	expect(screen.getByText(/only saved in this browser/)).toBeInTheDocument();
	await userEvent.click(screen.getByRole("button", { name: "Not now" }));
	expect(screen.queryByText(/only saved in this browser/)).toBeNull();
	expect(localStorage.getItem("signInNudgeDismissed")).toBe("1");
});

it("links back to the last shared map until forgotten", async () => {
	localStorage.setItem("lastSharedMap", "/?visited=IT.FR&name=Luca");
	render(<App />);
	expect(
		screen.getByRole("link", { name: "Compare with the map you were sent" }),
	).toHaveAttribute("href", "/?visited=IT.FR&name=Luca");
	await userEvent.click(screen.getByRole("button", { name: "Forget it" }));
	expect(screen.queryByText("Compare with the map you were sent")).toBeNull();
	expect(localStorage.getItem("lastSharedMap")).toBeNull();
});

it("shows the account's cached countries while the session is restored", async () => {
	localStorage.setItem("accountCountries", '["IT","FR"]');
	render(<App />);
	expect(
		screen.getByRole("button", { name: "Remove Italy" }),
	).toBeInTheDocument();
	await signedOut();
	expect(screen.queryByRole("button", { name: "Remove Italy" })).toBeNull();
	expect(localStorage.getItem("accountCountries")).toBeNull();
});

it("caches the account's countries once loaded", async () => {
	db.loadCountries.mockResolvedValue(["JP"]);
	render(<App />);
	await signIn();
	expect(localStorage.getItem("accountCountries")).toBe('["JP"]');
});

it("undoes the last stamp from the toast", async () => {
	render(<App />);
	await signedOut();
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(screen.getByText(/Added Italy/)).toBeInTheDocument();
	await userEvent.click(screen.getByRole("button", { name: "Undo" }));
	expect(localStorage.getItem("visitedCountries")).toBeNull();
	expect(screen.queryByText(/Added Italy/)).toBeNull();
});

it("saves a quick add then remove in order", async () => {
	db.loadCountries.mockResolvedValue([]);
	let finishAdd = () => {};
	db.addCountries.mockReturnValue(
		new Promise<void>((resolve) => {
			finishAdd = resolve;
		}),
	);
	db.removeCountry.mockResolvedValue(undefined);
	render(<App />);
	await signIn();
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	await userEvent.click(screen.getByRole("button", { name: "Remove Italy" }));
	expect(db.removeCountry).not.toHaveBeenCalled();
	await act(async () => finishAdd());
	expect(db.removeCountry).toHaveBeenCalledWith("user-1", "IT");
});

it("shares /@username when the profile is public", async () => {
	const user = userEvent.setup();
	db.loadCountries.mockResolvedValue(["IT", "FR"]);
	db.loadProfile.mockResolvedValue({ username: "ada", isPublic: true });
	render(<App />);
	await signIn();
	await user.click(screen.getByRole("button", { name: "Share map" }));
	expect(await navigator.clipboard.readText()).toBe(`${location.origin}/@ada`);
});

it("shares a snapshot link when the profile is private", async () => {
	const user = userEvent.setup();
	db.loadCountries.mockResolvedValue(["IT", "FR"]);
	db.loadProfile.mockResolvedValue({ username: "ada", isPublic: false });
	render(<App />);
	await signIn();
	await user.click(screen.getByRole("button", { name: "Share map" }));
	expect(await navigator.clipboard.readText()).toBe(
		`${location.origin}/?visited=FR.IT`,
	);
});

it("sends the empty stamp slot to the search", async () => {
	render(<App />);
	await signedOut();
	await userEvent.click(screen.getByRole("button", { name: /Add a stamp/ }));
	expect(screen.getByRole("combobox")).toHaveFocus();
});

it("hides printing until the shop opens", async () => {
	vi.stubEnv("VITE_PRINT", "0");
	render(<App />);
	await signedOut();
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(screen.queryByRole("link", { name: "Print" })).toBeNull();
	vi.unstubAllEnvs();
});

it("links to printing once there's a stamp", async () => {
	vi.stubEnv("VITE_PRINT", "1");
	render(<App />);
	await signedOut();
	expect(screen.queryByRole("link", { name: "Print" })).toBeNull();
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	expect(screen.getByRole("link", { name: "Print" })).toHaveAttribute(
		"href",
		"/print?visited=IT",
	);
	vi.unstubAllEnvs();
});

it("draws the stamps in the chosen style and remembers it", async () => {
	vi.stubEnv("VITE_PRINT", "1");
	const { unmount } = render(<App />);
	await signedOut();
	expect(
		screen.queryByRole("radiogroup", { name: "Stamp style" }),
	).not.toBeInTheDocument();
	await userEvent.type(screen.getByRole("combobox"), "italy{Enter}");
	await userEvent.click(screen.getByRole("radio", { name: "Native name" }));
	expect(screen.getByRole("link", { name: "Print" })).toHaveAttribute(
		"href",
		"/print?visited=IT&style=type",
	);
	unmount();
	render(<App />);
	await signedOut();
	expect(screen.getByRole("radio", { name: "Native name" })).toBeChecked();
	vi.unstubAllEnvs();
});

it("remembers a manual dark mode choice", async () => {
	render(<App />);
	await userEvent.click(
		screen.getByRole("button", { name: "Switch to dark mode" }),
	);
	expect(document.documentElement.dataset.theme).toBe("dark");
	expect(localStorage.getItem("theme")).toBe("dark");
	expect(
		screen.getByRole("button", { name: "Switch to light mode" }),
	).toBeInTheDocument();
	delete document.documentElement.dataset.theme;
});
