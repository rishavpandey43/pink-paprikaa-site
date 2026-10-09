import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Stat } from "./stat";

describe("Stat", () => {
  it("reads number, label and sub in that order", () => {
    const { container } = render(
      <Stat value="18" label="spices ground in-house, daily" sub="Every morning at Sector 57" />
    );
    expect(container.firstElementChild).toHaveTextContent(
      "18spices ground in-house, dailyEvery morning at Sector 57"
    );
    expect(screen.getByText("18")).toHaveClass("text-stat-value");
  });

  it.each([false, "", null])("draws no sub line for a %j sub", (sub) => {
    const { container } = render(<Stat value="18" label="spices ground in-house" sub={sub} />);
    // The value and the label, nothing after them.
    expect(container.firstElementChild?.children).toHaveLength(2);
  });

  it.each([
    ["neutral", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("colours the number for color %s", (color, colour) => {
    render(<Stat value="4.6" label="average guest rating" color={color} />);
    expect(screen.getByText("4.6")).toHaveClass(colour);
  });

  it("keeps the label and sub on semantic text, so they follow the surface", () => {
    render(<Stat value="2025" label="the year we started" sub="Sector 57" color="inverse" />);
    expect(screen.getByText("the year we started")).toHaveClass("text-text-body");
    expect(screen.getByText("Sector 57")).toHaveClass("text-text-subtle");
  });

  it.each([
    ["neutral", "text-stat-icon"],
    ["inverse", "text-white-alpha-70"],
  ] as const)("draws a decorative %s-color glyph above the number", (color, colour) => {
    const { container } = render(
      <Stat value="4.6" label="average guest rating" icon={Heart} color={color} />
    );
    const glyph = container.querySelector("svg.lucide-heart")?.parentElement;
    expect(glyph).toHaveAttribute("aria-hidden", "true");
    expect(glyph).toHaveClass(colour);
  });

  it("centres everything for align center", () => {
    const { container } = render(<Stat value="6" label="outlets" align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center", "text-center");
  });

  it("renders no sub line and no glyph unless given", () => {
    const { container } = render(<Stat value="6" label="outlets" />);
    expect(container.firstElementChild?.children).toHaveLength(2);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<Stat value="6" label="outlets" className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stat value="4.6" label="average guest rating" icon={Heart} color="brand" />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, beating a default class and keeping className", () => {
    const { container } = render(
      <Stat value="6" label="outlets" sx={{ gap: 4, mt: 2 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("gap-4", "mt-2", "italic");
    expect(container.firstElementChild).not.toHaveClass("gap-1");
  });
});
