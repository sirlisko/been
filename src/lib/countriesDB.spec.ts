import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CountryCode } from "../types";

const { mockSelectEq, mockUpsert, mockDeleteEq } = vi.hoisted(() => ({
	mockSelectEq: vi.fn(),
	mockUpsert: vi.fn(),
	mockDeleteEq: vi.fn(),
}));

vi.mock("./supabase", () => ({
	supabase: {
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({ eq: mockSelectEq }),
			upsert: mockUpsert,
			delete: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({ eq: mockDeleteEq }),
			}),
		}),
	},
}));

import { addCountries, loadCountries, removeCountry } from "./countriesDB";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("loadCountries", () => {
	it("returns the codes of the user's rows", async () => {
		mockSelectEq.mockResolvedValue({
			data: [{ code: "US" }, { code: "FR" }],
			error: null,
		});
		await expect(loadCountries("user-1")).resolves.toEqual(["US", "FR"]);
	});

	it("throws on database errors", async () => {
		const err = { code: "PGRST301", message: "Unauthorized" };
		mockSelectEq.mockResolvedValue({ data: null, error: err });
		await expect(loadCountries("user-1")).rejects.toEqual(err);
	});
});

describe("addCountries", () => {
	it("upserts one row per country, ignoring duplicates", async () => {
		mockUpsert.mockResolvedValue({ error: null });
		await addCountries("user-1", ["US", "FR"] as CountryCode[]);
		expect(mockUpsert).toHaveBeenCalledWith(
			[
				{ user_id: "user-1", code: "US" },
				{ user_id: "user-1", code: "FR" },
			],
			{ onConflict: "user_id,code", ignoreDuplicates: true },
		);
	});

	it("throws when the upsert fails", async () => {
		const err = { code: "500", message: "Internal error" };
		mockUpsert.mockResolvedValue({ error: err });
		await expect(addCountries("user-1", [])).rejects.toEqual(err);
	});
});

describe("removeCountry", () => {
	it("deletes the row", async () => {
		mockDeleteEq.mockResolvedValue({ error: null });
		await removeCountry("user-1", "US" as CountryCode);
		expect(mockDeleteEq).toHaveBeenCalledWith("code", "US");
	});

	it("throws when the delete fails", async () => {
		const err = { code: "500", message: "Internal error" };
		mockDeleteEq.mockResolvedValue({ error: err });
		await expect(removeCountry("user-1", "US" as CountryCode)).rejects.toEqual(
			err,
		);
	});
});
