import type { CountryCode } from "../types";
import { supabase } from "./supabase";

function db() {
	if (!supabase) throw new Error("Supabase is not configured");
	return supabase.from("user_countries");
}

export async function loadCountries(userId: string): Promise<CountryCode[]> {
	const { data, error } = await db().select("code").eq("user_id", userId);
	if (error) throw error;
	return data.map((row) => row.code as CountryCode);
}

export async function addCountries(
	userId: string,
	codes: CountryCode[],
): Promise<void> {
	const { error } = await db().upsert(
		codes.map((code) => ({ user_id: userId, code })),
		{ onConflict: "user_id,code", ignoreDuplicates: true },
	);
	if (error) throw error;
}

export async function removeCountry(
	userId: string,
	code: CountryCode,
): Promise<void> {
	const { error } = await db().delete().eq("user_id", userId).eq("code", code);
	if (error) throw error;
}
