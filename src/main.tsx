import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";
import App from "./App.tsx";
import SharedMap from "./components/SharedMap.tsx";
import { parseShareParam } from "./utils/countries.ts";

const shared = parseShareParam(
	new URLSearchParams(location.search).get("visited"),
);

// biome-ignore lint/style/noNonNullAssertion: #root is defined in index.html
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		{shared ? <SharedMap countries={shared} /> : <App />}
	</StrictMode>,
);
