import { readOwnCountries } from "../lib/localCountries";
import type { CountryCode } from "../types";
import Collections from "./Collections";
import CountryList from "./CountryList";
import Page, { primaryButtonClass } from "./Page";
import Stats from "./Stats";
import WorldMap from "./WorldMap";

interface Props {
	countries: CountryCode[];
	name?: string;
}

interface Group {
	label: string;
	codes: CountryCode[];
	swatch: string;
}

function compare(countries: CountryCode[], name?: string): Group[] | null {
	const mine = new Set(readOwnCountries());
	if (mine.size === 0) return null;
	const theirs = new Set(countries);
	const onlyThem = countries.filter((c) => !mine.has(c));
	const onlyMe = [...mine].filter((c) => !theirs.has(c));
	return [
		{
			label: "Both of you",
			codes: countries.filter((c) => mine.has(c)),
			swatch: "bg-stamp-green",
		},
		{
			label: `Only ${name ?? "them"}`,
			codes: onlyThem,
			swatch: "bg-stamp-red",
		},
		{ label: "Only you", codes: onlyMe, swatch: "bg-stamp-blue" },
	];
}

const GroupLabel = ({ label, codes, swatch }: Group) => (
	<>
		<span aria-hidden="true" className={`w-3 h-3 ${swatch}`} />
		{label} · {codes.length}
	</>
);

const SharedMap = ({ countries, name }: Props) => {
	const groups = compare(countries, name);
	const same = groups?.every((g, i) => i === 0 || g.codes.length === 0);
	const comparing = same ? null : groups;
	const [both, onlyThem, onlyMe] = comparing
		? comparing.map((g) => g.codes)
		: [[], countries, []];

	return (
		<Page
			actions={
				<a
					href="/"
					className={`${primaryButtonClass} inline-flex items-center no-underline`}
				>
					Make your own
				</a>
			}
		>
			<section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
				<h1 className="m-0 font-display font-normal text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-xl">
					Where{" "}
					<em className="text-stamp-red">{name ? `${name}'s` : "they've"}</em>{" "}
					been
				</h1>
				<Stats countries={countries} />
			</section>

			{same && (
				<p className="-mt-4 m-0 font-display italic text-xl text-muted">
					Same stamps as yours.
				</p>
			)}
			{comparing && (
				<ul className="-mt-4 m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-2">
					{comparing.map((g) => (
						<li key={g.label} className="label flex items-center gap-2">
							<GroupLabel {...g} />
						</li>
					))}
				</ul>
			)}

			<section
				id="world"
				className="scroll-mt-6 page-frame px-2 md:px-8 pt-9 md:pt-10 pb-2 md:pb-6"
			>
				<p className="label absolute top-3 left-4 m-0">Page 01 — The world</p>
				<WorldMap selected={onlyThem} highlighted={onlyMe} shared={both} />
			</section>

			<section
				id="entries"
				className="scroll-mt-6 page-frame px-2 md:px-6 pt-11 pb-6"
			>
				<p className="label absolute top-3 left-4 m-0">Page 02 — Entries</p>
				{comparing ? (
					<div className="flex flex-col border-t border-ink">
						{comparing.map(
							(g, i) =>
								g.codes.length > 0 && (
									// Open on what's new to the visitor: the places only they've been
									<details
										key={g.label}
										open={i === 1}
										className="group border-b border-line"
									>
										<summary className="label flex items-center gap-2 min-h-12 px-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
											<GroupLabel {...g} />
											<span
												aria-hidden="true"
												className="ml-auto font-mono text-lg transition-transform group-open:rotate-45"
											>
												+
											</span>
										</summary>
										<div className="pb-6">
											<CountryList countries={g.codes} />
										</div>
									</details>
								),
						)}
					</div>
				) : (
					<CountryList countries={countries} />
				)}
			</section>

			<section
				id="collections"
				className="scroll-mt-6 page-frame px-4 md:px-8 pt-11 pb-6"
			>
				<p className="label absolute top-3 left-4 m-0">Page 03 — Collections</p>
				<Collections
					countries={countries}
					yours={comparing ? [...both, ...onlyMe] : undefined}
				/>
			</section>
		</Page>
	);
};

export default SharedMap;
