import { type ComponentType, useId } from "react";
import type { CountryCode } from "../types";
import { getCountryName, getNativeName } from "../utils/countries";
import type { FlagArt } from "../utils/flagArt";
import { inkOnPaper, luminance, stampColours } from "../utils/flags";
import type { StampStyle } from "../utils/poster";
import { BODY, DISPLAY, INK, MUTED } from "../utils/posterTheme";
import { type Outline, countryOutline } from "../utils/shapes";

// Stamps are 5 wide by 6 tall, like the ones in the app
export const STAMP_RATIO = 1.2;
const TILTS = [-1.2, 0.8, 0, -0.6, 1.2];

// From the code, not the list position, so stamps don't reshuffle as countries are added
export const stampTilt = (code: CountryCode) =>
	TILTS[(code.charCodeAt(0) * 31 + code.charCodeAt(1) * 7) % TILTS.length];
// Scripts without capitals set tall; keep them from crowding the outline
const COMPACT_SCRIPT = /[֐-ࣿऀ-෿က-႟ሀ-፿぀-鿿가-힯]/;

// Poster units are millimetres. Below these widths a stamp's small print
// would come out under about 5pt, so it's left off rather than printed illegibly
const MIN_WIDTH_FOR_ENGLISH = 26;
const MIN_WIDTH_FOR_TEXT = 18;
const HAIRLINE = "rgba(0,0,0,0.18)";

// Largest size up to `cap` at which `text` fits `width`, by average glyph width
const fit = (text: string, width: number, cap: number, glyph = 0.6) =>
	Math.min(cap, width / (Math.max(text.length, 1) * glyph));

interface Face {
	code: CountryCode;
	w: number;
	h: number;
	title: string;
	lang: string;
	english?: string;
	withText: boolean;
	outline: Outline | null;
	flag?: FlagArt;
	// Unique per rendered stamp, for its SVG ids
	uid: string;
}

interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}

const FlagFill = ({
	flag,
	box,
	stretch,
}: { flag: FlagArt; box: Box; stretch?: boolean }) => (
	<svg
		x={box.x}
		y={box.y}
		width={box.w}
		height={box.h}
		viewBox={flag.viewBox}
		preserveAspectRatio={stretch ? "none" : "xMidYMid slice"}
		aria-hidden="true"
		// flag-icons' own SVG, with its ids already made unique per country
		// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted package art
		dangerouslySetInnerHTML={{ __html: flag.body }}
	/>
);

const Silhouette = ({
	face,
	box,
	fill,
}: { face: Face; box: Box; fill: string }) =>
	face.outline ? (
		<svg
			x={box.x}
			y={box.y}
			width={box.w}
			height={box.h}
			viewBox={face.outline.viewBox}
			aria-hidden="true"
		>
			<path d={face.outline.path} fill={fill} />
		</svg>
	) : (
		<text
			x={box.x + box.w / 2}
			y={box.y + box.h * 0.68}
			textAnchor="middle"
			fill={fill}
			fontFamily={DISPLAY}
			fontWeight={800}
			fontSize={Math.min(box.h * 0.6, box.w * 0.42)}
		>
			{face.code}
		</text>
	);

const Title = ({
	face,
	x,
	y,
	size,
	fill,
	anchor = "start",
}: {
	face: Face;
	x: number;
	y: number;
	size: number;
	fill: string;
	anchor?: "start" | "middle";
}) => (
	<text
		x={x}
		y={y}
		textAnchor={anchor}
		fill={fill}
		fontFamily={DISPLAY}
		fontWeight={800}
		fontSize={size}
		lang={face.lang}
	>
		{face.title}
	</text>
);

const titleCap = (face: Face, width: number) =>
	width * (COMPACT_SCRIPT.test(face.title) ? 0.2 : 0.15);

