import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";
import App from "./App.tsx";
import SharedMap, { ProfileMap } from "./components/SharedMap.tsx";
import { rememberSharedMap } from "./lib/localCountries.ts";
import { applyTheme, storedTheme } from "./lib/theme.ts";
import { parseShareParam } from "./utils/countries.ts";
import { parseShareName } from "./utils/shareMeta.ts";

applyTheme(storedTheme());

const params = new URLSearchParams(location.search);
const shared = parseShareParam(params.get("visited"));
const username = location.pathname.match(/^\/@([\w-]{3,20})\/?$/)?.[1];
if (shared || username) rememberSharedMap(location.pathname + location.search);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
	navigator.serviceWorker.register("/sw.js");
}

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		{username ? (
			<ProfileMap username={username.toLowerCase()} />
		) : shared ? (
			<SharedMap countries={shared} name={parseShareName(params.get("name"))} />
		) : (
			<App />
		)}
	</StrictMode>,
);
