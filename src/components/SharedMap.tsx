import type { CountryCode } from "../types";
import CountryList from "./CountryList";
import Page, { primaryButtonClass } from "./Page";
import Stats from "./Stats";
import WorldMap from "./WorldMap";

interface Props {
	countries: CountryCode[];
}

const SharedMap = ({ countries }: Props) => (
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
		<section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
			<h1 className="m-0 font-display font-normal text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-xl">
				Where <em className="text-stamp-red">they&apos;ve</em> been
			</h1>
			<Stats countries={countries} />
		</section>

		<section className="page-frame px-2 md:px-8 pt-9 md:pt-10 pb-2 md:pb-6">
			<p className="label absolute top-3 left-4 m-0">Page 01 — The world</p>
			<WorldMap selected={countries} />
		</section>

		<section className="page-frame px-2 md:px-6 pt-11 pb-6">
			<p className="label absolute top-3 left-4 m-0">Page 02 — Entries</p>
			<CountryList countries={countries} />
		</section>
	</Page>
);

export default SharedMap;