// 1. The flag's colours as the ground, its outline and name in a contrasting one
const GroundFace = ({ face }: { face: Face }) => {
	const { w, h } = face;
	const { ground, figure, band } = stampColours(face.code);
	const size = fit(face.title, w * 0.9, titleCap(face, w));
	return (
		<>
			<rect
				width={w}
				height={h}
				fill={ground}
				stroke={luminance(ground) > 0.7 ? "rgba(0,0,0,0.14)" : "none"}
				strokeWidth={w * 0.006}
			/>
			{face.withText && (
				<Title
					face={face}
					x={w * 0.07}
					y={w * 0.07 + size}
					size={size}
					fill={figure}
				/>
			)}
			<Silhouette
				face={face}
				fill={figure}
				box={
					face.withText
						? { x: w * 0.12, y: h * 0.3, w: w * 0.76, h: h * 0.46 }
						: { x: w * 0.12, y: h * 0.14, w: w * 0.76, h: h * 0.72 }
				}
			/>
			{face.english && (
				<text
					x={w / 2}
					y={h * 0.88}
					textAnchor="middle"
					fill={figure}
					fontFamily={BODY}
					fontWeight={600}
					fontSize={fit(face.english, w * 0.9, w * 0.095, 0.55)}
				>
					{face.english}
				</text>
			)}
			<rect y={h * 0.95} width={w} height={h * 0.05} fill={band} />
		</>
	);
};

// 2. The real flag inside the country's outline, on a white stamp
const ShapeFace = ({ face }: { face: Face }) => {
	const { w, h, outline, flag } = face;
	const size = fit(face.title, w * 0.86, titleCap(face, w));
	const box = face.withText
		? { x: w * 0.08, y: h * 0.26, w: w * 0.84, h: h * 0.54 }
		: { x: w * 0.08, y: h * 0.1, w: w * 0.84, h: h * 0.8 };
	const [vx, vy, vw, vh] = outline?.viewBox.split(" ").map(Number) ?? [];
	const clip = `${face.uid}-clip`;
	const small = w * 0.08;
	return (
		<>
			<rect
				width={w}
				height={h}
				fill="#fff"
				stroke="#c9cfd9"
				strokeWidth={w * 0.008}
			/>
			{face.withText && (
				<Title
					face={face}
					x={w / 2}
					y={h * 0.07 + size}
					size={size}
					fill={INK}
					anchor="middle"
				/>
			)}
			{outline && flag ? (
				<svg
					x={box.x}
					y={box.y}
					width={box.w}
					height={box.h}
					viewBox={outline.viewBox}
					aria-hidden="true"
				>
					<clipPath id={clip}>
						<path d={outline.path} />
					</clipPath>
					<g clipPath={`url(#${clip})`}>
						<FlagFill flag={flag} box={{ x: vx, y: vy, w: vw, h: vh }} />
					</g>
					{/* Keeps white parts of a flag from melting into the paper */}
					<path
						d={outline.path}
						fill="none"
						stroke={INK}
						strokeWidth={Math.max(vw, vh) * 0.006}
						strokeLinejoin="round"
					/>
				</svg>
			) : (
				<Silhouette face={face} box={box} fill={inkOnPaper(face.code)} />
			)}
			{face.withText && (
				<g fill={MUTED} fontFamily={BODY} fontWeight={600} fontSize={small}>
					{face.english && (
						<text x={w * 0.08} y={h * 0.93}>
							{face.english.length > 14
								? `${face.english.slice(0, 13).trimEnd()}…`
								: face.english}
						</text>
					)}
					<text x={w * 0.92} y={h * 0.93} textAnchor="end">
						{face.code}
					</text>
				</g>
			)}
		</>
	);
};

