import type { CountryCode } from "../types";
import { TOTAL_COUNTRIES, countStates } from "../utils/countries";

interface Props {
	countries: CountryCode[];
}

const Stats = ({ countries }: Props) => {
	const { count, territories, percentage } = countStates(countries);
	const cells = [
		{
			value: (
				<>
					<span className="text-stamp-red">{count}</span>
					<span className="text-xl md:text-3xl"> / {TOTAL_COUNTRIES}</span>
				</>
			),
			label: "Countries",
		},
		{ value: `${percentage}%`, label: "Of the world" },
		...(territories > 0
			? [
					{
						value: territories,
						label: territories === 1 ? "Territory" : "Territories",
					},
				]
			: []),
	];

	return (
		<dl className="flex border-y border-ink">
			{cells.map(({ value, label }, i) => (
				<div
					key={label}
					className={`flex flex-col-reverse gap-1 py-3 md:py-4 px-3 md:px-7 first:pl-0 last:pr-0 ${i > 0 ? "border-l border-ink" : ""}`}
				>
					<dt className="label text-[10px] md:text-[11px]">{label}</dt>
					<dd className="m-0 font-display text-4xl md:text-6xl leading-none">
						{value}
					</dd>
				</div>
			))}
		</dl>
	);
};

export default Stats;
