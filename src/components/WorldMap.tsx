import { useRef, useState } from "react";
import countriesShapes from "world-map-country-shapes";
import type { CountryCode } from "../types";
import { getCountryName } from "../utils/countries";

interface Props {
	selected: CountryCode[];
	highlighted?: CountryCode[];
	onToggle?: (code: CountryCode) => void;
}

const ZOOM_LEVELS = [1, 2, 4];

const WorldMap = ({ selected, highlighted = [], onToggle }: Props) => {
	const [zoom, setZoom] = useState(1);
	const scroller = useRef<HTMLDivElement>(null);
	const selectedSet = new Set(selected);
	const highlightedSet = new Set(highlighted);

	const getFill = (code: CountryCode) => {
		if (selectedSet.has(code)) return "fill-stamp-red";
		if (highlightedSet.has(code)) return "fill-stamp-blue";
		return "fill-land";
	};

	const zoomTo = (next: number) => {
		const el = scroller.current;
		if (!el) return;
		const cx = (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth;
		const cy = (el.scrollTop + el.clientHeight / 2) / el.scrollHeight;
		setZoom(next);
		requestAnimationFrame(() => {
			el.scrollLeft = cx * el.scrollWidth - el.clientWidth / 2;
			el.scrollTop = cy * el.scrollHeight - el.clientHeight / 2;
		});
	};
	const level = ZOOM_LEVELS.indexOf(zoom);

	return (
		<div className="relative">
			<div ref={scroller} className="overflow-auto aspect-[2000/1001]">
				<svg
					viewBox="0 0 2000 1001"
					className="h-auto block"
					style={{ width: `${zoom * 100}%` }}
					role="img"
					aria-label="World map of visited countries"
				>
					{countriesShapes.map(({ id, shape }) => {
						const code = id as CountryCode;
						return (
							// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users toggle via search; ~200 focusable paths would trap tab navigation
							<path
								key={id}
								d={shape}
								strokeWidth={0.75}
								vectorEffect="non-scaling-stroke"
								className={`stroke-page ${getFill(code)} ${
									onToggle
										? "cursor-pointer transition-colors duration-200 hover:opacity-75"
										: ""
								}`}
								onClick={onToggle && (() => onToggle(code))}
							>
								<title>{getCountryName(code)}</title>
							</path>
						);
					})}
				</svg>
			</div>
			<div className="flex justify-end mt-2 md:mt-3">
				<div className="flex border border-ink bg-paper font-mono">
					<button
						type="button"
						aria-label="Zoom in"
						disabled={level === ZOOM_LEVELS.length - 1}
						onClick={() => zoomTo(ZOOM_LEVELS[level + 1])}
						className="w-11 h-11 text-xl text-ink disabled:opacity-30"
					>
						+
					</button>
					<button
						type="button"
						aria-label="Zoom out"
						disabled={level === 0}
						onClick={() => zoomTo(ZOOM_LEVELS[level - 1])}
						className="w-11 h-11 text-xl text-ink border-l border-ink disabled:opacity-30"
					>
						−
					</button>
				</div>
			</div>
		</div>
	);
};

export default WorldMap;
