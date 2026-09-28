import type { ReactNode } from "react";

interface Props {
	actions: ReactNode;
	children: ReactNode;
}

export const linkButtonClass =
	"font-mono text-xs md:text-[13px] uppercase tracking-wider text-ink underline underline-offset-4 min-h-11 px-1";

export const primaryButtonClass =
	"font-mono text-xs md:text-[13px] uppercase tracking-wider bg-ink text-paper min-h-11 px-4 md:px-5 hover:bg-ink/90 disabled:opacity-50";

const Page = ({ actions, children }: Props) => (
	<div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-8 flex flex-col gap-8 md:gap-10">
		<header className="flex items-center justify-between gap-4 pb-3 md:pb-5 border-b border-ink">
			<div className="flex items-baseline gap-4">
				<a
					href="/"
					className="font-display italic font-semibold text-3xl md:text-4xl tracking-tight no-underline"
				>
					Been.
				</a>
				<span className="label hidden sm:inline">Travel record</span>
			</div>
			<div className="flex items-center gap-3 md:gap-6">{actions}</div>
		</header>

		<main className="flex flex-col gap-8 md:gap-10">{children}</main>

		<footer className="flex justify-between gap-4 pt-4 border-t border-ink font-mono text-xs text-muted">
			<span>
				Made with care by{" "}
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
