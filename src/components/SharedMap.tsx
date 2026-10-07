import { useEffect, useState } from "react";
import { loadPublicMap } from "../lib/countriesDB";
import { readOwnCountries } from "../lib/localCountries";
import type { CountryCode } from "../types";
import { posterParams, printingOpen } from "../utils/poster";
import Collections from "./Collections";
import CountryList from "./CountryList";
import Page, { primaryButtonClass, secondaryButtonClass } from "./Page";
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
			swatch: "bg-green",
		},
		{
			label: `Only ${name ?? "them"}`,
			codes: onlyThem,
			swatch: "bg-blue",
		},
		{ label: "Only you", codes: onlyMe, swatch: "bg-red" },
	];
}

const GroupLabel = ({ label, codes, swatch }: Group) => (
	<>
		<span aria-hidden="true" className={`size-3 rounded-sm ${swatch}`} />
		{label} <span className="text-muted">{codes.length}</span>
	</>
);

const makeYourOwn = (
	<a href="/" className={secondaryButtonClass}>
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
			<p className="m-0 py-10 text-center text-lg text-muted">
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
			<section
				id="world"
				aria-labelledby="world-title"
				className="flex flex-col gap-4 p-3 md:p-6 rounded-2xl bg-page border border-line"
			>
				<div className="flex flex-col gap-2 px-1 md:px-0">
					<h1
						id="world-title"
						className="m-0 font-display font-bold text-2xl md:text-3xl tracking-tight"
					>
						{name ? `Where ${name} has been` : "Where they've been"}
					</h1>
					<Stats countries={countries} />
				</div>
				<WorldMap selected={onlyThem} highlighted={onlyMe} shared={both} />
				{same && <p className="m-0 text-muted">Same stamps as yours.</p>}
				{comparing && (
					<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
						<ul className="m-0 p-0 list-none flex flex-wrap gap-x-6 gap-y-2">
							{comparing.map((g) => (
								<li
									key={g.label}
									className="flex items-center gap-2 text-sm font-semibold"
								>
									<GroupLabel {...g} />
								</li>
							))}
						</ul>
						{printingOpen() && (
							<a
								href={`/print?${posterParams({
									size: "30x40",
									visited: [...both, ...onlyMe],
									with: countries,
									partner: name,
								})}`}
								className={primaryButtonClass}
							>
								Print it together
							</a>
						)}
					</div>
				)}
			</section>

			<section
				id="stamps"
				aria-labelledby="stamps-title"
				className="flex flex-col gap-4"
			>
				<h2
					id="stamps-title"
					className="m-0 font-display font-bold text-2xl md:text-3xl tracking-tight"
				>
					{name ? `${name}’s stamps` : "Their stamps"}
				</h2>
				{comparing ? (
					<div className="flex flex-col rounded-xl bg-page border border-line px-3 md:px-5">
						{comparing.map(
							(g, i) =>
								g.codes.length > 0 && (
									// Open on what's new to the visitor: the places only they've been
									<details
										key={g.label}
										open={i === 1}
										className="group border-b border-line last:border-b-0"
									>
										<summary className="flex items-center gap-2 min-h-12 font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden">
											<GroupLabel {...g} />
											<span
												aria-hidden="true"
												className="ml-auto text-2xl leading-none transition-transform group-open:rotate-45"
											>
												+
											</span>
										</summary>
										<div className="pb-5">
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
				aria-labelledby="collections-title"
				className="flex flex-col gap-4"
			>
				<h2
					id="collections-title"
					className="m-0 font-display font-bold text-2xl md:text-3xl tracking-tight"
				>
					Collections
				</h2>
				<Collections
					countries={countries}
					yours={comparing ? [...both, ...onlyMe] : undefined}
				/>
			</section>
		</Page>
	);
};

export default SharedMap;
