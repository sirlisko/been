import type { CountryCode } from "../types";
import type { Flags } from "../utils/flagArt";
import { STAMP_STYLES, type StampStyle } from "../utils/poster";
import Stamp from "./Stamp";

interface Props {
	value: StampStyle;
	onChange: (style: StampStyle) => void;
	// The country each option is previewed with
	sample: CountryCode;
	flags: Flags | null;
	// Small chips for the home page; labelled cards on the print page
	compact?: boolean;
	className?: string;
}

const optionClass =
	"flex flex-col items-center rounded-xl border-[1.5px] border-line cursor-pointer has-[:checked]:border-2 has-[:checked]:border-blue has-[:checked]:bg-blue/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue";

const StampStylePicker = ({
	value,
	onChange,
	sample,
	flags,
	compact,
	className = "",
}: Props) => (
	<div
		role="radiogroup"
		aria-label="Stamp style"
		className={`grid ${compact ? "grid-cols-4 gap-2 max-w-xs" : "grid-cols-2 gap-3"} ${className}`}
	>
		{(Object.keys(STAMP_STYLES) as StampStyle[]).map((id) => (
			<label
				key={id}
				title={compact ? STAMP_STYLES[id] : undefined}
				className={`${optionClass} ${compact ? "p-1.5" : "gap-0.5 p-4"}`}
			>
				<input
					type="radio"
					name="stamp-style"
					value={id}
					checked={value === id}
					onChange={() => onChange(id)}
					className="sr-only"
				/>
				<Stamp
					code={sample}
					style={id}
					flag={flags?.[sample]}
					className={compact ? "max-w-10" : "max-w-24"}
				/>
				<span
					className={compact ? "sr-only" : "text-sm font-semibold text-center"}
				>
					{STAMP_STYLES[id]}
				</span>
			</label>
		))}
	</div>
);

export default StampStylePicker;
