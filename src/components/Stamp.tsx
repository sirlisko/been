import type { CountryCode } from "../types";
import { getCountryName, getNativeName } from "../utils/countries";
import { luminance, stampColours } from "../utils/flags";
import { countryOutline } from "../utils/shapes";

const TILTS = [
	"-rotate-1",
	"rotate-1",
	"rotate-0",
	"-rotate-[1.5deg]",
	"rotate-[1.5deg]",
];

// From the code, not the list position, so stamps don't reshuffle as countries are added
export function stampTilt(code: CountryCode) {
	return TILTS[
		(code.charCodeAt(0) * 31 + code.charCodeAt(1) * 7) % TILTS.length
	];
}

// Scripts without capitals set tall; keep them from crowding the outline
const COMPACT_SCRIPT = /[֐-ࣿऀ-෿က-႟ሀ-፿぀-鿿가-힯]/;

interface Props {
	code: CountryCode;
	className?: string;
}

// A postage stamp in the flag's colours: the name as the country writes it, its
// outline, and the English name underneath when that differs
const Stamp = ({ code, className = "" }: Props) => {
	const { ground, figure, band } = stampColours(code);
	const native = getNativeName(code);
	const english = getCountryName(code);
	const title = native?.name ?? english;
	const outline = countryOutline(code);
	const compact = COMPACT_SCRIPT.test(title);
	// Long names shrink to fit the stamp's width (cqw: the face is a size container)
	const fit = Math.min(compact ? 20 : 15, 150 / (title.length * 0.62));

	return (
		<div className={`perforated ${stampTilt(code)} ${className}`}>
			<div
				className="relative flex flex-col items-center justify-between gap-1 aspect-[5/6] px-[7%] pt-[7%] pb-[10%] overflow-hidden [container-type:inline-size]"
				style={{
					background: ground,
					color: figure,
					boxShadow:
						luminance(ground) > 0.7
							? "inset 0 0 0 1px rgb(0 0 0 / 0.14)"
							: undefined,
				}}
			>
				<span
					lang={native?.lang ?? "en"}
					dir="auto"
					className="self-stretch font-display font-extrabold leading-[1.1] tracking-tight break-words"
					style={{ fontSize: `${fit}cqw` }}
				>
					{title}
				</span>
				{outline ? (
					<svg
						viewBox={outline.viewBox}
						aria-hidden="true"
						className="w-[78%] flex-1 min-h-0"
						preserveAspectRatio="xMidYMid meet"
					>
						<path d={outline.path} fill={figure} />
					</svg>
				) : (
					<span
						aria-hidden="true"
						className="flex-1 flex items-center font-display font-extrabold text-[34cqw] leading-none"
					>
						{code}
					</span>
				)}
				<span className="min-h-[1.2em] text-[9.5cqw] font-semibold leading-tight text-center">
					{native ? english : ""}
				</span>
				<span
					aria-hidden="true"
					className="absolute inset-x-0 bottom-0 h-[5%]"
					style={{ background: band }}
				/>
			</div>
		</div>
	);
};

export default Stamp;
