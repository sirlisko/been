import type { CountryCode } from "../types";
import { UN_STATES, getCountryName } from "./countries";
import { countryBounds } from "./shapes";

const codes = (list: string) => list.split(" ") as CountryCode[];

// UN M49 regions; Asia is whatever's left, so the five always partition the 195 states
const AFRICA = codes(
	"AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZA ZM ZW",
);
const AMERICAS = codes(
	"AG AR BB BO BR BS BZ CA CL CO CR CU DM DO EC GD GT GY HN HT JM KN LC MX NI PA PE PY SR SV TT US UY VC VE",
);
const EUROPE = codes(
	"AD AL AT BA BE BG BY CH CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA",
);
const OCEANIA = codes("AU FJ FM KI MH NR NZ PG PW SB TO TV VU WS");
const notAsia = new Set<string>([
	...AFRICA,
	...AMERICAS,
	...EUROPE,
	...OCEANIA,
]);
const ASIA = [...UN_STATES].filter((c) => !notAsia.has(c)) as CountryCode[];

export const CONTINENTS = [
	{ name: "Europe", codes: EUROPE },
	{ name: "Americas", codes: AMERICAS },
	{ name: "Asia", codes: ASIA },
	{ name: "Oceania", codes: OCEANIA },
	{ name: "Africa", codes: AFRICA },
];

export const TIERS = [25, 50, 75, 100];

export interface Collection {
	title: string;
	kind: string;
	mark: string;
	note?: string;
	codes: CountryCode[];
}

// UN states only; `note` names the source wherever the list isn't obvious
export const COLLECTIONS: Collection[] = [
	{
		title: "Along the Amazon",
		kind: "River",
		mark: "AMAZON",
		note: "Countries the river flows through.",
		codes: codes("PE CO BR"),
	},
	{
		title: "The Mekong",
		kind: "River",
		mark: "MEKONG",
		note: "Countries the river flows through.",
		codes: codes("CN MM LA TH KH VN"),
	},
	{
		title: "Down the Danube",
		kind: "River",
		mark: "DANUBE",
		note: "Countries the river flows through.",
		codes: codes("DE AT SK HU HR RS RO BG MD UA"),
	},
	{
		title: "The Nile basin",
		kind: "River",
		mark: "NILE",
		note: "Nile Basin Initiative members; Eritrea is only an observer.",
		codes: codes("BI CD EG ET KE RW SS SD TZ UG"),
	},
	{
		title: "The Andes",
		kind: "Mountains",
		mark: "ANDES",
		codes: codes("VE CO EC PE BO CL AR"),
	},
	{
		title: "The Himalayas",
		kind: "Mountains",
		mark: "HIMALAYA",
		codes: codes("BT CN IN NP PK"),
	},
	{
		title: "The Alps",
		kind: "Mountains",
		mark: "ALPS",
		note: "Members of the Alpine Convention.",
		codes: codes("AT CH DE FR IT LI MC SI"),
	},
	{
		title: "Along the Equator",
		kind: "Line on the map",
		mark: "0°",
		note: "Includes the Maldives, where the line crosses its waters.",
		codes: codes("EC CO BR ST GA CG CD UG KE SO MV ID KI"),
	},
	{
		title: "Hispanophone world",
		kind: "Language",
		mark: "HOLA",
		note: "Spanish is an official language. Puerto Rico is a territory, so it doesn't count.",
		codes: codes("AR BO CL CO CR CU DO EC SV GQ GT HN MX NI PA PY PE ES UY VE"),
	},
	{
		title: "Lusophone world",
		kind: "Language",
		mark: "OLÁ",
		note: "Members of the Community of Portuguese Language Countries.",
		codes: codes("AO BR CV GW GQ MZ PT ST TL"),
	},
	{
		title: "G7",
		kind: "Club",
		mark: "G7",
		codes: codes("CA FR DE IT JP GB US"),
	},
	{
		title: "Arctic Council",
		kind: "Club",
		mark: "ARCTIC",
		codes: codes("CA DK FI IS NO RU SE US"),
	},
	{
		title: "North America",
		kind: "Region",
		mark: "N·AM",
		note: "The USMCA countries.",
		codes: codes("CA US MX"),
	},
	{
		title: "Central America",
		kind: "Region",
		mark: "C·AM",
		note: "The seven countries on the isthmus.",
		codes: codes("BZ GT SV HN NI CR PA"),
	},
	{
		title: "The Maghreb",
		kind: "Region",
		mark: "MAGHREB",
		note: "Members of the Arab Maghreb Union.",
		codes: codes("DZ LY MR MA TN"),
	},
	{
		title: "Horn of Africa",
		kind: "Region",
		mark: "HORN",
		codes: codes("DJ ER ET SO"),
	},
	{
		title: "Southern African Customs Union",
		kind: "Region",
		mark: "SACU",
		codes: codes("BW SZ LS NA ZA"),
	},
	{
		title: "East African Community",
		kind: "Region",
		mark: "EAC",
		codes: codes("BI CD KE RW SO SS TZ UG"),
	},
	{
		title: "ASEAN",
		kind: "Region",
		mark: "ASEAN",
		note: "Includes Timor-Leste, admitted in October 2025.",
		codes: codes("BN KH ID LA MY MM PH SG TH VN TL"),
	},
	{
		title: "Central Asia",
		kind: "Region",
		mark: "C·ASIA",
		codes: codes("KZ KG TJ TM UZ"),
	},
	{
		title: "The Caucasus",
		kind: "Region",
		mark: "CAUCASUS",
		codes: codes("AM AZ GE"),
	},
	{
		title: "Gulf states",
		kind: "Region",
		mark: "GULF",
		note: "Members of the Gulf Cooperation Council.",
		codes: codes("BH KW OM QA SA AE"),
	},
	{
		title: "Melanesia",
		kind: "Region",
		mark: "MELANESIA",
		note: "The UN's Melanesia region, sovereign states only.",
		codes: codes("FJ PG SB VU"),
	},
	{ title: "Down Under", kind: "Region", mark: "OZ·NZ", codes: codes("AU NZ") },
	{
		title: "Nordic countries",
		kind: "Region",
		mark: "NORDIC",
		codes: codes("DK FI IS NO SE"),
	},
	{
		title: "Baltic states",
		kind: "Region",
		mark: "BALTIC",
		codes: codes("EE LV LT"),
	},
	{ title: "Benelux", kind: "Region", mark: "BNLX", codes: codes("BE NL LU") },
	{
		title: "British Isles",
		kind: "Region",
		mark: "ISLES",
		codes: codes("GB IE"),
	},
];

