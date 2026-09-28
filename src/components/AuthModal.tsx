import { useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "./Modal";

interface Props {
	onClose: () => void;
}

const inputClass =
	"border-0 border-b-4 border-primary text-xl py-2 px-2 bg-transparent focus:outline-none w-full";
const buttonClass =
	"bg-primary text-white py-3 px-8 uppercase font-bold tracking-widest hover:bg-orange-700 active:scale-95 transition-all disabled:opacity-50";

// The App's onAuthStateChange listener handles SIGNED_IN and closes this modal.
const AuthModal = ({ onClose }: Props) => {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [step, setStep] = useState<"email" | "code">("email");
	const [error, setError] = useState<string>();
	const [submitting, setSubmitting] = useState(false);

	const sendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!supabase) return;
		setSubmitting(true);
		setError(undefined);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: true },
		});
		setSubmitting(false);
		if (error) setError(error.message);
		else setStep("code");
	};

	const verifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!supabase) return;
		setSubmitting(true);
		setError(undefined);
		const { error } = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "email",
		});
		setSubmitting(false);
		if (error) setError(error.message);
	};

	const errorMessage = error && (
		<p role="alert" className="text-sm text-red-700 font-bold">
			{error}
		</p>
	);

	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-6 pt-8">
				<h2 className="font-luckiest-guy text-3xl text-center">Sign In</h2>

				{step === "email" ? (
					<form onSubmit={sendCode} className="flex flex-col gap-6">
						<label className="flex flex-col gap-1">
							<span className="sr-only">Email</span>
							<input
								type="email"
								placeholder="Email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className={inputClass}
							/>
						</label>
						{errorMessage}
						<button type="submit" disabled={submitting} className={buttonClass}>
							{submitting ? "..." : "Send Code"}
						</button>
					</form>
				) : (
					<form onSubmit={verifyCode} className="flex flex-col gap-6">
						<p className="text-sm text-gray-600 text-center">
							We sent a code to <strong>{email}</strong>
						</p>
						<label className="flex flex-col gap-1">
							<span className="sr-only">Sign-in code</span>
							<input
								type="text"
								inputMode="numeric"
								autoComplete="one-time-code"
								placeholder="8-digit code"
								required
								value={code}
								onChange={(e) => setCode(e.target.value.trim())}
								maxLength={8}
								className={`${inputClass} tracking-widest text-center`}
							/>
						</label>
						{errorMessage}
						<button type="submit" disabled={submitting} className={buttonClass}>
							{submitting ? "..." : "Verify"}
						</button>
						<button
							type="button"
							onClick={() => {
								setStep("email");
								setCode("");
								setError(undefined);
							}}
							className="text-sm text-gray-600 text-center"
						>
							Use a different email
						</button>
					</form>
				)}
			</div>
		</Modal>
	);
};

export default AuthModal;
