import countriesShapes, {
	HEIGHT,
	VIEW_BOX,
	WIDTH,
} from "world-map-country-shapes";
import type { CountryCode } from "../types";
import { countStates, sortByName } from "../utils/countries";
import type { Flags } from "../utils/flagArt";
import { fillFor } from "../utils/mapFill";
import {
	BORDERS,
	type PosterSpec,
	SIZES,
	posterCountries,
} from "../utils/poster";
import {
	BLUE,
	BODY,
	DISPLAY,
	MUTED,
	PAPER,
	PRINT_FILL,
	RED,
} from "../utils/posterTheme";
import PosterStamp, { STAMP_RATIO } from "./PosterStamp";

interface Sheet {
	cols: number;
	width: number;
}

// The largest stamps that fit the space, in as few rows as that allows
export function layoutSheet(
	count: number,
	width: number,
	height: number,
	gap: number,
	maxWidth: number,
): Sheet {
	let best: Sheet = { cols: count, width: 0 };
	for (let cols = 1; cols <= count; cols++) {
		const w = Math.min(maxWidth, (width - (cols - 1) * gap) / cols);
		const rows = Math.ceil(count / cols);
		if (rows * w * STAMP_RATIO + (rows - 1) * gap <= height && w >= best.width)
			best = { cols, width: w };
	}
	return best;
}

interface Props {
	spec: PosterSpec;
	// The flag artwork the shape and frame stamps need; loaded by the page
	flags?: Flags;
	className?: string;
}

// Splits two lists like SharedMap's comparison: [both, only the first, only the second]
function split(a: CountryCode[], b: CountryCode[]) {
	const inA = new Set(a);
	const inB = new Set(b);
	return [
		a.filter((c) => inB.has(c)),
		a.filter((c) => !inB.has(c)),
		b.filter((c) => !inA.has(c)),
	];
}

// `strength` of `colour` over `ground`, as a solid hex
function mix(colour: string, ground: string, strength: number) {
	const channel = (hex: string, i: number) =>
		Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
	return `#${[0, 1, 2]
		.map((i) =>
			Math.round(
				channel(colour, i) * strength + channel(ground, i) * (1 - strength),
			)
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")}`;
}

const initial = (name: string) => [...name.trim()][0]?.toUpperCase() ?? "";

