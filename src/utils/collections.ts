import type { CountryCode } from "../types";
import { UN_STATES, getCountryName } from "./countries";

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
	codes: CountryCode[];
}

// UN states only; each list follows the source noted beside it
export const COLLECTIONS: Collection[] = [
	// Countries the river itself flows through
	{
		title: "Along the Amazon",
		kind: "River",
		mark: "AMAZON",
		codes: codes("PE CO BR"),
	},
	{
		title: "The Mekong",
		kind: "River",
		mark: "MEKONG",
		codes: codes("CN MM LA TH KH VN"),
	},
	{
		title: "Down the Danube",
		kind: "River",
		mark: "DANUBE",
		codes: codes("DE AT SK HU HR RS RO BG MD UA"),
	},
	// Nile Basin Initiative member states (Eritrea is an observer)
	{
		title: "The Nile basin",
		kind: "River",
		mark: "NILE",
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
	// Alpine Convention
	{
		title: "The Alps",
		kind: "Mountains",
		mark: "ALPS",
		codes: codes("AT CH DE FR IT LI MC SI"),
	},
	// Includes the Maldives, where it crosses territorial waters
	{
		title: "Along the Equator",
		kind: "Line on the map",
		mark: "0°",
		codes: codes("EC CO BR ST GA CG CD UG KE SO MV ID KI"),
	},
	// Spanish as an official language (excluding Puerto Rico, a territory)
	{
		title: "Hispanophone world",
		kind: "Language",
		mark: "HOLA",
		codes: codes("AR BO CL CO CR CU DO EC SV GQ GT HN MX NI PA PY PE ES UY VE"),
	},
	// CPLP member states
	{
		title: "Lusophone world",
		kind: "Language",
		mark: "OLÁ",
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
	// USMCA
	{
		title: "North America",
		kind: "Region",
		mark: "N·AM",
		codes: codes("CA US MX"),
	},
	// The seven isthmus countries
	{
		title: "Central America",
		kind: "Region",
		mark: "C·AM",
		codes: codes("BZ GT SV HN NI CR PA"),
	},
	// Arab Maghreb Union
	{
		title: "The Maghreb",
		kind: "Region",
		mark: "MAGHREB",
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
	// Including Timor-Leste, admitted October 2025
	{
		title: "ASEAN",
		kind: "Region",
		mark: "ASEAN",
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
	// Gulf Cooperation Council
	{
		title: "Gulf states",
		kind: "Region",
		mark: "GULF",
		codes: codes("BH KW OM QA SA AE"),
	},
	// UN M49 Melanesia, UN states only
	{
		title: "Melanesia",
		kind: "Region",
		mark: "MELANESIA",
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

export function completedTitles(countries: CountryCode[]): Set<string> {
	const visited = new Set<string>(countries);
	return new Set(
		COLLECTIONS.filter((c) => c.codes.every((code) => visited.has(code))).map(
			(c) => c.title,
		),
	);
}
