import { useState } from "react";
import type { CountryCode } from "../types";
import { getCountryName } from "../utils/countries";

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
		<div className="relative w-full md:w-[420px] flex flex-col gap-1.5">
			<label htmlFor="country-search" className="label">
				Add a country
			</label>
			<div className="relative">
				<input
					id="country-search"
					type="text"
					role="combobox"
					autoComplete="off"
					aria-expanded={expanded}
					aria-controls="country-results"
					aria-activedescendant={
						expanded ? `country-${results[active]}` : undefined
					}
					placeholder="Start typing — e.g. Japan"
					value={value}
					onChange={(e) => change(e.target.value)}
					onFocus={() => setOpen(true)}
					onBlur={() => setOpen(false)}
					onKeyDown={onKeyDown}
					className="w-full py-2 border-0 border-b-2 border-ink bg-transparent font-display text-xl text-ink placeholder:text-muted focus:outline-none focus:border-stamp-red"
				/>
				{expanded && (
					// biome-ignore lint/a11y/useFocusableInteractive: combobox pattern, focus stays on the input (aria-activedescendant)
					<div
						id="country-results"
						// biome-ignore lint/a11y/useSemanticElements: <select> can't filter as you type
						role="listbox"
						// keeps focus in the input so onBlur doesn't close the list before onClick
						onMouseDown={(e) => e.preventDefault()}
						className="absolute z-10 w-full mt-1 bg-page border border-ink shadow-[4px_4px_0_theme(colors.ink)] max-h-72 overflow-y-auto"
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
								className={`flex items-center gap-3 px-4 min-h-11 cursor-pointer ${
									i === active ? "bg-land" : ""
								}`}
							>
								<span className="font-mono text-xs text-muted w-6">{code}</span>
								<span>{getCountryName(code)}</span>
								{selectedSet.has(code) && (
									<span className="ml-auto label text-stamp-red">Stamped</span>
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
