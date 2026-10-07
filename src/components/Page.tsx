import { type ReactNode, useState } from "react";
import { currentTheme, saveTheme } from "../lib/theme";

interface Props {
	actions: ReactNode;
	children: ReactNode;
	nav?: boolean;
}

export const linkButtonClass =
	"font-mono text-xs md:text-[13px] uppercase tracking-wider text-ink underline underline-offset-4 min-h-11 px-1";

export const primaryButtonClass =
	"font-mono text-xs md:text-[13px] uppercase tracking-wider bg-ink text-paper min-h-11 px-4 md:px-5 hover:bg-ink/90 disabled:opacity-50";

const ThemeToggle = () => {
	const [theme, setTheme] = useState(currentTheme);
	const next = theme === "dark" ? "light" : "dark";
	return (
		<button
			type="button"
			aria-label={`Switch to ${next} mode`}
			title={`Switch to ${next} mode`}
			onClick={() => {
				saveTheme(next);
				setTheme(next);
			}}
			className="min-h-11 min-w-11 font-mono text-lg text-ink"
		>
			{/* \uFE0E: text glyphs, not emoji */}
			{theme === "dark" ? "\u2600\uFE0E" : "\u263E\uFE0E"}
		</button>
	);
};

const Page = ({ actions, children, nav = true }: Props) => (
	<div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-8 flex flex-col gap-8 md:gap-10">
		<header className="flex flex-wrap items-center justify-between gap-x-4 pb-3 md:pb-5 border-b border-ink">
			<a
				href="/"
				className="font-display italic font-semibold text-3xl md:text-4xl tracking-tight no-underline"
			>
				Been.
			</a>
			{nav && (
				<nav
					aria-label="Sections"
					className="order-last basis-full sm:order-none sm:basis-auto sm:mr-auto flex gap-4"
				>
					{[
						["#world", "The world"],
						["#entries", "Entries"],
						["#collections", "Collections"],
					].map(([href, label]) => (
						<a
							key={href}
							href={href}
							className="label hover:text-ink min-h-11 inline-flex items-center"
						>
							{label}
						</a>
					))}
				</nav>
			)}
			<div className="flex items-center gap-3 md:gap-6">
				<ThemeToggle />
				{actions}
			</div>
		</header>

		<main className="flex flex-col gap-8 md:gap-10">{children}</main>

		<footer className="flex justify-between gap-4 pt-4 border-t border-ink font-mono text-xs text-muted">
			<span>
				Made with ❤️ by{" "}
				<a
					href="https://sirlisko.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-ink underline underline-offset-2"
				>
					sirlisko
				</a>
			</span>
			<span className="hidden sm:inline">been.sirlisko.com</span>
		</footer>
	</div>
);

export default Page;
