import { parseShareName, shareMeta } from "../../src/utils/shareMeta.ts";

export default async (
	request: Request,
	context: { next: () => Promise<Response> },
) => {
	const response = await context.next();
	const params = new URL(request.url).searchParams;
	const visited = params.get("visited");
	if (!visited) return response;
	const headers = new Headers(response.headers);
	headers.delete("content-length");
	return new Response(
		shareMeta(
			await response.text(),
			visited,
			parseShareName(params.get("name")),
		),
		{
			status: response.status,
			headers,
		},
	);
};

export const config = { path: "/" };
