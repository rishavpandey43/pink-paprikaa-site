import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expectNoA11yViolations } from "#vitest.setup";

import { Container, type ContainerSize } from "./container";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../../../design-tokens/dist/tokens.json"), "utf8")
) as CatalogueEntry[];

function tokenValue(name: string): string {
  const value = catalogue.find((entry) => entry.surface === null && entry.name === name)?.value;
  if (typeof value !== "string") throw new Error(`no string token named ${name}`);
  return value;
}

/** A `clamp(<min>px, <n>vw, <max>px)` length at a viewport width, computed as the browser does. */
function clampAt(length: string, viewport: number): number {
  const groups = /^clamp\((?<min>\d+)px, (?<fluid>[\d.]+)vw, (?<max>\d+)px\)$/.exec(length)?.groups;
  if (groups?.min === undefined || groups.fluid === undefined || groups.max === undefined) {
    throw new Error(`not a clamp(px, vw, px) length: ${length}`);
  }
  const fluid = (Number(groups.fluid) / 100) * viewport;
  return Math.min(Math.max(Number(groups.min), fluid), Number(groups.max));
}

const SIZES: [ContainerSize, string][] = [
  ["content", "max-w-content"],
  ["wide", "max-w-wide"],
  ["narrow", "max-w-narrow"],
  ["article", "max-w-article"],
  ["prose", "max-w-text-measure-prose"],
  ["full", "max-w-none"],
];

describe("Container", () => {
  it("is a centred, full-width div capped at the content width, with the fluid gutter", () => {
    render(<Container>Our story</Container>);
    const frame = screen.getByText("Our story");
    expect(frame.tagName).toBe("DIV");
    expect(frame).toHaveClass("mx-auto", "w-full", "max-w-content", "px-gutter");
  });

  it.each(SIZES)("caps size=%s with %s and keeps the gutter", (size, cap) => {
    render(<Container size={size}>Frame</Container>);
    expect(screen.getByText("Frame")).toHaveClass(cap, "px-gutter");
  });

  it("drops the gutter only when isBleed is set", () => {
    render(<Container isBleed>Edge to edge</Container>);
    const frame = screen.getByText("Edge to edge");
    expect(frame).toHaveClass("px-0");
    expect(frame).not.toHaveClass("px-gutter");
  });

  it("renders the element named by as", () => {
    render(<Container as="main">Menu</Container>);
    expect(screen.getByRole("main")).toHaveTextContent("Menu");
  });

  it("lets a consumer className replace a conflicting class and passes native props through", () => {
    render(
      <Container className="max-w-none px-4" id="story">
        Frame
      </Container>
    );
    const frame = screen.getByText("Frame");
    expect(frame).toHaveClass("px-4", "max-w-none");
    expect(frame).not.toHaveClass("px-gutter");
    expect(frame).not.toHaveClass("max-w-content");
    expect(frame).toHaveAttribute("id", "story");
  });

  // A layout carries width and spacing only; the band around it owns colour (dev parity).
  it.each(SIZES)("paints nothing at size=%s — no colour, border, shadow or type class", (size) => {
    render(<Container size={size}>Frame</Container>);
    const classes = screen.getByText("Frame").className.split(/\s+/);
    expect(classes.filter((name) => /^(bg|border|shadow|text|font)-/.test(name))).toEqual([]);
  });

  // Review Focus 4, pure half — the rendered half is the AtTheFloor story.
  it("resolves the gutter to 20px at the 360px floor and 40px on desktop", () => {
    const gutter = tokenValue("spacing-gutter");
    expect(clampAt(gutter, 360)).toBe(20);
    expect(clampAt(gutter, 1280)).toBe(40);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Container as="main">
        <h1>Our story</h1>
      </Container>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root", () => {
    render(
      <Container data-testid="root" sx={{ mt: 6, px: { md: 4 } }}>
        x
      </Container>
    );
    expect(screen.getByTestId("root")).toHaveClass("mt-6", "md:px-4");
  });
});
