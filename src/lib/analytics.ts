// Umami, self-hosted, reached through the /stats proxy in netlify.toml so the
// CSP stays same-origin. Off unless the website id is set at build time

type EventData = Record<string, string | number>;

declare global {
	interface Window {
		umami?: { track: (event: string, data?: EventData) => void };
	}
}

let loaded: Promise<void> | undefined;

export const loadAnalytics = () => {
	const id = import.meta.env.VITE_UMAMI_ID;
	if (!import.meta.env.PROD || !id) return;
	const script = document.createElement("script");
	script.src = "/stats/script.js";
	script.dataset.websiteId = id;
	// Without it events go to /api/send, which is our Netlify functions
	script.dataset.hostUrl = "/stats";
	// Query strings carry typed names and country lists
	script.dataset.excludeSearch = "true";
	loaded = new Promise((resolve) => {
		script.onload = () => resolve();
	});
	document.head.append(script);
};

// Waits for the script, so events fired on page load still count. Blocked
// or not configured, it never resolves and the event is dropped
export const track = (event: string, data?: EventData) => {
	loaded?.then(() => window.umami?.track(event, data));
};

const firstTime = (key: string) => {
	try {
		if (localStorage.getItem(key)) return false;
		localStorage.setItem(key, "1");
	} catch {}
	return true;
};

// For pages people reload or come back to, like the order confirmation
export const trackOnce = (id: string, event: string, data?: EventData) => {
	loaded?.then(() => {
		if (firstTime(`tracked:${event}:${id}`)) window.umami?.track(event, data);
	});
};
