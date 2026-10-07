import { render, screen } from "@testing-library/react";
import type { CountryCode } from "../types";
import Poster from "./Poster";

const codes = (list: string) => list.split(" ") as CountryCode[];

const fill = (code: string) =>
	document.querySelector(`path[data-code="${code}"]`)?.getAttribute("fill");

it("prints one person's stamps with their stats", () => {
	render(
		<Poster spec={{ size: "30x40", visited: codes("IT FR"), name: "Ada" }} />,
	);
	expect(screen.getByRole("img")).toHaveAccessibleName(
		"Poster: where Ada has been",
	);
	expect(fill("IT")).toBe("#b8432f");
	expect(fill("JP")).toBe("#e2d9c6");
	expect(screen.getByText(/^2 \/ \d+$/)).toBeInTheDocument();
});

it("prints two maps together like the shared comparison", () => {
	render(
		<Poster
			spec={{
				size: "50x70",
				visited: codes("IT JP"),
				with: codes("IT FR"),
				name: "Ada",
				partner: "Bo",
			}}
		/>,
	);
	expect(screen.getByRole("img")).toHaveAccessibleName(
		"Poster: where Ada & Bo have been",
	);
	expect(fill("IT")).toBe("#2f6b4f");
	expect(fill("JP")).toBe("#2b4c8c");
	expect(fill("FR")).toBe("#b8432f");
	expect(screen.getByText("ONLY ADA · 1")).toBeInTheDocument();
	expect(screen.getByText(/^3 \/ \d+$/)).toBeInTheDocument();
});

it("keeps I've together when there's no name", () => {
	render(<Poster spec={{ size: "30x40", visited: codes("IT") }} />);
	expect(screen.getByText("I've").tagName).toBe("tspan");
	expect(screen.getByRole("img")).toHaveAccessibleName(
		"Poster: where I've been",
	);
});

it("inks completed collections as stamps, with a subtitle", () => {
	render(
		<Poster
			spec={{
				size: "30x40",
				visited: codes("GB IE PE CO BR"),
				stamps: true,
				subtitle: "Since 2019",
			}}
		/>,
	);
	expect(screen.getByText("ISLES")).toBeInTheDocument();
	expect(screen.getByText("AMAZON")).toBeInTheDocument();
	expect(screen.getByText("Since 2019")).toBeInTheDocument();
});

it("leaves stamps off unless asked", () => {
	render(<Poster spec={{ size: "30x40", visited: codes("GB IE") }} />);
	expect(screen.queryByText("ISLES")).toBeNull();
});
