import { type ReactNode, useState } from "react";
import { currentTheme, saveTheme } from "../lib/theme";

interface Props {
	actions: ReactNode;
	children: ReactNode;
}

const buttonBase =
	"inline-flex items-center justify-center gap-2 min-h-11 px-4 md:px-5 rounded-lg font-semibold no-underline disabled:opacity-50";

export const primaryButtonClass = `${buttonBase} bg-red text-page hover:bg-red/90`;

export const secondaryButtonClass = `${buttonBase} bg-blue text-page hover:bg-blue/90`;

export const linkButtonClass =
	"inline-flex items-center min-h-11 px-1 font-semibold text-blue underline underline-offset-4 decoration-2 hover:decoration-red";

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
			className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-ink hover:bg-ink/5"
		>
			<svg
				viewBox="0 0 24 24"
				width="20"
				height="20"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				{theme === "dark" ? (
					<>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
					</>
				) : (
					<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
				)}
			</svg>
		</button>
	);
};

const Page = ({ actions, children }: Props) => (
	<>
		<div aria-hidden="true" className="airmail h-2" />
		<div className="max-w-6xl mx-auto px-4 md:px-8 pt-3 md:pt-6 pb-8 flex flex-col gap-6 md:gap-10">
			<header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
				<a
					href="/"
					className="font-display font-extrabold text-[28px] md:text-[32px] tracking-tight text-blue no-underline"
				>
					Been
				</a>
				<div className="flex items-center gap-2 md:gap-4">
					<ThemeToggle />
					{actions}
				</div>
			</header>

			<main className="flex flex-col gap-8 md:gap-12">{children}</main>

			<footer className="flex justify-between gap-4 pt-4 border-t border-line text-sm text-muted">
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
	</>
);

export default Page;
