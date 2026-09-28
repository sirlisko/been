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
			className="p-0 w-[90%] max-w-[700px] max-h-[95vh] bg-white border-4 border-primary backdrop:bg-black/70"
		>
			<div className="relative p-10">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute top-4 right-4 border-none p-0 text-2xl bg-transparent leading-none"
				>
					×
				</button>
				{children}
			</div>
		</dialog>
	);
};

export default Modal;
