import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SocialHeadline } from "./social-headline";

describe("SocialHeadline", () => {
  it("renders canvas-scale type in a paragraph by default", () => {
    render(<SocialHeadline>Masala Cold Brew</SocialHeadline>);
    const node = screen.getByText("Masala Cold Brew");
    expect(node.tagName).toBe("P");
    expect(node).toHaveClass("text-canvas-h1");
  });

  it.each([
    ["hero", "text-canvas-hero"],
    ["h1", "text-canvas-h1"],
    ["h2", "text-canvas-h2"],
    ["body", "text-canvas-body"],
    ["caption", "text-canvas-caption"],
    ["overline", "text-canvas-overline"],
  ] as const)("sets the %s step in canvas pixels", (size, expected) => {
    render(<SocialHeadline size={size}>Chai first</SocialHeadline>);
    expect(screen.getByText("Chai first")).toHaveClass(expected);
  });

  it("sets the overline in caps with the brand's wide tracking", () => {
    render(<SocialHeadline size="overline">Tonight Only</SocialHeadline>);
    const node = screen.getByText("Tonight Only");
    expect(node).toHaveClass("uppercase");
    expect(node).toHaveClass("tracking-overline");
  });

  it.each([
    ["brand", "text-text-on-brand"],
    ["ink", "text-text-on-inverse"],
    ["soft", "text-pink-800"],
    ["light", "text-text-heading"],
  ] as const)("inks the headline for the %s ground", (on, expected) => {
    render(<SocialHeadline on={on}>Six plates, one kitchen</SocialHeadline>);
    expect(screen.getByText("Six plates, one kitchen")).toHaveClass(expected);
  });

  it("steps running text back on a flooded ground so it does not read as a headline", () => {
    render(
      <SocialHeadline on="brand" size="body">
        Momos, chaat and North Indian plates
      </SocialHeadline>
    );
    expect(screen.getByText("Momos, chaat and North Indian plates")).toHaveClass(
      "text-text-on-brand/88"
    );
  });

  it("balances every line rather than leaving an orphan", () => {
    render(<SocialHeadline>Chai first, decisions later.</SocialHeadline>);
    expect(screen.getByText("Chai first, decisions later.")).toHaveClass("text-balance");
  });

  it.each([
    ["narrow", "max-w-[14ch]"],
    ["default", "max-w-[18ch]"],
    ["wide", "max-w-[34ch]"],
    ["none", "max-w-none"],
  ] as const)("caps the %s measure", (measure, expected) => {
    render(<SocialHeadline measure={measure}>Masala Cold Brew</SocialHeadline>);
    expect(screen.getByText("Masala Cold Brew")).toHaveClass(expected);
  });

  it("widens the default measure for running text", () => {
    render(<SocialHeadline size="body">Cold brew, jaggery, cardamom.</SocialHeadline>);
    expect(screen.getByText("Cold brew, jaggery, cardamom.")).toHaveClass("max-w-[34ch]");
  });

  it("centres the block as well as the text", () => {
    render(<SocialHeadline align="center">Masala Cold Brew</SocialHeadline>);
    const node = screen.getByText("Masala Cold Brew");
    expect(node).toHaveClass("text-center");
    expect(node).toHaveClass("mx-auto");
  });

  it("renders as another element on request", () => {
    render(
      <SocialHeadline as="h2" size="hero">
        Paneer Tikka Masala
      </SocialHeadline>
    );
    expect(screen.getByRole("heading", { level: 2, name: "Paneer Tikka Masala" })).toBeVisible();
  });

  it("merges a caller className", () => {
    render(<SocialHeadline className="text-canvas-h2">Masala Cold Brew</SocialHeadline>);
    const node = screen.getByText("Masala Cold Brew");
    expect(node).toHaveClass("text-canvas-h2");
    expect(node).not.toHaveClass("text-canvas-h1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <SocialHeadline size="overline">Tonight Only</SocialHeadline>
        <SocialHeadline size="hero">Chai first, decisions later.</SocialHeadline>
        <SocialHeadline size="body">Cold brew, jaggery, cardamom · ₹180</SocialHeadline>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
