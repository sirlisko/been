import { useEffect, useState } from "react";
import { loadPublicMap } from "../lib/countriesDB";
import { readOwnCountries } from "../lib/localCountries";
import type { CountryCode } from "../types";
import { posterParams } from "../utils/poster";
import Collections from "./Collections";
import CountryList from "./CountryList";
import Page, { linkButtonClass, primaryButtonClass } from "./Page";
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

const makeYourOwn = (
	<a
		href="/"
		className={`${primaryButtonClass} inline-flex items-center no-underline`}
	>
		Make your own
	</a>
);

// A map shared as /@username, read live from the account
export const ProfileMap = ({ username }: { username: string }) => {
	// undefined while loading, null when nobody has this username
	const [countries, setCountries] = useState<CountryCode[] | null>();
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		loadPublicMap(username).then(setCountries, (e) => {
			console.error("Loading shared map failed:", e);
			setFailed(true);
		});
	}, [username]);

	if (countries) return <SharedMap countries={countries} name={username} />;
	return (
		<Page actions={makeYourOwn}>
			<p className="m-0 py-10 text-center font-display italic text-xl text-muted">
				{failed
					? "Couldn't load this map, please try again."
					: countries === null
						? `There's no public map at @${username}.`
						: "Loading…"}
			</p>
		</Page>
	);
};

const SharedMap = ({ countries, name }: Props) => {
	const groups = compare(countries, name);
	const same = groups?.every((g, i) => i === 0 || g.codes.length === 0);
	const comparing = same ? null : groups;
	const [both, onlyThem, onlyMe] = comparing
		? comparing.map((g) => g.codes)
		: [[], countries, []];

	return (
		<Page actions={makeYourOwn}>
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
				<div className="-mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
					<ul className="m-0 p-0 list-none flex flex-wrap gap-x-8 gap-y-2">
						{comparing.map((g) => (
							<li key={g.label} className="label flex items-center gap-2">
								<GroupLabel {...g} />
							</li>
						))}
					</ul>
					<a
						href={`/print?${posterParams({
							size: "30x40",
							visited: [...both, ...onlyMe],
							with: countries,
							partner: name,
						})}`}
						className={`${linkButtonClass} inline-flex items-center`}
					>
						Print it together
					</a>
				</div>
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
