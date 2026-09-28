import { useRef, useState } from "react";
import countriesShapes from "world-map-country-shapes";
import type { CountryCode } from "../types";
import { getCountryName } from "../utils/countries";

interface Props {
	selected: CountryCode[];
	highlighted?: CountryCode[];
	onToggle: (code: CountryCode) => void;
}

const ZOOM_LEVELS = [1, 2, 4];

const WorldMap = ({ selected, highlighted = [], onToggle }: Props) => {
	const [zoom, setZoom] = useState(1);
	const scroller = useRef<HTMLDivElement>(null);
	const selectedSet = new Set(selected);
	const highlightedSet = new Set(highlighted);

	const getFill = (code: CountryCode) => {
		if (selectedSet.has(code)) return "#c2185b";
		if (highlightedSet.has(code)) return "#f48fb1";
		return "#e0e0e0";
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
								fill={getFill(code)}
								stroke="#FFEDD5"
								strokeWidth={0.5}
								vectorEffect="non-scaling-stroke"
								className="cursor-pointer transition-colors duration-200 hover:opacity-80"
								onClick={() => onToggle(code)}
							>
								<title>{getCountryName(code)}</title>
							</path>
						);
					})}
				</svg>
			</div>
			<div className="absolute top-2 right-2 flex flex-col border-2 border-primary bg-white">
				<button
					type="button"
					aria-label="Zoom in"
					disabled={level === ZOOM_LEVELS.length - 1}
					onClick={() => zoomTo(ZOOM_LEVELS[level + 1])}
					className="w-9 h-9 text-xl font-bold text-primary disabled:opacity-30"
				>
					+
				</button>
				<button
					type="button"
					aria-label="Zoom out"
					disabled={level === 0}
					onClick={() => zoomTo(ZOOM_LEVELS[level - 1])}
					className="w-9 h-9 text-xl font-bold text-primary border-t-2 border-primary disabled:opacity-30"
				>
					−
				</button>
			</div>
		</div>
	);
};

export default WorldMap;
