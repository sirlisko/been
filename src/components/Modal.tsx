import { type ReactElement, useEffect, useRef } from "react";

interface Props {
	onClose: () => void;
	children: ReactElement;
}

const Modal = ({ onClose, children }: Props) => {
	const dialog = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		dialog.current?.showModal();
	}, []);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: native <dialog> already closes on Escape
		<dialog
			ref={dialog}
			onClose={onClose}
			onClick={(e) => e.target === dialog.current && onClose()}
			className="p-0 w-[calc(100%-2rem)] max-w-lg max-h-[95vh] bg-page text-ink border border-ink outline outline-1 outline-ink outline-offset-4 backdrop:bg-ink/60"
		>
			<div className="relative p-6 md:p-10">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute top-2 right-2 w-11 h-11 border-none bg-transparent font-mono text-2xl leading-none text-ink"
				>
					×
				</button>
				{children}
			</div>
		</dialog>
	);
};

export default Modal;
