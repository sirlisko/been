import { type ReactNode, useState } from "react";
import shapes from "world-map-country-shapes";
import type { CountryCode } from "../types";
import {
	COLLECTIONS,
	CONTINENTS,
	type Collection,
	TIERS,
	collectionViewBox,
	progress,
} from "../utils/collections";
import { getCountryName } from "../utils/countries";

const INKS = ["text-stamp-blue", "text-stamp-green", "text-stamp-red"];
const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-2"];

const toggle = "cursor-pointer list-none [&::-webkit-details-marker]:hidden";
const cardClass = `flex items-center gap-4 min-h-[116px] px-4 py-3.5 ${toggle}`;

const expand = (
	<span
		aria-hidden="true"
		className="ml-auto self-start font-mono text-lg text-muted transition-transform group-open/card:rotate-45"
	>
		+
	</span>
);

const seal = (mark: string) => (
	<span
		className={`font-display font-bold leading-none ${mark.length > 6 ? "text-[11px]" : mark.length > 4 ? "text-[13px]" : "text-[17px]"}`}
	>
		{mark}
	</span>
);

type Card = ReturnType<typeof progress>;

const CardText = ({ c }: { c: Card }) => (
	<div className="flex flex-col gap-0.5 min-w-0">
		<span className="label text-[10px] tracking-[0.15em]">
			{c.kind} ·{" "}
			<span className="text-ink">
				{c.have}/{c.total}
			</span>
		</span>
		<h4 className="m-0 font-display font-semibold text-xl">{c.title}</h4>
		<span className="text-[13px] leading-snug text-muted">{c.detail}</span>
	</div>
);

const MiniMap = ({
	codes,
	visited,
}: {
	codes: CountryCode[];
	visited: Set<string>;
}) => {
	const viewBox = collectionViewBox(codes);
	if (!viewBox) return null;
	const members = new Set<string>(codes);
	const fill = (id: string) =>
		!members.has(id)
			? "fill-land"
			: visited.has(id)
				? "fill-stamp-red"
				: "fill-stamp-red/25";
	return (
		<svg
			viewBox={viewBox}
			aria-hidden="true"
			className="block w-full h-auto aspect-[2/1] bg-paper"
		>
			{shapes.map(({ id, shape }) => (
				<path
					key={id}
					d={shape}
					strokeWidth={0.75}
					vectorEffect="non-scaling-stroke"
					className={`stroke-page ${fill(id)}`}
				/>
			))}
		</svg>
	);
};

const Members = ({
	c,
	visited,
	className,
}: {
	c: Collection;
	visited: Set<string>;
	className: string;
}) => (
	<div className={`flex flex-col gap-2 text-[13px] ${className}`}>
		<MiniMap codes={c.codes} visited={visited} />
		{c.note && <p className="m-0 text-muted italic">{c.note}</p>}
		<ul className="m-0 p-0 list-none flex flex-wrap gap-x-4 gap-y-1">
			{c.codes.map((code) => (
				<li
					key={code}
					className={visited.has(code) ? "text-ink" : "text-muted"}
				>
					{visited.has(code) ? "✓" : "○"} {getCountryName(code)}
				</li>
			))}
		</ul>
	</div>
);

// Contents mount only when open: each mini-map draws the whole world
const Expandable = ({
	c,
	visited,
	className,
	children,
}: {
	c: Collection;
	visited: Set<string>;
	className: string;
	children: ReactNode;
}) => {
	const [open, setOpen] = useState(false);
	return (
		<details
			className="group/card"
			onToggle={(e) => setOpen(e.currentTarget.open)}
		>
			{children}
			{open && <Members c={c} visited={visited} className={className} />}
		</details>
	);
};

interface Props {
	countries: CountryCode[];
}

