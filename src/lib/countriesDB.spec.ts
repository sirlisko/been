import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CountryCode } from "../types";

const { mockSingle, mockUpsert } = vi.hoisted(() => ({
	mockSingle: vi.fn(),
	mockUpsert: vi.fn(),
}));

vi.mock("./supabase", () => ({
	supabase: {
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					single: mockSingle,
				}),
			}),
			upsert: mockUpsert,
		}),
	},
}));

import { loadCountries, saveCountries } from "./countriesDB";

describe("loadCountries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns empty array when no record exists (PGRST116)", async () => {
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows returned" },
		});
		await expect(loadCountries("user-1")).resolves.toEqual([]);
	});

	it("returns countries when a record exists", async () => {
		const countries = ["US", "FR"] as CountryCode[];
		mockSingle.mockResolvedValue({ data: { countries }, error: null });
		await expect(loadCountries("user-1")).resolves.toEqual(countries);
	});

	it("throws on unexpected database errors", async () => {
		const err = { code: "PGRST301", message: "Unauthorized" };
		mockSingle.mockResolvedValue({ data: null, error: err });
		await expect(loadCountries("user-1")).rejects.toEqual(err);
	});
});

describe("saveCountries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("upserts the country list for the user", async () => {
		mockUpsert.mockResolvedValue({ error: null });
		const countries = ["US", "FR"] as CountryCode[];
		await saveCountries("user-1", countries);
		expect(mockUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ user_id: "user-1", countries }),
			{ onConflict: "user_id" },
		);
	});

	it("includes updated_at in the upsert payload", async () => {
		mockUpsert.mockResolvedValue({ error: null });
		await saveCountries("user-1", []);
		expect(mockUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ updated_at: expect.any(String) }),
			expect.any(Object),
		);
	});

	it("throws when the upsert fails", async () => {
		const err = { code: "500", message: "Internal error" };
		mockUpsert.mockResolvedValue({ error: err });
		await expect(saveCountries("user-1", [])).rejects.toEqual(err);
	});
});
