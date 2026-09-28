import type { CountryCode } from "../types";
import { TOTAL_COUNTRIES, countStates } from "../utils/countries";

interface Props {
	countries: CountryCode[];
}

const Stats = ({ countries }: Props) => {
	const { count, territories, percentage } = countStates(countries);

	return (
		<div className="flex flex-col items-center my-8 px-4">
			<div className="inline-flex border-4 border-primary">
				<div className="text-center px-6 sm:px-8 py-4 bg-white">
					<span className="font-display text-5xl sm:text-6xl text-primary block">
						{count}
					</span>
					<span className="text-xs font-sans font-bold uppercase tracking-widest text-gray-600">
						of {TOTAL_COUNTRIES} countries
					</span>
				</div>
				<div className="w-1 bg-primary" />
				<div className="text-center px-6 sm:px-8 py-4 bg-white">
					<span className="font-display text-5xl sm:text-6xl text-primary block">
						{percentage}%
					</span>
					<span className="text-xs font-sans font-bold uppercase tracking-widest text-gray-600">
						of the world
					</span>
				</div>
			</div>
			{territories > 0 && (
				<p className="text-xs text-gray-600 mt-2">
					+ {territories} {territories === 1 ? "territory" : "territories"}
				</p>
			)}
		</div>
	);
};

export default Stats;