// 3. The flag as the stamp's frame around a white face
const FrameFace = ({ face }: { face: Face }) => {
	const { w, h, flag } = face;
	const ink = inkOnPaper(face.code);
	const inset = w * 0.045;
	const inner = { x: inset, y: inset, w: w - inset * 2, h: h - inset * 2 };
	const size = fit(face.title, inner.w * 0.88, titleCap(face, inner.w));
	return (
		<>
			{/* Stretched rather than cropped, so every stripe of a tricolour
			    reaches the edges instead of only the outer two */}
			{flag ? (
				<FlagFill flag={flag} box={{ x: 0, y: 0, w, h }} stretch />
			) : (
				<rect width={w} height={h} fill={stampColours(face.code).ground} />
			)}
			{/* Hairlines keep a flag's white parts reading as frame, not paper */}
			<rect
				width={w}
				height={h}
				fill="none"
				stroke={HAIRLINE}
				strokeWidth={w * 0.008}
			/>
			<rect
				x={inner.x}
				y={inner.y}
				width={inner.w}
				height={inner.h}
				fill="#fff"
				stroke={HAIRLINE}
				strokeWidth={w * 0.008}
			/>
			{face.withText && (
				<Title
					face={face}
					x={w / 2}
					y={inner.y + inner.h * 0.06 + size}
					size={size}
					fill={ink}
					anchor="middle"
				/>
			)}
			<Silhouette
				face={face}
				fill={ink}
				box={
					face.withText
						? {
								x: inner.x + inner.w * 0.14,
								y: inner.y + inner.h * 0.3,
								w: inner.w * 0.72,
								h: inner.h * 0.44,
							}
						: {
								x: inner.x + inner.w * 0.1,
								y: inner.y + inner.h * 0.12,
								w: inner.w * 0.8,
								h: inner.h * 0.76,
							}
				}
			/>
			{face.english && (
				<text
					x={w / 2}
					y={inner.y + inner.h * 0.92}
					textAnchor="middle"
					fill={MUTED}
					fontFamily={BODY}
					fontWeight={600}
					fontSize={fit(face.english, inner.w * 0.9, inner.w * 0.095, 0.55)}
				>
					{face.english}
				</text>
			)}
		</>
	);
};

// Two-word names break where the lines come out most even
function nameLines(title: string): string[] {
	const words = title.split(" ");
	if (words.length < 2 || title.length < 10) return [title];
	let best = [title];
	let longest = title.length;
	for (let i = 1; i < words.length; i++) {
		const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
		const max = Math.max(...lines.map((l) => l.length));
		if (max < longest) {
			best = lines;
			longest = max;
		}
	}
	return best;
}

// 4. The native name set large, as the stamp's picture
const TypeFace = ({ face }: { face: Face }) => {
	const { w, h } = face;
	const { ground, figure, band } = stampColours(face.code);
	const pad = w * 0.08;
	const mark = { x: w - pad - w * 0.3, y: pad, w: w * 0.3, h: h * 0.2 };
	const lines = nameLines(face.title);
	const longest = Math.max(...lines.map((l) => l.length));
	const compact = COMPACT_SCRIPT.test(face.title);
	const room = h * 0.74 - (mark.y + mark.h + h * 0.04);
	const size = Math.min(
		// Heavy display type runs wide; CJK and similar glyphs are about square
		fit(
			"x".repeat(longest),
			w - pad * 2,
			w * (compact ? 0.4 : 0.34),
			compact ? 1 : 0.64,
		),
		room / (lines.length * 0.95),
	);
	// Those scripts also sit lower on the baseline, so lift them clear of the rule
	const nameBottom = h * 0.74 - (compact ? size * 0.14 : 0);
	return (
		<>
			<rect
				width={w}
				height={h}
				fill={ground}
				stroke={luminance(ground) > 0.7 ? "rgba(0,0,0,0.14)" : "none"}
				strokeWidth={w * 0.006}
			/>
			{face.withText ? (
				<>
					<text
						x={pad}
						y={pad + w * 0.09}
						fill={figure}
						fillOpacity={0.85}
						fontFamily={DISPLAY}
						fontWeight={800}
						fontSize={w * 0.1}
					>
						{face.code}
					</text>
					<Silhouette face={face} box={mark} fill={figure} />
					<text
						fill={figure}
						fontFamily={DISPLAY}
						fontWeight={800}
						fontSize={size}
						letterSpacing={-size * 0.03}
						lang={face.lang}
					>
						{lines.map((line, i) => (
							<tspan
								key={line}
								x={pad}
								y={nameBottom - (lines.length - 1 - i) * size * 0.95}
							>
								{line}
							</tspan>
						))}
					</text>
					<rect
						x={pad}
						y={h * 0.8}
						width={w * 0.18}
						height={h * 0.018}
						fill={band === ground ? figure : band}
					/>
					{face.english && (
						<text
							x={pad}
							y={h * 0.92}
							fill={figure}
							fillOpacity={0.85}
							fontFamily={BODY}
							fontWeight={600}
							fontSize={fit(face.english, w - pad * 2, w * 0.085, 0.55)}
						>
							{face.english}
						</text>
					)}
				</>
			) : (
				<Silhouette
					face={face}
					fill={figure}
					box={{ x: w * 0.12, y: h * 0.14, w: w * 0.76, h: h * 0.72 }}
				/>
			)}
		</>
	);
};

