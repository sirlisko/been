import { useState } from "react";
import type { CountryCode } from "../types";
import { getCountryName, getFlagUrl } from "../utils/countries";

interface Props {
	value: string;
	onChange: (value: string) => void;
	results: CountryCode[];
	selected: CountryCode[];
	onSelect: (code: CountryCode) => void;
}

const CountrySearch = ({
	value,
	onChange,
	results,
	selected,
	onSelect,
}: Props) => {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(0);
	const selectedSet = new Set(selected);
	const expanded = open && results.length > 0;

	const change = (next: string) => {
		onChange(next);
		setActive(0);
		setOpen(true);
	};

	const pick = (code: CountryCode) => {
		onSelect(code);
		change("");
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (!expanded) return;
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			const step = e.key === "ArrowDown" ? 1 : -1;
			setActive((i) => (i + step + results.length) % results.length);
		} else if (e.key === "Enter") {
			e.preventDefault();
			pick(results[active]);
		} else if (e.key === "Escape") {
			setOpen(false);
		}
	};

	return (
		<div className="flex justify-center my-6 px-4">
			<div className="relative w-full max-w-md">
				<input
					type="text"
					role="combobox"
					aria-label="Search countries"
					aria-expanded={expanded}
					aria-controls="country-results"
					aria-activedescendant={
						expanded ? `country-${results[active]}` : undefined
					}
					placeholder="Search countries..."
					value={value}
					onChange={(e) => change(e.target.value)}
					onFocus={() => setOpen(true)}
					onBlur={() => setOpen(false)}
					onKeyDown={onKeyDown}
					className="w-full px-4 py-3 border-4 border-primary rounded-none text-base font-sans focus:outline-none focus:border-secondary bg-white"
				/>
				{expanded && (
					// biome-ignore lint/a11y/useFocusableInteractive: combobox pattern, focus stays on the input (aria-activedescendant)
					<div
						id="country-results"
						// biome-ignore lint/a11y/useSemanticElements: <select> can't filter as you type or show flags
						role="listbox"
						// keeps focus in the input so onBlur doesn't close the list before onClick
						onMouseDown={(e) => e.preventDefault()}
						className="absolute z-10 w-full bg-white border-4 border-primary border-t-0 max-h-60 overflow-y-auto"
					>
						{results.map((code, i) => (
							// biome-ignore lint/a11y/useKeyWithClickEvents lint/a11y/useFocusableInteractive: combobox option, keyboard and focus live on the input
							<div
								key={code}
								id={`country-${code}`}
								// biome-ignore lint/a11y/useSemanticElements: option of the custom listbox above
								role="option"
								aria-selected={i === active}
								onClick={() => pick(code)}
								onMouseEnter={() => setActive(i)}
								className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
									i === active ? "bg-warm-bg" : ""
								} ${selectedSet.has(code) ? "text-primary font-bold" : ""}`}
							>
								<img
									src={getFlagUrl(code)}
									alt=""
									className="w-6 h-6 rounded-full object-cover flex-shrink-0"
								/>
								<span className="text-sm">{getCountryName(code)}</span>
								{selectedSet.has(code) && (
									<span className="ml-auto text-xs text-primary font-bold">
										✓ <span className="sr-only">visited</span>
									</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default CountrySearch;
