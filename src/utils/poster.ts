import type Stripe from "stripe";
import type { CountryCode } from "../types";
import { parseShareParam, toShareParam } from "./countries";

export const SIZES = {
	"30x40": { label: "30 × 40 cm", width: 300, height: 400, price: 3500 },
	"50x70": { label: "50 × 70 cm", width: 500, height: 700, price: 5500 },
} as const;

export type PosterSize = keyof typeof SIZES;

// The stamp designs, as drawn in the redesign canvas
export const STAMP_STYLES = {
	ground: "Flag colours",
	shape: "Flag in the country",
	frame: "Flag as the frame",
	type: "Native name",
} as const;

export type StampStyle = keyof typeof STAMP_STYLES;

export const isStampStyle = (style: unknown): style is StampStyle =>
	typeof style === "string" && Object.hasOwn(STAMP_STYLES, style);

// The airmail edge around the poster, in millimetres: the same on every size,
// so the big poster doesn't get a band twice as thick. Subtle mutes the
// stripes towards the paper
export const BORDERS = {
	bold: { label: "Bold", width: 6, stripe: 3, strength: 1 },
	subtle: { label: "Subtle", width: 6, stripe: 3, strength: 0.45 },
} as const;

export type PosterBorder = keyof typeof BORDERS;

const isPosterBorder = (border: unknown): border is PosterBorder =>
	typeof border === "string" && Object.hasOwn(BORDERS, border);

const parseBorder = (border: string | null) =>
	isPosterBorder(border) && border !== "bold" ? border : undefined;

// These draw the real flag, so the page loads flag-icons' artwork for them
export const needsFlags = (style: StampStyle | undefined) =>
	style === "shape" || style === "frame";

// Off until the shop opens; /print itself stays reachable by link
export const printingOpen = () => import.meta.env.VITE_PRINT === "1";

export interface PosterSpec {
	size: PosterSize;
	visited: CountryCode[];
	// Present for a map printed together with someone else's
	with?: CountryCode[];
	name?: string;
	partner?: string;
	subtitle?: string;
	// The world map above the stamps; on unless turned off
	map?: boolean;
	// Flag colours unless chosen
	style?: StampStyle;
	// Bold unless chosen
	border?: PosterBorder;
}

const clean = (max: number) => (text: string | null | undefined) =>
	text?.trim().slice(0, max) || undefined;
export const cleanName = clean(30);
export const cleanSubtitle = clean(50);

export const posterCountries = (spec: PosterSpec): CountryCode[] => [
	...new Set([...spec.visited, ...(spec.with ?? [])]),
];

export const isPosterSize = (size: unknown): size is PosterSize =>
	typeof size === "string" && Object.hasOwn(SIZES, size);

// Prices include UK VAT
export const formatPrice = (cents: number) => `£${cents / 100}`;

// Stripe metadata values cap at 500 chars: 249 codes with dots wouldn't fit,
// packed two letters each they always do
const packCodes = (codes: CountryCode[]) =>
	toShareParam(codes).replace(/\./g, "");

export function parseCodes(param: string | null): CountryCode[] | null {
	if (param === null || param.includes(".") || param.length <= 2)
		return parseShareParam(param);
	return parseShareParam(param.match(/../g)?.join(".") ?? "");
}

const parseStyle = (style: string | null) =>
	isStampStyle(style) && style !== "ground" ? style : undefined;

export function parsePosterParams(params: URLSearchParams): PosterSpec | null {
	const visited = parseCodes(params.get("visited"));
	if (!visited) return null;
	const size = params.get("size");
	return {
		size: isPosterSize(size) ? size : "30x40",
		visited,
		with: parseCodes(params.get("with")) ?? undefined,
		name: cleanName(params.get("name")),
		partner: cleanName(params.get("partner")),
		subtitle: cleanSubtitle(params.get("subtitle")),
		map: params.get("map") !== "0",
		style: parseStyle(params.get("style")),
		border: parseBorder(params.get("border")),
	};
}

export function posterParams(spec: PosterSpec): URLSearchParams {
	const params = new URLSearchParams({
		size: spec.size,
		visited: toShareParam(spec.visited),
	});
	if (spec.with) params.set("with", toShareParam(spec.with));
	if (spec.name) params.set("name", spec.name);
	if (spec.partner) params.set("partner", spec.partner);
	if (spec.subtitle) params.set("subtitle", spec.subtitle);
	if (spec.map === false) params.set("map", "0");
	if (spec.style && spec.style !== "ground") params.set("style", spec.style);
	if (spec.border && spec.border !== "bold") params.set("border", spec.border);
	return params;
}

// UK only to start: EU shipping from a UK company brings IOSS / import VAT
const SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
	["GB"];

// The body comes from the browser, so everything is re-validated here
export function checkoutParams(
	body: unknown,
	origin: string,
): Stripe.Checkout.SessionCreateParams | null {
	if (typeof body !== "object" || body === null) return null;
	const input = body as Record<string, unknown>;
	const str = (key: string) =>
		typeof input[key] === "string" ? (input[key] as string) : null;
	const visited = parseCodes(str("visited"));
	const together = parseCodes(str("with"));
	const size = input.size;
	if (!isPosterSize(size) || !visited?.length) return null;
	const name = cleanName(str("name"));
	const partner = cleanName(str("partner"));
	const subtitle = cleanSubtitle(str("subtitle"));
	const map = str("map") !== "0";
	const style = parseStyle(str("style"));
	const border = parseBorder(str("border"));
	if (together && (!together.length || !name || !partner)) return null;

	const spec: PosterSpec = {
		size,
		visited,
		with: together ?? undefined,
		name,
		partner,
		subtitle,
		map,
		style,
		border,
	};
	const { label, price } = SIZES[size];
	const back = `${origin}/print?${posterParams(spec)}`;
	return {
		mode: "payment",
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: "gbp",
					unit_amount: price,
					product_data: {
						name: `${together ? "Stamps together" : "Stamps"} poster${map ? " with map" : ""}, ${label}`,
					},
				},
			},
		],
		shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
		metadata: {
			size,
			visited: packCodes(visited),
			...(together && { with: packCodes(together) }),
			...(name && { name }),
			...(partner && { partner }),
			...(subtitle && { subtitle }),
			map: map ? "1" : "0",
			style: style ?? "ground",
			border: border ?? "bold",
		},
		success_url: `${back}&ordered=1`,
		cancel_url: back,
	};
}
