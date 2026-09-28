import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";
import App from "./App.tsx";
import SharedMap from "./components/SharedMap.tsx";
import { rememberSharedMap } from "./lib/localCountries.ts";
import { parseShareParam } from "./utils/countries.ts";
import { parseShareName } from "./utils/shareMeta.ts";

const params = new URLSearchParams(location.search);
const shared = parseShareParam(params.get("visited"));
if (shared) rememberSharedMap(location.search);

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		{shared ? (
			<SharedMap countries={shared} name={parseShareName(params.get("name"))} />
		) : (
			<App />
		)}
	</StrictMode>,
);
