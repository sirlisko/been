import type { CountryCode } from "../types";
import { getCountryName, getFlagUrl } from "../utils/countries";

interface Props {
	countries: CountryCode[];
	selected: CountryCode[];
	onToggle: (code: CountryCode) => void;
}

const CountryList = ({ countries, selected, onToggle }: Props) => {
	const selectedSet = new Set(selected);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 my-6 px-4">
			{countries.map((code) => (
				<button
					key={code}
					type="button"
					onClick={() => onToggle(code)}
					className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors duration-200 ${
						selectedSet.has(code)
							? "border-been bg-been/10"
							: "border-gray-200 hover:border-gray-300"
					}`}
				>
					<img
						src={getFlagUrl(code)}
						alt={getCountryName(code)}
						className="w-8 h-8 rounded-full object-cover"
					/>
					<span className="text-sm truncate">{getCountryName(code)}</span>
				</button>
			))}
		</div>
	);
};

export default CountryList;
