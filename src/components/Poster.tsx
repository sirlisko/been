import countriesShapes, {
	HEIGHT,
	VIEW_BOX,
	WIDTH,
} from "world-map-country-shapes";
import type { CountryCode } from "../types";
import {
	TOTAL_COUNTRIES,
	countStates,
	getCountryName,
	getNativeName,
	sortByName,
} from "../utils/countries";
import { luminance, stampColours } from "../utils/flags";
import { type Fill, fillFor } from "../utils/mapFill";
import { type PosterSpec, SIZES, posterCountries } from "../utils/poster";
import { countryOutline } from "../utils/shapes";

// The light airmail palette, fixed so the print never follows dark mode
const PAPER = "#f6f7f9";
const INK = "#23262e";
const MUTED = "#4a5163";
const BLUE = "#1d4e9e";
const RED = "#d42a35";
const PRINT_FILL: Record<Fill, string> = {
	shared: "#2e7d5b",
	selected: BLUE,
	highlighted: RED,
	land: "#dce2ea",
};

const DISPLAY =
	'"Bricolage Grotesque", "Noto Sans", "Noto Sans JP", "Noto Sans Arabic", system-ui, sans-serif';
const BODY = '"Instrument Sans", system-ui, sans-serif';

// Stamps are 5 wide by 6 tall, like the ones in the app
const STAMP_RATIO = 1.2;
const TILTS = [-1.2, 0.8, 0, -0.6, 1.2];
const COMPACT_SCRIPT = /[֐-ࣿऀ-෿က-႟ሀ-፿぀-鿿가-힯]/;

interface Sheet {
	cols: number;
	width: number;
}

// The most columns' worth of the largest stamps that still fit the space
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
		if (rows * w * STAMP_RATIO + (rows - 1) * gap <= height && w > best.width)
			best = { cols, width: w };
	}
	return best;
}

const PosterStamp = ({
	code,
	x,
	y,
	w,
	faded,
	mark,
}: {
	code: CountryCode;
	x: number;
	y: number;
	w: number;
	faded?: boolean;
	mark?: string;
}) => {
	const h = w * STAMP_RATIO;
	const margin = w * 0.07;
	const { ground, figure, band } = stampColours(code);
	const native = getNativeName(code);
	const english = getCountryName(code);
	const title = native?.name ?? english;
	const outline = countryOutline(code);
	const faceW = w - margin * 2;
	const faceH = h - margin * 2;
	const titleSize = Math.min(
		faceW * (COMPACT_SCRIPT.test(title) ? 0.2 : 0.15),
		(faceW * 0.9) / (title.length * 0.6),
	);
	const hole = w * 0.028;
	const tilt =
		TILTS[(code.charCodeAt(0) * 31 + code.charCodeAt(1) * 7) % TILTS.length];

	return (
		<g
			transform={`translate(${x} ${y}) rotate(${tilt} ${w / 2} ${h / 2})`}
			opacity={faded ? 0.45 : 1}
		>
			<rect width={w} height={h} fill="#fff" />
			{/* Perforations: round dashes of paper colour along the edge bite into it */}
			<rect
				width={w}
				height={h}
				fill="none"
				stroke={PAPER}
				strokeWidth={hole * 2}
				strokeLinecap="round"
				strokeDasharray={`0 ${hole * 3}`}
			/>
			<rect
				x={margin}
				y={margin}
				width={faceW}
				height={faceH}
				fill={ground}
				stroke={luminance(ground) > 0.7 ? "rgba(0,0,0,0.14)" : "none"}
				strokeWidth={w * 0.006}
			/>
			<text
				x={margin + faceW * 0.07}
				y={margin + faceW * 0.07 + titleSize}
				fill={figure}
				fontFamily={DISPLAY}
				fontWeight={800}
				fontSize={titleSize}
				lang={native?.lang ?? "en"}
			>
				{title}
			</text>
			{outline ? (
				<svg
					x={margin + faceW * 0.12}
					y={margin + faceH * 0.3}
					width={faceW * 0.76}
					height={faceH * 0.46}
					viewBox={outline.viewBox}
					aria-hidden="true"
				>
					<path d={outline.path} fill={figure} />
				</svg>
			) : (
				<text
					x={w / 2}
					y={margin + faceH * 0.66}
					textAnchor="middle"
					fill={figure}
					fontFamily={DISPLAY}
					fontWeight={800}
					fontSize={faceW * 0.32}
				>
					{code}
				</text>
			)}
			{native && (
				<text
					x={w / 2}
					y={margin + faceH * 0.88}
					textAnchor="middle"
					fill={figure}
					fontFamily={BODY}
					fontWeight={600}
					fontSize={Math.min(
						faceW * 0.095,
						(faceW * 0.9) / (english.length * 0.55),
					)}
				>
					{english}
				</text>
			)}
			<rect
				x={margin}
				y={margin + faceH * 0.95}
				width={faceW}
				height={faceH * 0.05}
				fill={band}
			/>
			{mark && (
				<g>
					<circle cx={w - margin} cy={margin} r={w * 0.11} fill={INK} />
					<text
						x={w - margin}
						y={margin + w * 0.045}
						textAnchor="middle"
						fill="#fff"
						fontFamily={BODY}
						fontWeight={700}
						fontSize={w * 0.13}
					>
						{mark}
					</text>
				</g>
			)}
		</g>
	);
};

