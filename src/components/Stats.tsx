import { type ReactNode, useState } from "react";
import type { CountryCode } from "../types";
import {
	TOTAL_COUNTRIES,
	UN_STATES,
	countStates,
	getCountryName,
	sortByName,
} from "../utils/countries";

const list = new Intl.ListFormat("en", { type: "conjunction" });

interface Props {
	countries: CountryCode[];
}

// dt comes first for the markup; row-reverse puts the number first on screen
const Stat = ({
	value,
	label,
	big,
}: { value: string | number; label: ReactNode; big?: boolean }) => (
	<div className="flex flex-row-reverse justify-end items-baseline gap-1.5">
		<dt
			className={
				big ? "font-display font-bold text-xl md:text-2xl" : "text-muted"
			}
		>
			{label}
		</dt>
		<dd
			className={`m-0 ${big ? "font-display font-extrabold text-5xl md:text-6xl tracking-tight leading-none" : "font-semibold"}`}
		>
			{value}
		</dd>
	</div>
);

const Stats = ({ countries }: Props) => {
	const { count, territories, percentage } = countStates(countries);
	const [explained, setExplained] = useState(false);
	const names = sortByName(
		countries.filter((code) => !UN_STATES.has(code)),
	).map(getCountryName);
	const one = territories === 1;
	return (
		<div className="flex flex-col gap-1">
			<dl className="m-0 flex flex-wrap items-baseline gap-x-5 gap-y-1">
				<Stat value={count} label={count === 1 ? "country" : "countries"} big />
				<Stat value={`${percentage}%`} label="of the world" />
				<Stat value={TOTAL_COUNTRIES - count} label="to go" />
				{territories > 0 && (
					<Stat
						value={`+${territories}`}
						label={
							<button
								type="button"
								onClick={() => setExplained(!explained)}
								aria-expanded={explained}
								aria-controls="territories-note"
								className="p-0 border-0 bg-transparent text-inherit underline decoration-dotted underline-offset-4 cursor-pointer"
							>
								{one ? "territory" : "territories"}
							</button>
						}
					/>
				)}
			</dl>
			{territories > 0 && explained && (
				<p id="territories-note" className="m-0 text-sm text-muted">
					{list.format(names)}{" "}
					{one ? "isn't a UN member state" : "aren't UN member states"}, so{" "}
					{one ? "it doesn't" : "they don't"} count toward the {TOTAL_COUNTRIES}
					.
				</p>
			)}
		</div>
	);
};

export default Stats;
