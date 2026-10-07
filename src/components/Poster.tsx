import countriesShapes from "world-map-country-shapes";
import type { CountryCode } from "../types";
import { type Collection, completedCollections } from "../utils/collections";
import { TOTAL_COUNTRIES, countStates } from "../utils/countries";
import { type Fill, fillFor } from "../utils/mapFill";
import { type PosterSpec, SIZES, posterCountries } from "../utils/poster";

// The light passport palette, fixed so the print never follows dark mode
const PAPER = "#f3ede2";
const INK = "#1f2a44";
const MUTED = "#6b6457";
const PRINT_FILL: Record<Fill, string> = {
	shared: "#2f6b4f",
	selected: "#b8432f",
	highlighted: "#2b4c8c",
	land: "#e2d9c6",
};

const DISPLAY = '"Fraunces", Georgia, serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

// Same ink cycle and tilt as the stamps in Collections
const STAMP_INKS = [
	PRINT_FILL.highlighted,
	PRINT_FILL.shared,
	PRINT_FILL.selected,
];
const STAMP_TILTS = [-3, 2, -2];
const STAMPS_PER_ROW = 6;
const MAX_STAMPS = STAMPS_PER_ROW * 2;

const Stamp = ({
	collection: { kind, mark },
	x,
	y,
	size,
	index,
}: {
	collection: Pick<Collection, "kind" | "mark">;
	x: number;
	y: number;
	size: number;
	index: number;
}) => {
	const ink = STAMP_INKS[index % STAMP_INKS.length];
	// Shrink to fit inside the inner ring: bold capitals run ~0.75em wide, mono 0.6em
	const markSize = Math.min(size * 0.2, (size * 0.62) / (mark.length * 0.75));
	const kindSize = Math.min(size * 0.08, (size * 0.5) / (kind.length * 0.6));
	return (
		<g
			transform={`translate(${x} ${y}) rotate(${STAMP_TILTS[index % STAMP_TILTS.length]})`}
			fill={ink}
			stroke={ink}
			opacity={0.9}
		>
			<circle r={size / 2} fill="none" strokeWidth={size * 0.04} />
			<circle r={size * 0.41} fill="none" strokeWidth={size * 0.015} />
			<text
				y={-size * 0.17}
				stroke="none"
				textAnchor="middle"
				fontFamily={MONO}
				fontSize={kindSize}
			>
				{kind.toUpperCase()}
			</text>
			<text
				y={markSize * 0.35}
				stroke="none"
				textAnchor="middle"
				fontFamily={DISPLAY}
				fontWeight="bold"
				fontSize={markSize}
			>
				{mark}
			</text>
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

const Poster = ({ spec, className }: Props) => {
	const { width: W, height: H } = SIZES[spec.size];
	const margin = W * 0.08;
	const inner = W - margin * 2;
	const mapHeight = (inner * 1001) / 2000;

	const together = spec.with;
	const [both, onlyVisited, onlyWith] = together
		? split(spec.visited, together)
		: [[], spec.visited, []];
	const all = posterCountries(spec);
	const fill = together
		? fillFor({ selected: onlyWith, highlighted: onlyVisited, shared: both })
		: fillFor({ selected: spec.visited });
	const { count, territories, percentage } = countStates(all);

	const name = spec.name ?? (together ? "You" : undefined);
	const partner = spec.partner ?? "Them";
	const [who, rest] = together
		? [`${name} & ${partner}`, " have been"]
		: name
			? [name, " has been"]
			: // Italicising only the "I" leans it into the apostrophe
				["I've", " been"];
	// Fraunces runs a little over half an em per character
	const titleSize = Math.min(
		W * 0.085,
		inner / ((who.length + rest.length + 6) * 0.55),
	);
	const labelSize = W * 0.018;
	const subtitleSize = titleSize * 0.45;

	const earned = spec.stamps ? completedCollections(all) : [];
	// Past the limit, the last stamp counts the rest
	const stamps =
		earned.length > MAX_STAMPS
			? [
					...earned.slice(0, MAX_STAMPS - 1),
					{ kind: "and", mark: `+${earned.length - MAX_STAMPS + 1}` },
				]
			: earned;
	const stampCell = inner / STAMPS_PER_ROW;
	const stampRows = Math.ceil(stamps.length / STAMPS_PER_ROW);

	const statsY = H - margin - (together ? labelSize * 5 : 0);
	const statsTop = statsY - labelSize * 2 - W * 0.06;

	// Label, title, map and stamps sit together, centred above the stats
	const gap = W * 0.06;
	const subtitleHeight = spec.subtitle ? subtitleSize * 1.6 : 0;
	const stampsHeight = stampRows ? gap * 0.5 + stampRows * stampCell : 0;
	const block =
		labelSize * 2 + titleSize + subtitleHeight + gap + mapHeight + stampsHeight;
	const blockY = (margin + statsTop - block) / 2;
	const titleY = blockY + labelSize * 2 + titleSize;
	const mapY = titleY + subtitleHeight + gap;
	const stampsY = mapY + mapHeight + gap * 0.5;

	const stats = [
		{ value: `${count} / ${TOTAL_COUNTRIES}`, label: "Countries" },
		{ value: `${percentage}%`, label: "Of the world" },
		...(territories > 0
			? [
					{
						value: String(territories),
						label: territories === 1 ? "Territory" : "Territories",
					},
				]
			: []),
	];
	// Figures run about half an em per character; keep the columns apart
	const statSize = Math.min(
		W * 0.06,
		(inner / 3 - W * 0.03) /
			(Math.max(...stats.map((s) => s.value.length)) * 0.5),
	);
	const legend = together
		? [
				{ fill: PRINT_FILL.shared, label: `Both · ${both.length}` },
				{
					fill: PRINT_FILL.highlighted,
					label: `Only ${name} · ${onlyVisited.length}`,
				},
				{
					fill: PRINT_FILL.selected,
					label: `Only ${partner} · ${onlyWith.length}`,
				},
			]
		: [];

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			className={className}
			role="img"
			aria-label={`Poster: where ${who}${rest}`}
		>
			<rect width={W} height={H} fill={PAPER} />
			<rect
				x={margin / 2}
				y={margin / 2}
				width={W - margin}
				height={H - margin}
				fill="none"
				stroke={INK}
				strokeWidth={W * 0.002}
			/>
			<rect
				x={margin / 2 + W * 0.006}
				y={margin / 2 + W * 0.006}
				width={W - margin - W * 0.012}
				height={H - margin - W * 0.012}
				fill="none"
				stroke={INK}
				strokeWidth={W * 0.001}
			/>

			<text
				x={margin}
				y={blockY + labelSize}
				fill={MUTED}
				fontFamily={MONO}
				fontSize={labelSize}
				letterSpacing={labelSize * 0.18}
			>
				THE WORLD · {new Date().getFullYear()}
			</text>
			<text
				x={margin}
				y={titleY}
				fill={INK}
				fontFamily={DISPLAY}
				fontSize={titleSize}
			>
				Where{" "}
				<tspan fill={PRINT_FILL.selected} fontStyle="italic">
					{who}
				</tspan>
				{rest}
			</text>
			{spec.subtitle && (
				<text
					x={margin}
					y={titleY + subtitleHeight}
					fill={MUTED}
					fontFamily={DISPLAY}
					fontStyle="italic"
					fontSize={subtitleSize}
				>
					{spec.subtitle}
				</text>
			)}

			<svg
				aria-hidden="true"
				x={margin}
				y={mapY}
				width={inner}
				height={mapHeight}
				viewBox="0 0 2000 1001"
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

			{stamps.map((collection, i) => {
				const row = Math.floor(i / STAMPS_PER_ROW);
				const inRow = Math.min(
					STAMPS_PER_ROW,
					stamps.length - row * STAMPS_PER_ROW,
				);
				const rowStart = margin + (inner - inRow * stampCell) / 2;
				return (
					<Stamp
						key={collection.mark}
						collection={collection}
						x={rowStart + ((i % STAMPS_PER_ROW) + 0.5) * stampCell}
						y={stampsY + (row + 0.5) * stampCell}
						size={stampCell * 0.82}
						index={i}
					/>
				);
			})}

			{stats.map(({ value, label }, i) => {
				const x = margin + (inner / 3) * i;
				return (
					<g key={label}>
						<text
							x={x}
							y={statsY - labelSize * 2}
							fill={INK}
							fontFamily={DISPLAY}
							fontSize={statSize}
						>
							{value}
						</text>
						<text
							x={x}
							y={statsY}
							fill={MUTED}
							fontFamily={MONO}
							fontSize={labelSize}
							letterSpacing={labelSize * 0.18}
						>
							{label.toUpperCase()}
						</text>
					</g>
				);
			})}

			{legend.map(({ fill: swatch, label }, i) => {
				const x = margin + (inner / 3) * i;
				const y = H - margin - labelSize;
				return (
					<g key={label}>
						<rect
							x={x}
							y={y - labelSize * 0.85}
							width={labelSize}
							height={labelSize}
							fill={swatch}
						/>
						<text
							x={x + labelSize * 1.6}
							y={y}
							fill={INK}
							fontFamily={MONO}
							fontSize={labelSize}
							letterSpacing={labelSize * 0.1}
						>
							{label.toUpperCase()}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

export default Poster;