const list = new Intl.ListFormat("en");

export function progress(collection: Collection, visited: Set<string>) {
	const missing = collection.codes.filter((c) => !visited.has(c));
	const have = collection.codes.length - missing.length;
	return {
		...collection,
		have,
		total: collection.codes.length,
		detail:
			missing.length === 0
				? `${list.format(collection.codes.map(getCountryName))}.`
				: missing.length <= 4
					? `Missing ${list.format(missing.map(getCountryName))}.`
					: `${missing.length} to go.`,
	};
}

export function completedCollections(countries: CountryCode[]): Collection[] {
	const visited = new Set<string>(countries);
	return COLLECTIONS.filter((c) => c.codes.every((code) => visited.has(code)));
}

export function completedTitles(countries: CountryCode[]): Set<string> {
	return new Set(completedCollections(countries).map((c) => c.title));
}

// A 2:1 viewBox framing the collection, padded so small ones keep some context
export function collectionViewBox(codes: CountryCode[]): string | null {
	const boxes = codes
		.map((code) => countryBounds(code)?.bounds)
		.filter((b) => b !== undefined);
	if (boxes.length === 0) return null;
	const [minX, minY, maxX, maxY] = boxes.reduce((a, b) => [
		Math.min(a[0], b[0]),
		Math.min(a[1], b[1]),
		Math.max(a[2], b[2]),
		Math.max(a[3], b[3]),
	]);
	const pad = Math.max(maxX - minX, maxY - minY) * 0.15 + 20;
	let w = maxX - minX + pad * 2;
	let h = maxY - minY + pad * 2;
	if (w < h * 2) w = h * 2;
	else h = w / 2;
	const x = (minX + maxX - w) / 2;
	const y = (minY + maxY - h) / 2;
	return [x, y, w, h].map(Math.round).join(" ");
}
