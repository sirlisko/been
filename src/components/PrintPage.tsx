import { useEffect, useState } from "react";
import { completedCollections } from "../utils/collections";
import {
	type PosterSize,
	type PosterSpec,
	SIZES,
	cleanName,
	cleanSubtitle,
	formatPrice,
	posterCountries,
	posterParams,
} from "../utils/poster";
import Page, { linkButtonClass, primaryButtonClass } from "./Page";
import Poster from "./Poster";

interface Props {
	spec: PosterSpec;
	// Our own view for sending an order to the printer
	fulfil?: boolean;
	ordered?: boolean;
}

const inputClass =
	"w-full border-0 border-b-2 border-ink bg-transparent py-2 font-display text-xl text-ink placeholder:text-muted focus:outline-none focus:border-stamp-red";

const PrintPage = ({ spec: initial, fulfil, ordered }: Props) => {
	const [size, setSize] = useState<PosterSize>(initial.size);
	const [name, setName] = useState(initial.name ?? "");
	const [partner, setPartner] = useState(initial.partner ?? "");
	const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
	const earned = completedCollections(posterCountries(initial)).length;
	// On by default when there are any: they're what makes the poster yours
	const [stamps, setStamps] = useState(initial.stamps ?? earned > 0);
	const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
	const together = Boolean(initial.with);
	const spec: PosterSpec = {
		...initial,
		size,
		name: cleanName(name),
		partner: cleanName(partner),
		subtitle: cleanSubtitle(subtitle),
		stamps: stamps && earned > 0,
	};
	const ready = !together || Boolean(spec.name && spec.partner);

	useEffect(() => {
		document.title = "Been — Print your map";
	}, []);

	if (fulfil) {
		return (
			<div className="p-4 print:p-0 flex flex-col items-start gap-4">
				<button
					type="button"
					onClick={() => window.print()}
					className={`${primaryButtonClass} print:hidden`}
				>
					Download PDF ({SIZES[size].label})
				</button>
				<Poster
					spec={spec}
					className={`poster-${size} block w-full max-w-3xl h-auto print:max-w-none print:w-screen print:h-screen`}
				/>
			</div>
		);
	}

	const order = async () => {
		setStatus("loading");
		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(posterParams(spec))),
			});
			if (!response.ok) throw new Error(`Checkout failed: ${response.status}`);
			const { url } = await response.json();
			location.assign(url);
		} catch (e) {
			console.error(e);
			setStatus("failed");
		}
	};

	return (
		<Page
			nav={false}
			actions={
				<a href="/" className={`${linkButtonClass} inline-flex items-center`}>
					Back to your map
				</a>
			}
		>
			<div className="grid lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
				<Poster
					spec={spec}
					className="block w-full max-w-xl mx-auto h-auto shadow-[6px_6px_0_rgb(var(--ink))]"
				/>

				<section className="flex flex-col gap-6">
					<h1 className="m-0 font-display font-normal text-5xl md:text-6xl leading-[0.95] tracking-tight">
						{together ? (
							<>
								Your map, <em className="text-stamp-red">together</em>
							</>
						) : (
							<>
								Put it on the <em className="text-stamp-red">wall</em>
							</>
						)}
					</h1>

					{ordered ? (
						<p className="m-0 font-display text-2xl leading-snug">
							Thank you! Your poster is going to the printer. The receipt is on
							its way to your inbox.
						</p>
					) : (
						<>
							<p className="m-0 text-lg text-muted">
								{together
									? "Both your maps on one poster: where you've been together, and where only one of you has."
									: "Your stamps as a poster, printed to order and posted to you."}
							</p>

							<fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
								<legend className="label mb-2">Size</legend>
								<div className="flex gap-3">
									{(Object.keys(SIZES) as PosterSize[]).map((id) => (
										<label
											key={id}
											className="flex-1 flex flex-col gap-1 p-4 border border-ink cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stamp-red"
										>
											<input
												type="radio"
												name="size"
												value={id}
												checked={size === id}
												onChange={() => setSize(id)}
												className="sr-only"
											/>
											<span className="font-display text-xl">
												{SIZES[id].label}
											</span>
											<span className="font-mono text-sm">
												{formatPrice(SIZES[id].price)}
											</span>
										</label>
									))}
								</div>
							</fieldset>

							<label className="flex flex-col gap-1">
								<span className="label">
									{together ? "Your name" : "Name on the poster (optional)"}
								</span>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									maxLength={30}
									placeholder={together ? "You" : "Where I've been"}
									className={inputClass}
								/>
							</label>
							{together && (
								<label className="flex flex-col gap-1">
									<span className="label">Their name</span>
									<input
										value={partner}
										onChange={(e) => setPartner(e.target.value)}
										maxLength={30}
										placeholder="Them"
										className={inputClass}
									/>
								</label>
							)}
							<label className="flex flex-col gap-1">
								<span className="label">Subtitle (optional)</span>
								<input
									value={subtitle}
									onChange={(e) => setSubtitle(e.target.value)}
									maxLength={50}
									placeholder={
										together
											? "Together since 2019"
											: "Twelve years of wandering"
									}
									className={inputClass}
								/>
							</label>

							<label className="flex items-start gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={stamps && earned > 0}
									disabled={earned === 0}
									onChange={(e) => setStamps(e.target.checked)}
									className="mt-1 size-5 accent-[rgb(var(--ink))]"
								/>
								<span className="flex flex-col gap-0.5">
									<span className="font-display text-xl">
										Add {together ? "your shared" : "your"} stamps
									</span>
									<span className="text-sm text-muted">
										{earned === 0
											? "Complete a collection, like a river or an island group, to earn stamps."
											: `${earned} ${earned === 1 ? "stamp" : "stamps"} from completed collections, inked under the map.`}
									</span>
								</span>
							</label>

							<div className="flex flex-col gap-2">
								<button
									type="button"
									onClick={order}
									disabled={!ready || status === "loading"}
									className={`${primaryButtonClass} self-start`}
								>
									{status === "loading"
										? "Opening checkout…"
										: `Order print – ${formatPrice(SIZES[size].price)}`}
								</button>
								{!ready && (
									<p className="m-0 text-sm text-muted">
										Add both names to order.
									</p>
								)}
								{status === "failed" && (
									<p
										role="alert"
										className="m-0 text-sm text-stamp-red font-semibold"
									>
										Couldn't open checkout, please try again.
									</p>
								)}
								<p className="m-0 text-sm text-muted">
									Includes VAT and UK delivery. Printed to order and posted in
									about a week.
								</p>
							</div>
						</>
					)}
				</section>
			</div>
		</Page>
	);
};

export default PrintPage;
