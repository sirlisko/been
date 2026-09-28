import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import {
	type Profile,
	USERNAME_PATTERN,
	UsernameTakenError,
	saveProfile,
} from "../lib/countriesDB";
import { supabase } from "../lib/supabase";
import { buttonClass } from "./AuthModal";
import Modal from "./Modal";
import { linkButtonClass } from "./Page";

interface Props {
	user: User;
	profile: Profile | null;
	onProfileChange: (profile: Profile | null) => void;
	onClose: () => void;
	onDelete: () => Promise<void>;
}

const AccountModal = ({
	user,
	profile,
	onProfileChange,
	onClose,
	onDelete,
}: Props) => {
	const [name, setName] = useState(profile?.username ?? "");
	const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
	const [status, setStatus] = useState<string>();
	const [error, setError] = useState<string>();
	const [submitting, setSubmitting] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const saveName = async (e: React.FormEvent) => {
		e.preventDefault();
		const username = name.trim().toLowerCase();
		const next = username ? { username, isPublic } : null;
		setError(undefined);
		setStatus(undefined);
		if (username && !USERNAME_PATTERN.test(username)) {
			setError("3–20 characters: letters, numbers, - and _.");
			return;
		}
		setSubmitting(true);
		try {
			await saveProfile(user.id, next);
			onProfileChange(next);
			setName(username);
			setStatus("Saved.");
		} catch (e) {
			setError(
				e instanceof UsernameTakenError
					? `@${username} is taken, try another.`
					: "Couldn't save, please try again.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const deleteAccount = async () => {
		setSubmitting(true);
		setError(undefined);
		try {
			await onDelete();
		} catch (e) {
			console.error("Delete failed:", e);
			setError("Couldn't delete your account, please try again.");
			setSubmitting(false);
		}
	};

	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-6">
				<h2 className="m-0 font-display italic font-normal text-4xl">
					Account
				</h2>
				<p className="m-0 -mt-3 text-sm text-muted">
					Signed in as <strong className="text-ink">{user.email}</strong>
				</p>

				<form onSubmit={saveName} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1">
						<span className="label">Username</span>
						<span className="flex items-baseline border-b-2 border-ink focus-within:border-stamp-red">
							<span className="shrink-0 font-display text-xl text-muted">
								{location.host}/@
							</span>
							<input
								type="text"
								placeholder="yourname"
								autoCapitalize="none"
								autoCorrect="off"
								spellCheck={false}
								maxLength={20}
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="min-w-0 flex-1 border-0 bg-transparent py-2 font-display text-xl text-ink placeholder:text-muted/60 focus:outline-none"
							/>
						</span>
					</label>
					{name.trim() && (
						<label className="flex items-center justify-between gap-4 cursor-pointer">
							<span className="flex flex-col gap-1">
								<span className="label">Public map</span>
								<span className="text-sm text-muted">
									{isPublic
										? "Anyone with your link sees your latest stamps."
										: "Your link won't open. Sharing sends a one-off snapshot instead."}
								</span>
							</span>
							<input
								type="checkbox"
								role="switch"
								aria-checked={isPublic}
								checked={isPublic}
								onChange={(e) => setIsPublic(e.target.checked)}
								className="peer sr-only"
							/>
							<span
								aria-hidden="true"
								className="relative shrink-0 w-11 h-6 border border-ink bg-page peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-stamp-red after:absolute after:top-0.5 after:left-0.5 after:size-[18px] after:bg-ink after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-paper"
							/>
						</label>
					)}
					<div className="flex items-center gap-4">
						<button type="submit" disabled={submitting} className={buttonClass}>
							Save
						</button>
						<span aria-live="polite" className="text-sm text-muted">
							{status}
						</span>
					</div>
				</form>

				{error && (
					<p role="alert" className="m-0 text-sm text-stamp-red font-semibold">
						{error}
					</p>
				)}

				<div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
					<button
						type="button"
						onClick={() => supabase?.auth.signOut()}
						className={linkButtonClass}
					>
						Sign out
					</button>
					{confirmDelete ? (
						<div className="flex items-center gap-3">
							<span className="text-sm">Delete all your stamps?</span>
							<button
								type="button"
								onClick={deleteAccount}
								disabled={submitting}
								className="font-mono text-xs uppercase tracking-wider min-h-11 px-4 bg-stamp-red text-paper disabled:opacity-50"
							>
								Delete forever
							</button>
							<button
								type="button"
								onClick={() => setConfirmDelete(false)}
								className={linkButtonClass}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setConfirmDelete(true)}
							className="font-mono text-xs md:text-[13px] uppercase tracking-wider text-stamp-red underline underline-offset-4 min-h-11 px-1"
						>
							Delete account
						</button>
					)}
				</div>
			</div>
		</Modal>
	);
};

export default AccountModal;
