import type { CountryCode } from "../types";
import { TOTAL_COUNTRIES, countStates } from "../utils/countries";

interface Props {
	countries: CountryCode[];
}

// dt comes first for the markup; row-reverse puts the number first on screen
const Stat = ({
	value,
	label,
	big,
}: { value: string | number; label: string; big?: boolean }) => (
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
	return (
		<dl className="m-0 flex flex-wrap items-baseline gap-x-5 gap-y-1">
			<Stat value={count} label={count === 1 ? "country" : "countries"} big />
			<Stat value={`${percentage}%`} label="of the world" />
			<Stat value={TOTAL_COUNTRIES - count} label="to go" />
			{territories > 0 && (
				<Stat
					value={territories}
					label={territories === 1 ? "territory" : "territories"}
				/>
			)}
		</dl>
	);
};

export default Stats;
