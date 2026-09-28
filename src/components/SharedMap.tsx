import type { CountryCode } from "../types";
import CountryList from "./CountryList";
import Page, { linkButtonClass } from "./Page";
import Stats from "./Stats";
import WorldMap from "./WorldMap";

interface Props {
	countries: CountryCode[];
}

const SharedMap = ({ countries }: Props) => (
	<Page
		action={
			<a href="/" className={`inline-block ${linkButtonClass}`}>
				make your own map
			</a>
		}
	>
		<WorldMap selected={countries} />
		<Stats countries={countries} />
		<CountryList countries={countries} />
	</Page>
);

export default SharedMap;