const Collections = ({ countries }: Props) => {
	const visited = new Set<string>(countries);
	const cards = COLLECTIONS.map((c) => progress(c, visited));
	const complete = cards.filter((c) => c.have === c.total);
	const inProgress = cards
		.filter((c) => c.have > 0 && c.have < c.total)
		.sort((a, b) => b.have / b.total - a.have / a.total);
	const notStarted = cards.filter((c) => c.have === 0);

	return (
		<div className="flex flex-col gap-8">
			{countries.length === 0 && (
				<p className="m-0 font-display italic text-xl text-muted">
					Stamp a country to start filling your collections.
				</p>
			)}
			<ul className="m-0 p-0 list-none border-t border-ink">
				{CONTINENTS.map(({ name, codes }) => {
					const have = codes.filter((c) => visited.has(c)).length;
					const pct = (have / codes.length) * 100;
					return (
						<li
							key={name}
							className="grid grid-cols-[1fr_auto] md:grid-cols-[160px_minmax(0,1fr)_110px] items-center gap-x-8 gap-y-3 py-4 border-b border-line"
						>
							<span className="font-display text-xl md:text-[22px]">
								{name}
							</span>
							<span className="md:order-last font-mono text-[13px] text-right">
								{have}/{codes.length} · {Math.round(pct)}%
							</span>
							<div
								aria-hidden="true"
								className="col-span-2 md:col-span-1 relative h-3 mx-4 bg-land"
							>
								<div
									className="absolute inset-y-0 left-0 bg-stamp-red"
									style={{ width: `${pct}%` }}
								/>
								{TIERS.map((at) => (
									<span
										key={at}
										className={`absolute -top-2.5 -ml-4 size-8 rounded-full border-2 flex items-center justify-center font-mono text-[9px] font-medium ${pct >= at ? "border-stamp-red bg-stamp-red text-paper" : "border-line bg-paper text-muted"}`}
										style={{ left: `${at}%` }}
									>
										{at}%
									</span>
								))}
							</div>
						</li>
					);
				})}
			</ul>

			{complete.length > 0 && (
				<section className="flex flex-col gap-4">
					<h3 className="m-0 font-display italic font-normal text-2xl md:text-3xl">
						Complete
					</h3>
					<ul className="m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{complete.map((c, i) => (
							<li key={c.title} className="bg-page border border-ink">
								<Expandable c={c} visited={visited} className="px-4 pb-4">
									<summary className={cardClass}>
										<div
											className={`relative shrink-0 size-[88px] rounded-full flex flex-col items-center justify-center gap-0.5 ${INKS[i % INKS.length]} ${ROTATIONS[i % ROTATIONS.length]}`}
										>
											<span aria-hidden="true" className="stamp-frame ink" />
											<span className="font-mono text-[8px] font-medium tracking-[0.15em]">
												COMPLETE
											</span>
											{seal(c.mark)}
										</div>
										<CardText c={c} />
										{expand}
									</summary>
								</Expandable>
							</li>
						))}
					</ul>
				</section>
			)}

			{inProgress.length > 0 && (
				<section className="flex flex-col gap-4">
					<h3 className="m-0 font-display italic font-normal text-2xl md:text-3xl">
						In progress
					</h3>
					<ul className="m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{inProgress.map((c) => (
							<li key={c.title} className="bg-page border border-line">
								<Expandable c={c} visited={visited} className="px-4 pb-4">
									<summary className={cardClass}>
										<div className="relative shrink-0 size-[88px] rounded-full flex items-center justify-center text-muted border border-line shadow-[inset_0_0_0_4px_theme(colors.page),inset_0_0_0_5px_theme(colors.line)]">
											<span
												aria-hidden="true"
												className="absolute inset-0 rounded-full text-stamp-red [mask:radial-gradient(farthest-side,transparent_calc(100%-4px),#000_calc(100%-4px))]"
												style={{
													background: `conic-gradient(currentColor ${(c.have / c.total) * 100}%, transparent 0)`,
												}}
											/>
											{seal(c.mark)}
										</div>
										<CardText c={c} />
										{expand}
									</summary>
								</Expandable>
							</li>
						))}
					</ul>
				</section>
			)}

			{notStarted.length > 0 && (
				<details className="group/all border-y border-ink">
					<summary className="flex items-center gap-4 min-h-16 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
						<span className="font-display italic text-2xl">
							Not started yet
						</span>
						<span className="font-mono text-xs text-muted">
							{notStarted.length}
						</span>
						<span
							aria-hidden="true"
							className="ml-auto font-mono text-xl transition-transform group-open/all:rotate-45"
						>
							+
						</span>
					</summary>
					<ul className="m-0 p-0 pb-5 list-none grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
						{notStarted.map((c) => (
							<li key={c.title} className="border-b border-line">
								<Expandable c={c} visited={visited} className="pb-2.5">
									<summary
										className={`flex items-baseline gap-2 py-2.5 ${toggle}`}
									>
										<span className="font-display text-[17px]">{c.title}</span>
										<span className="ml-auto font-mono text-xs text-muted">
											0/{c.total}
										</span>
										<span
											aria-hidden="true"
											className="font-mono text-muted transition-transform group-open/card:rotate-45"
										>
											+
										</span>
									</summary>
								</Expandable>
							</li>
						))}
					</ul>
				</details>
			)}
		</div>
	);
};

export default Collections;