const Poster = ({ spec, flags = {}, className }: Props) => {
	const { width: W, height: H } = SIZES[spec.size];
	const { width: border, stripe, strength } = BORDERS[spec.border ?? "bold"];
	// Mixed as solid colours rather than drawn translucent, so the printer gets exact inks
	const red = mix(RED, PAPER, strength);
	const blue = mix(BLUE, PAPER, strength);
	const pad = W * 0.065;
	const left = border + pad;
	const inner = W - left * 2;

	const together = spec.with;
	const [both, onlyVisited, onlyWith] = together
		? split(spec.visited, together)
		: [[], spec.visited, []];
	const all = posterCountries(spec);
	const { count } = countStates(all);
	const showMap = spec.map !== false;

	const name = spec.name ?? (together ? "You" : undefined);
	const partner = spec.partner ?? "Them";
	const title = together ? `${name} & ${partner}` : (name ?? "My stamps");
	const titleSize = Math.min(W * 0.095, (inner * 0.72) / (title.length * 0.52));
	const subtitleSize = W * 0.028;
	const labelSize = W * 0.024;

	const titleY = border + pad + titleSize * 0.85;
	const subtitleY = titleY + subtitleSize * 1.9;
	const headerBottom = (spec.subtitle ? subtitleY : titleY) + W * 0.045;

	const mapHeight = showMap ? (inner * HEIGHT) / WIDTH : 0;
	const mapY = headerBottom;
	const sheetTop = mapY + mapHeight + (showMap ? W * 0.04 : 0);
	const legendHeight = together ? labelSize * 2.6 : 0;
	const sheetBottom = H - border - pad - legendHeight;

	const stamps: {
		code: CountryCode;
		faded?: boolean;
		mark?: string;
		markFill?: string;
	}[] = together
		? [
				...sortByName(both).map((code) => ({ code })),
				...sortByName(onlyVisited).map((code) => ({
					code,
					faded: true,
					mark: initial(name ?? ""),
					markFill: PRINT_FILL.selected,
				})),
				...sortByName(onlyWith).map((code) => ({
					code,
					faded: true,
					mark: initial(partner),
					markFill: PRINT_FILL.highlighted,
				})),
			]
		: sortByName(spec.visited).map((code) => ({ code }));
	const gap = W * 0.018;
	const sheet = layoutSheet(
		stamps.length,
		inner,
		sheetBottom - sheetTop,
		gap,
		// Few stamps can afford to be big; a long list gets the standard size
		W * (stamps.length <= 4 ? 0.24 : 0.17),
	);
	const rows = Math.ceil(stamps.length / sheet.cols);
	const sheetHeight = rows * sheet.width * STAMP_RATIO + (rows - 1) * gap;
	// Centre the sheet in the space left, so short lists don't float at the top
	const sheetY =
		sheetTop + Math.max(0, (sheetBottom - sheetTop - sheetHeight) / 2);

	// Label widths are estimated: SVG text can't be measured before it renders
	const swatch = labelSize * 0.9;
	const legendY = H - border - pad;
	let legendX = left;
	const legend = (
		[
			["shared", "Both"],
			["selected", `Only ${name}`],
			["highlighted", `Only ${partner}`],
		] as const
	).map(([key, label]) => {
		const x = legendX;
		legendX += swatch * 1.5 + label.length * labelSize * 0.5 + labelSize * 1.6;
		return { fill: key, label, x };
	});

	// The airmail edge: red, paper, blue, paper, at 45° across the whole sheet
	const diagonal = W + H;
	const stripes = Array.from(
		{ length: Math.ceil((diagonal * 2) / (stripe * 4)) },
		(_, i) => -diagonal + i * stripe * 4,
	);

	const fill = together
		? fillFor({ selected: onlyVisited, highlighted: onlyWith, shared: both })
		: fillFor({ selected: spec.visited });

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className={className}
			role="img"
			aria-label={`Poster: ${title}`}
		>
			{/* Single stripes, not an SVG pattern: Chrome rasterises patterns in the PDF */}
			<rect width={W} height={H} fill={PAPER} />
			<g transform="rotate(45)">
				{stripes.map((x) => (
					<g key={x}>
						<rect
							x={x}
							y={-diagonal}
							width={stripe}
							height={diagonal * 2}
							fill={red}
						/>
						<rect
							x={x + stripe * 2}
							y={-diagonal}
							width={stripe}
							height={diagonal * 2}
							fill={blue}
						/>
					</g>
				))}
			</g>
			<rect
				x={border}
				y={border}
				width={W - border * 2}
				height={H - border * 2}
				fill={PAPER}
			/>

			<text
				x={left}
				y={titleY}
				fill={BLUE}
				fontFamily={DISPLAY}
				fontWeight={800}
				fontSize={titleSize}
				letterSpacing={-titleSize * 0.035}
			>
				{title}
			</text>
			<text
				x={W - left}
				y={titleY}
				textAnchor="end"
				fill={MUTED}
				fontFamily={BODY}
				fontSize={labelSize}
			>
				{count} {count === 1 ? "country" : "countries"}
			</text>
			{spec.subtitle && (
				<text
					x={left}
					y={subtitleY}
					fill={MUTED}
					fontFamily={BODY}
					fontSize={subtitleSize}
				>
					{spec.subtitle}
				</text>
			)}

			{showMap && (
				<svg
					aria-hidden="true"
					x={left}
					y={mapY}
					width={inner}
					height={mapHeight}
					viewBox={VIEW_BOX}
				>
					{countriesShapes.map(({ id, shape }) => (
						<path
							key={id}
							d={shape}
							fill={PRINT_FILL[fill(id as CountryCode)]}
							stroke={PAPER}
							strokeWidth={1.2}
							data-code={id}
						/>
					))}
				</svg>
			)}

			{stamps.map((stamp, i) => {
				const row = Math.floor(i / sheet.cols);
				const inRow = Math.min(sheet.cols, stamps.length - row * sheet.cols);
				const rowWidth = inRow * sheet.width + (inRow - 1) * gap;
				const rowStart = left + (inner - rowWidth) / 2;
				return (
					<PosterStamp
						key={stamp.code}
						{...stamp}
						style={spec.style ?? "ground"}
						paper={PAPER}
						flag={flags[stamp.code]}
						x={rowStart + (i % sheet.cols) * (sheet.width + gap)}
						y={sheetY + row * (sheet.width * STAMP_RATIO + gap)}
						w={sheet.width}
					/>
				);
			})}

			{together && (
				<g fontFamily={BODY} fontSize={labelSize} fill={MUTED}>
					{legend.map(({ fill: key, label, x }) => (
						<g key={key}>
							<rect
								x={x}
								y={legendY - swatch * 0.85}
								width={swatch}
								height={swatch}
								rx={swatch * 0.2}
								fill={PRINT_FILL[key]}
							/>
							<text x={x + swatch * 1.5} y={legendY}>
								{label}
							</text>
						</g>
					))}
					<text x={W - left} y={legendY} textAnchor="end">
						Faded stamps: one of you
					</text>
				</g>
			)}
		</svg>
	);
};

export default Poster;
