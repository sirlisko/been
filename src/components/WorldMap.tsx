import { type ReactNode, useEffect, useRef, useState } from "react";
import countriesShapes from "world-map-country-shapes";
import type { CountryCode } from "../types";
import { getCountryName } from "../utils/countries";

interface Props {
	selected: CountryCode[];
	highlighted?: CountryCode[];
	shared?: CountryCode[];
	onToggle?: (code: CountryCode) => void;
	// Shown beside the zoom controls, e.g. the last change with an undo
	status?: ReactNode;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
// Mouse movement before a press counts as a drag rather than a click
const DRAG_THRESHOLD = 4;

const WorldMap = ({
	selected,
	highlighted = [],
	shared = [],
	onToggle,
	status,
}: Props) => {
	const [zoom, setZoom] = useState(MIN_ZOOM);
	const zoomRef = useRef(MIN_ZOOM);
	const scroller = useRef<HTMLDivElement>(null);
	const svg = useRef<SVGSVGElement>(null);
	const dragStart = useRef<{ x: number; y: number; left: number; top: number }>(
		null,
	);
	const dragged = useRef(false);
	const selectedSet = new Set(selected);
	const highlightedSet = new Set(highlighted);
	const sharedSet = new Set(shared);

	const getFill = (code: CountryCode) => {
		if (sharedSet.has(code)) return "fill-stamp-green";
		if (selectedSet.has(code)) return "fill-stamp-red";
		if (highlightedSet.has(code)) return "fill-stamp-blue";
		return "fill-land";
	};

	// Zooms keeping the map point under (px, py), relative to the visible area, in place.
	// Sizes the SVG directly so pinching doesn't wait on React renders.
	const zoomAt = (next: number, px: number, py: number) => {
		const el = scroller.current;
		if (!el || !svg.current) return;
		const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
		const fx = (el.scrollLeft + px) / el.scrollWidth;
		const fy = (el.scrollTop + py) / el.scrollHeight;
		svg.current.style.width = `${clamped * 100}%`;
		el.scrollLeft = fx * el.scrollWidth - px;
		el.scrollTop = fy * el.scrollHeight - py;
		zoomRef.current = clamped;
		setZoom(clamped);
	};

	const zoomBy = (factor: number) => {
		const el = scroller.current;
		if (el)
			zoomAt(zoomRef.current * factor, el.clientWidth / 2, el.clientHeight / 2);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: zoomAt only touches refs and a state setter
	useEffect(() => {
		const el = scroller.current;
		if (!el) return;
		let pinch: { distance: number; zoom: number } | null = null;
		const distance = (t: TouchList) =>
			Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
		const zoomAtClient = (next: number, x: number, y: number) => {
			const rect = el.getBoundingClientRect();
			zoomAt(next, x - rect.left, y - rect.top);
		};

		const onTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 2) {
				pinch = { distance: distance(e.touches), zoom: zoomRef.current };
			}
		};
		const onTouchMove = (e: TouchEvent) => {
			if (!pinch || e.touches.length !== 2) return;
			e.preventDefault();
			const [a, b] = [e.touches[0], e.touches[1]];
			zoomAtClient(
				(pinch.zoom * distance(e.touches)) / pinch.distance,
				(a.clientX + b.clientX) / 2,
				(a.clientY + b.clientY) / 2,
			);
		};
		const onTouchEnd = (e: TouchEvent) => {
			if (e.touches.length < 2) pinch = null;
		};
		// Trackpad pinch arrives as ctrl+wheel
		const onWheel = (e: WheelEvent) => {
			if (!e.ctrlKey) return;
			e.preventDefault();
			zoomAtClient(
				zoomRef.current * Math.exp(-e.deltaY * 0.01),
				e.clientX,
				e.clientY,
			);
		};

		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		el.addEventListener("touchend", onTouchEnd);
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => {
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
			el.removeEventListener("touchend", onTouchEnd);
			el.removeEventListener("wheel", onWheel);
		};
	}, []);

	const startDrag = (e: React.PointerEvent) => {
		const el = scroller.current;
		dragged.current = false;
		if (!el || e.pointerType !== "mouse" || e.button !== 0 || zoom === MIN_ZOOM)
			return;
		dragStart.current = {
			x: e.clientX,
			y: e.clientY,
			left: el.scrollLeft,
			top: el.scrollTop,
		};
	};

	const moveDrag = (e: React.PointerEvent) => {
		const start = dragStart.current;
		const el = scroller.current;
		if (!start || !el) return;
		const dx = e.clientX - start.x;
		const dy = e.clientY - start.y;
		if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragged.current = true;
		if (!dragged.current) return;
		el.scrollLeft = start.left - dx;
		el.scrollTop = start.top - dy;
	};

	const endDrag = () => {
		dragStart.current = null;
	};

	return (
		<div className="relative">
			<div
				ref={scroller}
				onPointerDown={startDrag}
				onPointerMove={moveDrag}
				onPointerUp={endDrag}
				onPointerLeave={endDrag}
				onClickCapture={(e) => {
					if (dragged.current) e.stopPropagation();
					dragged.current = false;
				}}
				className={`overflow-auto aspect-[2000/1001] touch-pan-x touch-pan-y select-none ${
					zoom > MIN_ZOOM ? "cursor-grab active:cursor-grabbing" : ""
				}`}
			>
				<svg
					ref={svg}
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
			<div className="flex items-center gap-3 mt-2 md:mt-3">
				<div aria-live="polite" className="label min-w-0">
					{status}
				</div>
				<div className="ml-auto flex border border-ink bg-paper font-mono">
					<button
						type="button"
						aria-label="Zoom in"
						disabled={zoom >= MAX_ZOOM}
						onClick={() => zoomBy(2)}
						className="w-11 h-11 text-xl text-ink disabled:opacity-30"
					>
						+
					</button>
					<button
						type="button"
						aria-label="Zoom out"
						disabled={zoom <= MIN_ZOOM}
						onClick={() => zoomBy(0.5)}
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