const Perforations = ({
	w,
	h,
	colour,
}: { w: number; h: number; colour: string }) => {
	const hole = w * 0.028;
	return (
		<rect
			width={w}
			height={h}
			fill="none"
			stroke={colour}
			strokeWidth={hole * 2}
			strokeLinecap="round"
			strokeDasharray={`0 ${hole * 3}`}
		/>
	);
};

const FACES: Record<StampStyle, ComponentType<{ face: Face }>> = {
	ground: GroundFace,
	shape: ShapeFace,
	frame: FrameFace,
	type: TypeFace,
};

interface Props {
	code: CountryCode;
	style: StampStyle;
	x: number;
	y: number;
	w: number;
	flag?: FlagArt;
	faded?: boolean;
	mark?: string;
	markFill?: string;
	// The colour behind the stamp, when it's known: the perforations are then
	// painted in it. Otherwise they're masked out, which Chrome rasterises in a PDF
	paper?: string;
}

const PosterStamp = ({
	code,
	style,
	x,
	y,
	w,
	flag,
	faded,
	mark,
	markFill = INK,
	paper,
}: Props) => {
	// The same stamp can show twice on a page (the grid and the style picker)
	const uid = `stamp${useId().replace(/[^\w-]/g, "")}`;
	const h = w * STAMP_RATIO;
	const margin = w * 0.07;
	const native = getNativeName(code);
	const english = getCountryName(code);
	const withText = w >= MIN_WIDTH_FOR_TEXT;
	const face: Face = {
		code,
		w: w - margin * 2,
		h: h - margin * 2,
		title: native?.name ?? english,
		lang: native?.lang ?? "en",
		english: native && w >= MIN_WIDTH_FOR_ENGLISH ? english : undefined,
		withText,
		outline: countryOutline(code),
		flag,
		uid,
	};
	const Face = FACES[style];
	const tilt = stampTilt(code);

	return (
		<g transform={`translate(${x} ${y}) rotate(${tilt} ${w / 2} ${h / 2})`}>
			{/* The badge stays out of the fade so it keeps the map's colour */}
			{/* Perforations: round dashes along the edge bite into the stamp */}
			{!paper && (
				<mask id={`${uid}-holes`}>
					<rect width={w} height={h} fill="#fff" />
					<Perforations w={w} h={h} colour="#000" />
				</mask>
			)}
			<g
				opacity={faded ? 0.45 : 1}
				mask={paper ? undefined : `url(#${uid}-holes)`}
			>
				<rect width={w} height={h} fill="#fff" />
				{paper && <Perforations w={w} h={h} colour={paper} />}
				<g transform={`translate(${margin} ${margin})`}>
					<Face face={face} />
				</g>
			</g>
			{mark && (
				<g>
					<circle cx={w - margin} cy={margin} r={w * 0.11} fill={markFill} />
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

export default PosterStamp;
