import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "./Modal";

interface Props {
	onClose: () => void;
	onSuccess: (user: User) => void;
}

const AuthModal = ({ onClose, onSuccess }: Props) => {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [step, setStep] = useState<"email" | "code">("email");
	const [error, setError] = useState<string>();
	const [submitting, setSubmitting] = useState(false);

	const sendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(undefined);
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: true },
		});
		if (error) {
			setError(error.message);
		} else {
			setStep("code");
		}
		setSubmitting(false);
	};

	const verifyCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		setError(undefined);
		const { data, error } = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "email",
		});
		if (error) {
			setError(error.message);
		} else {
			const user = data.user ?? data.session?.user;
			if (user) {
				onSuccess(user);
			} else {
				setError("Sign in failed, please try again.");
			}
		}
		setSubmitting(false);
	};

	return (
		<Modal isModalOpen onClose={onClose}>
			<div className="flex flex-col gap-6 pt-8">
				<h2 className="font-luckiest-guy text-3xl text-center">Sign In</h2>

				{step === "email" ? (
					<form onSubmit={sendCode} className="flex flex-col gap-6">
						<input
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="border-0 border-b border-accent text-xl outline-accent py-1 px-2"
						/>
						{error && <p className="text-sm text-accent">{error}</p>}
						<button
							type="submit"
							disabled={submitting}
							className="bg-gradient-to-r from-accent to-alternate text-white py-3 px-8 uppercase font-bold border-none rounded-full tracking-widest hover:scale-105 transition-transform"
						>
							{submitting ? "..." : "Send Code"}
						</button>
					</form>
				) : (
					<form onSubmit={verifyCode} className="flex flex-col gap-6">
						<p className="text-sm text-gray-500 text-center">
							We sent a code to <strong>{email}</strong>
						</p>
						<input
							type="text"
							placeholder="8-digit code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							maxLength={8}
							className="border-0 border-b border-accent text-xl outline-accent py-1 px-2 tracking-widest text-center"
						/>
						{error && <p className="text-sm text-accent">{error}</p>}
						<button
							type="submit"
							disabled={submitting}
							className="bg-gradient-to-r from-accent to-alternate text-white py-3 px-8 uppercase font-bold border-none rounded-full tracking-widest hover:scale-105 transition-transform"
						>
							{submitting ? "..." : "Verify"}
						</button>
						<button
							type="button"
							onClick={() => {
								setStep("email");
								setCode("");
								setError(undefined);
							}}
							className="text-sm text-gray-500 text-center"
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
