import { type StampStyle, isStampStyle } from "../utils/poster";

const STAMP_STYLE_KEY = "stampStyle";

export function storedStampStyle(): StampStyle {
	try {
		const style = localStorage.getItem(STAMP_STYLE_KEY);
		return isStampStyle(style) ? style : "ground";
	} catch {
		return "ground";
	}
}

export function saveStampStyle(style: StampStyle) {
	try {
		localStorage.setItem(STAMP_STYLE_KEY, style);
	} catch {}
}
