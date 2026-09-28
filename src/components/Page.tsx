import type { ReactNode } from "react";

interface Props {
	action: ReactNode;
	children: ReactNode;
}

export const linkButtonClass =
	"text-xs font-sans font-bold text-primary uppercase tracking-widest mt-2 border-b-2 border-primary";

const Page = ({ action, children }: Props) => (
	<div>
		<header className="font-display text-center my-12">
			<h1 className="text-7xl text-primary">Been.</h1>
			<p className="font-sans font-normal text-gray-600 mt-2 tracking-widest uppercase text-xs">
				where have you been?
			</p>
			{action}
		</header>

		<main>{children}</main>

		<footer className="text-center mt-12 mb-6 text-sm text-gray-600">
			<p>
				Made with ♥ by{" "}
				<a
					href="https://sirlisko.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary font-bold"
				>
					Luca Lischetti (@sirLisko)
				</a>
			</p>
		</footer>
	</div>
);

export default Page;
