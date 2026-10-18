import { afterEach, beforeEach, expect, it, vi } from "vitest";

const script = () =>
	document.head.querySelector<HTMLScriptElement>(
		'script[src="/stats/script.js"]',
	);

const setup = async (env: { PROD: boolean; VITE_UMAMI_ID?: string }) => {
	vi.stubEnv("PROD", env.PROD);
	vi.stubEnv("VITE_UMAMI_ID", env.VITE_UMAMI_ID ?? "");
	vi.resetModules();
	const analytics = await import("./analytics");
	analytics.loadAnalytics();
	return analytics;
};

beforeEach(() => {
	window.umami = { track: vi.fn() };
});

afterEach(() => {
	script()?.remove();
	localStorage.clear();
	vi.unstubAllEnvs();
	window.umami = undefined;
});

it("loads the script through the proxy, sending events back through it", async () => {
	await setup({ PROD: true, VITE_UMAMI_ID: "site-id" });
	expect(script()?.dataset).toMatchObject({
		websiteId: "site-id",
		hostUrl: "/stats",
		excludeSearch: "true",
	});
});

it("tracks events once the script has loaded", async () => {
	const { track } = await setup({ PROD: true, VITE_UMAMI_ID: "site-id" });
	track("print_view", { map: "solo" });
	await Promise.resolve();
	expect(window.umami?.track).not.toHaveBeenCalled();

	script()?.dispatchEvent(new Event("load"));
	await vi.waitFor(() =>
		expect(window.umami?.track).toHaveBeenCalledWith("print_view", {
			map: "solo",
		}),
	);
});

it("tracks a once-only event a single time per id", async () => {
	const { trackOnce } = await setup({ PROD: true, VITE_UMAMI_ID: "site-id" });
	script()?.dispatchEvent(new Event("load"));
	trackOnce("cs_1", "order_paid");
	trackOnce("cs_1", "order_paid");
	trackOnce("cs_2", "order_paid");
	await vi.waitFor(() => expect(window.umami?.track).toHaveBeenCalledTimes(2));
});

it.each([{ PROD: false, VITE_UMAMI_ID: "site-id" }, { PROD: true }])(
	"stays off in dev or without a website id: %o",
	async (env) => {
		const { track } = await setup(env);
		expect(script()).toBeNull();
		track("print_view");
		await Promise.resolve();
		expect(window.umami?.track).not.toHaveBeenCalled();
	},
);
