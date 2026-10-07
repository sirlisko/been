import type { CountryCode } from "../types";
import type { FlagArt } from "../utils/flagArt";
import type { StampStyle } from "../utils/poster";
import PosterStamp, { STAMP_RATIO } from "./PosterStamp";

const W = 30;
// Room around the stamp for its tilt, keeping the cell 5:6 like the stamp
const PAD = 1.5;
const VIEW_BOX = `${-PAD} ${-PAD * STAMP_RATIO} ${W + PAD * 2} ${(W + PAD * 2) * STAMP_RATIO}`;

interface Props {
	code: CountryCode;
	style?: StampStyle;
	flag?: FlagArt;
	className?: string;
}

// The poster's stamp, drawn at a size where all its small print shows
const Stamp = ({ code, style = "ground", flag, className = "" }: Props) => (
	// The button or label around it names the country
	<svg
		viewBox={VIEW_BOX}
		aria-hidden="true"
		className={`block w-full h-auto overflow-visible drop-shadow-[0_1px_1px_rgb(0_0_0/0.18)] ${className}`}
	>
		<PosterStamp code={code} style={style} x={0} y={0} w={W} flag={flag} />
	</svg>
);

export default Stamp;