interface Props {
	spec: PosterSpec;
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

const initial = (name: string) => [...name.trim()][0]?.toUpperCase() ?? "";

const Poster = ({ spec, className }: Props) => {
	const { width: W, height: H } = SIZES[spec.size];
	const border = W * 0.035;
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
	const title = together
		? `${name} & ${partner}`
		: name
			? `${name}’s stamps`
			: "My stamps";
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

	const stamps = together
		? [
				...sortByName(both).map((code) => ({ code })),
				...sortByName(onlyVisited).map((code) => ({
					code,
					faded: true,
					mark: initial(name ?? ""),
				})),
				...sortByName(onlyWith).map((code) => ({
					code,
					faded: true,
					mark: initial(partner),
				})),
			]
		: sortByName(spec.visited).map((code) => ({ code }));
	const gap = W * 0.018;
	const sheet = layoutSheet(
		stamps.length,
		inner,
		sheetBottom - sheetTop,
		gap,
		W * 0.17,
	);
	const rows = Math.ceil(stamps.length / sheet.cols);
	const sheetHeight = rows * sheet.width * STAMP_RATIO + (rows - 1) * gap;
	// Centre the sheet in the space left, so short lists don't float at the top
	const sheetY =
		sheetTop + Math.max(0, (sheetBottom - sheetTop - sheetHeight) / 2);

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
			<defs>
				<pattern
					id="airmail"
					width={W * 0.06}
					height={W * 0.06}
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45)"
				>
					<rect width={W * 0.015} height={W * 0.06} fill={RED} />
					<rect
						x={W * 0.015}
						width={W * 0.015}
						height={W * 0.06}
						fill={PAPER}
					/>
					<rect x={W * 0.03} width={W * 0.015} height={W * 0.06} fill={BLUE} />
					<rect
						x={W * 0.045}
						width={W * 0.015}
						height={W * 0.06}
						fill={PAPER}
					/>
				</pattern>
			</defs>
			<rect width={W} height={H} fill="url(#airmail)" />
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
				y={titleY - titleSize * 0.38}
				textAnchor="end"
				fill={MUTED}
				fontFamily={BODY}
				fontSize={labelSize}
			>
				{count} {count === 1 ? "country" : "countries"}
			</text>
			<text
				x={W - left}
				y={titleY}
				textAnchor="end"
				fill={MUTED}
				fontFamily={BODY}
				fontSize={labelSize}
			>
				{TOTAL_COUNTRIES - count} to go
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
						x={rowStart + (i % sheet.cols) * (sheet.width + gap)}
						y={sheetY + row * (sheet.width * STAMP_RATIO + gap)}
						w={sheet.width}
					/>
				);
			})}

			{together && (
				<text
					x={left}
					y={H - border - pad}
					fill={MUTED}
					fontFamily={BODY}
					fontSize={labelSize}
				>
					{`Full colour: both. Faded: only ${name} (${initial(name ?? "")}) or only ${partner} (${initial(partner)}).`}
				</text>
			)}
		</svg>
	);
};

export default Poster;
