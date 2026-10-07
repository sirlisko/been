import Stripe from "stripe";
import { checkoutParams } from "../../src/utils/poster.ts";

export default async (request: Request) => {
	if (request.method !== "POST") return new Response(null, { status: 405 });
	const key = process.env.STRIPE_SECRET_KEY;
	if (!key) return new Response("Printing isn't set up", { status: 503 });

	const params = checkoutParams(
		await request.json().catch(() => null),
		new URL(request.url).origin,
	);
	if (!params) return new Response("Invalid poster", { status: 400 });

	try {
		const session = await new Stripe(key).checkout.sessions.create(params);
		return Response.json({ url: session.url });
	} catch (e) {
		console.error("Creating checkout session failed:", e);
		return new Response("Checkout failed", { status: 502 });
	}
};

export const config = { path: "/api/checkout" };
