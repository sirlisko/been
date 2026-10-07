import type { AuthError } from "@supabase/supabase-js";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "./Modal";

interface Props {
	onClose: () => void;
}

const inputClass =
	"w-full h-12 px-3.5 rounded-lg border-[1.5px] border-line bg-page text-base text-ink placeholder:text-muted focus:outline-none focus:border-blue";
export const buttonClass =
	"inline-flex items-center justify-center min-h-12 px-6 rounded-lg bg-blue text-page font-semibold hover:bg-blue/90 disabled:opacity-50";

export function authErrorMessage(error: AuthError): string {
	if (error.status === 429) {
		return "Too many sign-in attempts. Wait a few minutes and try again.";
	}
	if (error.code === "otp_expired") {
		return "That code is wrong or has expired.";
	}
	return error.message;
}

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
		if (error) setError(authErrorMessage(error));
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
		if (error) setError(authErrorMessage(error));
	};

	const errorMessage = error && (
		<p role="alert" className="text-sm text-red font-semibold">
			{error}
		</p>
	);

	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-6">
				<h2 className="m-0 font-display font-bold text-3xl tracking-tight">
					Sign In
				</h2>
				{step === "email" && (
					<p className="m-0 -mt-3 text-sm text-muted">
						We&apos;ll email you a one-time code. Your stamps sync across
						devices.
					</p>
				)}

				{step === "email" ? (
					<form onSubmit={sendCode} className="flex flex-col gap-6">
						<label className="flex flex-col gap-1">
							<span className="font-semibold">Email</span>
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
						<p className="m-0 text-sm text-muted">
							We sent a code to <strong>{email}</strong>
						</p>
						<label className="flex flex-col gap-1">
							<span className="font-semibold">Sign-in code</span>
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
							className="text-sm font-semibold text-blue underline underline-offset-4 self-start min-h-11"
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
