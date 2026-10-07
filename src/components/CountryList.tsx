import type { ReactNode } from "react";
import type { CountryCode } from "../types";
import { getCountryName, sortByName } from "../utils/countries";
import Stamp from "./Stamp";

interface Props {
	countries: CountryCode[];
	onToggle?: (code: CountryCode) => void;
	// A last cell after the stamps, e.g. a slot for adding one
	after?: ReactNode;
}

export const stampGridClass =
	"m-0 p-0 list-none grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4";

const CountryList = ({ countries, onToggle, after }: Props) => (
	<ul className={stampGridClass}>
		{sortByName(countries).map((code) => {
			const name = getCountryName(code);
			return (
				<li key={code}>
					<button
						type="button"
						onClick={() => onToggle?.(code)}
						disabled={!onToggle}
						aria-label={onToggle ? `Remove ${name}` : name}
						title={onToggle ? `Remove ${name}` : undefined}
						className="block w-full p-0 border-0 bg-transparent text-left transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-default"
					>
						<Stamp code={code} />
					</button>
				</li>
			);
		})}
		{after && <li>{after}</li>}
	</ul>
);

export default CountryList;
