import { useState } from "react";
import type { CountryCode } from "../types";
import { getFlagUrl, getCountryName } from "../utils/countries";

interface Props {
	value: string;
	onChange: (value: string) => void;
	results: CountryCode[];
	selected: CountryCode[];
	onSelect: (code: CountryCode) => void;
}

const CountrySearch = ({ value, onChange, results, selected, onSelect }: Props) => {
	const [open, setOpen] = useState(false);
	const selectedSet = new Set(selected);

	return (
		<div className="flex justify-center my-6">
			<div className="relative w-full max-w-md">
				<input
					type="text"
					placeholder="Search countries..."
					value={value}
					onChange={(e) => onChange(e.target.value)}
					onFocus={() => setOpen(true)}
					onBlur={() => setTimeout(() => setOpen(false), 150)}
					className="w-full px-5 py-2.5 rounded-full border-2 border-been outline-been text-base"
				/>
				{open && results.length > 0 && (
					<ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-60 overflow-y-auto">
						{results.map((code) => (
							<li key={code}>
								<button
									type="button"
									onMouseDown={() => onSelect(code)}
									className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
										selectedSet.has(code) ? "text-been font-medium" : ""
									}`}
								>
									<img
										src={getFlagUrl(code)}
										alt={getCountryName(code)}
										className="w-6 h-6 rounded-full object-cover flex-shrink-0"
									/>
									<span className="text-sm">{getCountryName(code)}</span>
									{selectedSet.has(code) && (
										<span className="ml-auto text-xs text-been">✓</span>
									)}
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default CountrySearch;
