import type { CountryCode } from "../types";
import { getCountryName, sortByName } from "../utils/countries";

const SHAPES = [
	{
		label: "Entry",
		className:
			"rounded-full w-[108px] h-[108px] md:w-[136px] md:h-[136px] px-4 md:px-5",
	},
	{
		label: "Admitted",
		className:
			"rounded-[3px] w-[110px] h-[92px] md:w-[150px] md:h-[112px] px-3",
	},
	{
		label: "Arrival",
		className:
			"rounded-[50%] w-[114px] h-[92px] md:w-[150px] md:h-[108px] px-5 md:px-6",
	},
];
const INKS = [
	"text-stamp-red",
	"text-stamp-blue",
	"text-stamp-green",
	"text-stamp-purple",
];
const ROTATIONS = [
	"-rotate-3",
	"rotate-2",
	"-rotate-1",
	"rotate-3",
	"-rotate-2",
	"rotate-1",
];

// Derived from the code, not the list position, so stamps don't reshuffle as countries are added
export function stampLook(code: CountryCode) {
	const n = code.charCodeAt(0) * 31 + code.charCodeAt(1) * 7;
	return {
		shape: SHAPES[n % SHAPES.length],
		ink: INKS[Math.floor(n / 3) % INKS.length],
		rotation: ROTATIONS[Math.floor(n / 12) % ROTATIONS.length],
	};
}

interface Props {
	countries: CountryCode[];
	onToggle?: (code: CountryCode) => void;
}

const CountryList = ({ countries, onToggle }: Props) => (
	<ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-y-5 justify-items-center items-center">
		{sortByName(countries).map((code) => {
			const { shape, ink, rotation } = stampLook(code);
			const name = getCountryName(code);
			return (
				<li key={code}>
					<button
						type="button"
						onClick={() => onToggle?.(code)}
						disabled={!onToggle}
						aria-label={onToggle ? `Remove ${name}` : undefined}
						title={onToggle ? `Remove ${name}` : undefined}
						className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-center transition-transform enabled:hover:scale-105 ${shape.className} ${ink} ${rotation}`}
					>
						<span aria-hidden="true" className="stamp-frame ink" />
						<span className="font-mono text-[9px] md:text-[10px] font-medium uppercase tracking-[0.2em]">
							{shape.label}
						</span>
						<span className="font-display font-bold text-2xl md:text-3xl leading-none">
							{code}
						</span>
						<span
							className={`max-w-full font-semibold leading-tight ${name.length > 10 ? "text-[11px] md:text-xs" : "text-xs md:text-[13px]"}`}
						>
							{name}
						</span>
					</button>
				</li>
			);
		})}
	</ul>
);

export default CountryList;
