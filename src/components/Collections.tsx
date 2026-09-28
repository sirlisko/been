import type { CountryCode } from "../types";
import { COLLECTIONS, CONTINENTS, TIERS, progress } from "../utils/collections";

const INKS = ["text-stamp-blue", "text-stamp-green", "text-stamp-red"];
const ROTATIONS = ["-rotate-3", "rotate-2", "-rotate-2"];

const cardClass =
	"flex items-center gap-4 min-h-[116px] px-4 py-3.5 bg-page border";

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
										className={`absolute -top-2.5 -ml-4 size-8 rounded-full border-2 flex items-center justify-center font-mono text-[9px] font-medium ${pct >= at ? "border-stamp-red bg-stamp-red text-paper" : "border-[#A99F8C] bg-paper text-muted"}`}
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
							<li key={c.title} className={`${cardClass} border-ink`}>
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
							<li key={c.title} className={`${cardClass} border-line`}>
								<div className="relative shrink-0 size-[88px] rounded-full flex items-center justify-center text-[#8A8273] border border-[#C9BFAC] shadow-[inset_0_0_0_4px_#F8F4EC,inset_0_0_0_5px_#C9BFAC]">
									<span
										aria-hidden="true"
										className="absolute inset-0 rounded-full [mask:radial-gradient(farthest-side,transparent_calc(100%-4px),#000_calc(100%-4px))]"
										style={{
											background: `conic-gradient(#B8432F ${(c.have / c.total) * 100}%, transparent 0)`,
										}}
									/>
									{seal(c.mark)}
								</div>
								<CardText c={c} />
							</li>
						))}
					</ul>
				</section>
			)}

			{notStarted.length > 0 && (
				<details className="border-y border-ink">
					<summary className="flex items-center gap-4 min-h-16 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
						<span className="font-display italic text-2xl">
							Not started yet
						</span>
						<span className="font-mono text-xs text-muted">
							{notStarted.length}
						</span>
						<span aria-hidden="true" className="ml-auto font-mono text-xl">
							+
						</span>
					</summary>
					<ul className="m-0 p-0 pb-5 list-none grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
						{notStarted.map((c) => (
							<li
								key={c.title}
								className="flex justify-between items-baseline gap-2 py-2.5 border-b border-line"
							>
								<span className="font-display text-[17px]">{c.title}</span>
								<span className="font-mono text-xs text-muted">
									0/{c.total}
								</span>
							</li>
						))}
					</ul>
				</details>
			)}
		</div>
	);
};

export default Collections;
