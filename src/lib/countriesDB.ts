import type { CountryCode } from "../types";
import { supabase } from "./supabase";

export async function loadCountries(userId: string): Promise<CountryCode[]> {
	const { data, error } = await supabase
		.from("visited_countries")
		.select("countries")
		.eq("user_id", userId)
		.single();

	if (error && error.code !== "PGRST116") throw error;

	return (data?.countries as CountryCode[]) ?? [];
}

export async function saveCountries(
	userId: string,
	countries: CountryCode[],
): Promise<void> {
	const { error } = await supabase.from("visited_countries").upsert(
		{
			user_id: userId,
			countries,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "user_id" },
	);

	if (error) throw error;
}
