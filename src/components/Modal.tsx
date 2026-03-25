import { type ReactElement, useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
	isModalOpen?: boolean;
	onClose: () => void;
	children: ReactElement;
}

const Modal = ({ isModalOpen, onClose, children }: Props) => {
	useEffect(() => {
		if (!isModalOpen) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKey);
			document.body.style.overflow = "";
		};
	}, [isModalOpen, onClose]);

	if (!isModalOpen) return null;

	return createPortal(
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click handled by Escape key above
		<div
			className="fixed inset-0 bg-black/70 z-10 flex items-center justify-center"
			onClick={onClose}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: inner click just stops propagation */}
			<div
				className="relative w-[90%] p-10 bg-white rounded-md shadow-2xl max-w-[700px] max-h-[95vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 border-none p-0 text-2xl bg-transparent leading-none"
				>
					×
				</button>
				{children}
			</div>
		</div>,
		document.body,
	);
};

export default Modal;
