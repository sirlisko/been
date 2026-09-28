import type { CountryCode } from "../types";
import { getCountryName, getFlagUrl, sortByName } from "../utils/countries";

interface Props {
	countries: CountryCode[];
	onToggle?: (code: CountryCode) => void;
}

const CountryList = ({ countries, onToggle }: Props) => (
	<ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 my-6 px-4">
		{sortByName(countries).map((code) => (
			<li key={code}>
				<button
					type="button"
					onClick={() => onToggle?.(code)}
					disabled={!onToggle}
					title={onToggle ? `Remove ${getCountryName(code)}` : undefined}
					className="flex items-center gap-2 p-3 w-full border-4 border-primary bg-warm-bg transition-colors duration-150 enabled:hover:bg-white"
				>
					<img
						src={getFlagUrl(code)}
						alt=""
						className="w-8 h-8 rounded-sm object-cover"
					/>
					<span className="text-sm truncate">{getCountryName(code)}</span>
				</button>
			</li>
		))}
	</ul>
);

export default CountryList;
