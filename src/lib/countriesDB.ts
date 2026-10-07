import type { CountryCode } from "../types";
import { migrateCodes } from "../utils/countries";
import { supabase } from "./supabase";

function db() {
	if (!supabase) throw new Error("Supabase is not configured");
	return supabase.from("user_countries");
}

export async function loadCountries(userId: string): Promise<CountryCode[]> {
	const { data, error } = await db().select("code").eq("user_id", userId);
	if (error) throw error;
	return migrateCodes(data.map((row) => row.code as CountryCode));
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

// Mirrors the check on profiles.username
export const USERNAME_PATTERN = /^[a-z0-9_-]{3,20}$/;

export class UsernameTakenError extends Error {}

export interface Profile {
	username: string;
	isPublic: boolean;
}

export async function loadProfile(userId: string): Promise<Profile | null> {
	if (!supabase) throw new Error("Supabase is not configured");
	const { data, error } = await supabase
		.from("profiles")
		.select("username, is_public")
		.eq("user_id", userId)
		.maybeSingle();
	if (error) throw error;
	return data && { username: data.username, isPublic: data.is_public };
}

// null removes the profile, freeing the username
export async function saveProfile(
	userId: string,
	profile: Profile | null,
): Promise<void> {
	if (!supabase) throw new Error("Supabase is not configured");
	const profiles = supabase.from("profiles");
	const { error } = profile
		? await profiles.upsert({
				user_id: userId,
				username: profile.username,
				is_public: profile.isPublic,
			})
		: await profiles.delete().eq("user_id", userId);
	if (error?.code === "23505") throw new UsernameTakenError();
	if (error) throw error;
}

// null when nobody has this username, or their map is private
export async function loadPublicMap(
	username: string,
): Promise<CountryCode[] | null> {
	if (!supabase) throw new Error("Supabase is not configured");
	const { data, error } = await supabase.rpc("public_map", { name: username });
	if (error) throw error;
	return data && migrateCodes(data);
}
