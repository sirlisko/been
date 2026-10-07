import { useEffect, useState } from "react";
import {
	type PosterSize,
	type PosterSpec,
	SIZES,
	cleanName,
	cleanSubtitle,
	formatPrice,
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
	"w-full h-12 px-3.5 rounded-lg border-[1.5px] border-line bg-page text-base text-ink placeholder:text-muted focus:outline-none focus:border-blue";
const headingClass = "font-display font-bold text-lg";

const PrintPage = ({ spec: initial, fulfil, ordered }: Props) => {
	const [size, setSize] = useState<PosterSize>(initial.size);
	const [name, setName] = useState(initial.name ?? "");
	const [partner, setPartner] = useState(initial.partner ?? "");
	const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
	const [map, setMap] = useState(initial.map !== false);
	const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
	const together = Boolean(initial.with);
	const spec: PosterSpec = {
		...initial,
		size,
		name: cleanName(name),
		partner: cleanName(partner),
		subtitle: cleanSubtitle(subtitle),
		map,
	};
	const ready = !together || Boolean(spec.name && spec.partner);

	useEffect(() => {
		document.title = "Been — Print your stamps";
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
			actions={
				<a href="/" className={linkButtonClass}>
					Back to your map
				</a>
			}
		>
			<div className="grid lg:grid-cols-[3fr_2fr] gap-6 lg:gap-10 items-start">
				<div className="flex justify-center p-4 md:p-10 rounded-2xl bg-land lg:sticky lg:top-6">
					<Poster
						spec={spec}
						className="block w-full max-w-lg h-auto shadow-2xl"
					/>
				</div>

				<section className="flex flex-col gap-6 p-5 md:p-7 rounded-2xl bg-page border border-line">
					<div className="flex flex-col gap-2">
						<h1 className="m-0 font-display font-bold text-3xl md:text-4xl tracking-tight">
							{together ? "Print your stamps together" : "Print your stamps"}
						</h1>
						{!ordered && (
							<p className="m-0 text-muted">
								{together
									? "Both your maps on one sheet: full colour where you've both been, faded where only one of you has."
									: "Every country you've collected, as a sheet of stamps printed to order and posted to you."}
							</p>
						)}
					</div>

					{ordered ? (
						<p className="m-0 text-lg leading-snug">
							Thank you! Your poster is going to the printer. The receipt is on
							its way to your inbox.
						</p>
					) : (
						<>
							<div className="flex flex-col gap-3">
								<label className="flex flex-col gap-1.5">
									<span className={headingClass}>
										{together ? "Your name" : "Name on the poster"}
									</span>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										maxLength={30}
										placeholder={
											together ? "You" : "Leave empty for “My stamps”"
										}
										className={inputClass}
									/>
								</label>
								{together && (
									<label className="flex flex-col gap-1.5">
										<span className={headingClass}>Their name</span>
										<input
											value={partner}
											onChange={(e) => setPartner(e.target.value)}
											maxLength={30}
											placeholder="Them"
											className={inputClass}
										/>
									</label>
								)}
								<label className="flex flex-col gap-1.5">
									<span className={headingClass}>Subtitle</span>
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
								<label className="flex items-center gap-3 min-h-11 cursor-pointer">
									<input
										type="checkbox"
										checked={map}
										onChange={(e) => setMap(e.target.checked)}
										className="size-5 accent-[rgb(var(--blue))]"
									/>
									Include the world map
								</label>
							</div>

							<fieldset className="m-0 p-0 border-0 flex flex-col gap-2">
								<legend className={`${headingClass} mb-2`}>Size</legend>
								<div className="grid grid-cols-2 gap-3">
									{(Object.keys(SIZES) as PosterSize[]).map((id) => (
										<label
											key={id}
											className="flex flex-col gap-0.5 p-4 rounded-xl border-[1.5px] border-line cursor-pointer has-[:checked]:border-2 has-[:checked]:border-blue has-[:checked]:bg-blue/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue"
										>
											<input
												type="radio"
												name="size"
												value={id}
												checked={size === id}
												onChange={() => setSize(id)}
												className="sr-only"
											/>
											<span className="font-semibold">{SIZES[id].label}</span>
											<span className="text-sm text-muted">
												{formatPrice(SIZES[id].price)}
											</span>
										</label>
									))}
								</div>
							</fieldset>

							<div className="flex flex-col gap-2">
								<button
									type="button"
									onClick={order}
									disabled={!ready || status === "loading"}
									className={`${primaryButtonClass} min-h-12 text-lg`}
								>
									{status === "loading"
										? "Opening checkout…"
										: `Order for ${formatPrice(SIZES[size].price)}`}
								</button>
								{!ready && (
									<p className="m-0 text-sm text-muted">
										Add both names to order.
									</p>
								)}
								{status === "failed" && (
									<p
										role="alert"
										className="m-0 text-sm text-red font-semibold"
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
