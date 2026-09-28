import { parseShareName, shareMeta } from "../../src/utils/shareMeta.ts";

declare const Netlify: { env: { get: (key: string) => string | undefined } };

// Link previews for /@username need the codes, which only live in the database
async function publicMap(username: string): Promise<string | null> {
	const url = Netlify.env.get("VITE_SUPABASE_URL");
	const key = Netlify.env.get("VITE_SUPABASE_ANON_KEY");
	if (!url || !key) return null;
	try {
		const response = await fetch(`${url}/rest/v1/rpc/public_map`, {
			method: "POST",
			headers: {
				apikey: key,
				Authorization: `Bearer ${key}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: username }),
		});
		if (!response.ok) return null;
		const codes: string[] | null = await response.json();
		return codes?.join(".") ?? null;
	} catch {
		return null;
	}
}

export default async (
	request: Request,
	context: { next: () => Promise<Response> },
) => {
	const url = new URL(request.url);
	const username = url.pathname.match(/^\/@([\w-]{3,20})\/?$/)?.[1];
	const [response, visited] = await Promise.all([
		context.next(),
		username
			? publicMap(username.toLowerCase())
			: Promise.resolve(url.searchParams.get("visited")),
	]);
	if (!visited) return response;
	const headers = new Headers(response.headers);
	headers.delete("content-length");
	return new Response(
		shareMeta(
			await response.text(),
			visited,
			username ?? parseShareName(url.searchParams.get("name")),
		),
		{
			status: response.status,
			headers,
		},
	);
};

export const config = { path: ["/", "/@*"] };
