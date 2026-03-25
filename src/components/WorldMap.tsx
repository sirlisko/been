import countriesShapes from "world-map-country-shapes";
import type { CountryCode } from "../types";
import { getCountryName } from "../utils/countries";

interface Props {
	selected: CountryCode[];
	highlighted?: CountryCode[];
	onToggle: (code: CountryCode) => void;
}

const WorldMap = ({ selected, highlighted = [], onToggle }: Props) => {
	const selectedSet = new Set(selected);
	const highlightedSet = new Set(highlighted);

	const getFill = (code: CountryCode) => {
		if (selectedSet.has(code)) return "#c2185b";
		if (highlightedSet.has(code)) return "#f48fb1";
		return "#e0e0e0";
	};

	return (
		<svg
			viewBox="0 0 2000 1001"
			className="w-full h-auto"
			role="img"
			aria-label="World map"
		>
			<title>World map</title>
			{countriesShapes.map(({ id, shape }) => {
				const code = id as CountryCode;
				return (
					<path
						key={id}
						d={shape}
						fill={getFill(code)}
						stroke="#fff"
						strokeWidth={0.5}
						role="button"
						tabIndex={0}
						className="cursor-pointer transition-colors duration-200 hover:opacity-80"
						onClick={() => onToggle(code)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") onToggle(code);
						}}
					>
						<title>{getCountryName(code)}</title>
					</path>
				);
			})}
		</svg>
	);
};

export default WorldMap;
