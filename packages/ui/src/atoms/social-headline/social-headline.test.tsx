import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SocialHeadline } from "./social-headline";

describe("SocialHeadline", () => {
  it("sets a canvas h1 as a balanced h2 on the display face by default", () => {
    render(<SocialHeadline>Masala Cold Brew</SocialHeadline>);
    const headline = screen.getByRole("heading", { level: 2, name: "Masala Cold Brew" });
    expect(headline).toHaveClass(
      "m-0",
      "font-display",
      "text-canvas-h1",
      "text-balance",
      "text-text-heading",
      "max-w-social-headline-default"
    );
  });

  it.each([
    ["hero", "text-canvas-hero", "H2", "font-display"],
    ["h1", "text-canvas-h1", "H2", "font-display"],
    ["h2", "text-canvas-h2", "H2", "font-display"],
    ["body", "text-canvas-body", "P", "font-body"],
    ["caption", "text-canvas-caption", "P", "font-body"],
    ["overline", "text-canvas-overline", "P", "font-display"],
  ] as const)("size %s uses %s on a <%s> in %s", (size, sizeClass, tag, face) => {
    render(<SocialHeadline size={size}>Chai first</SocialHeadline>);
    const text = screen.getByText("Chai first");
    expect(text.tagName).toBe(tag);
    expect(text).toHaveClass(sizeClass, face);
  });

  it.each([
    ["body", "text-text-body"],
    ["caption", "text-text-body"],
    ["hero", "text-text-heading"],
    ["overline", "text-text-heading"],
  ] as const)("paints %s in the surface's %s token — never its own colour", (size, colour) => {
    render(<SocialHeadline size={size}>Cold brew, jaggery, cardamom.</SocialHeadline>);
    const text = screen.getByText("Cold brew, jaggery, cardamom.");
    expect(text).toHaveClass(colour);
    expect(text.className.match(/(^|\s)text-text-/g)).toHaveLength(1);
  });

  it("sets the overline in capitals", () => {
    render(<SocialHeadline size="overline">Tonight Only</SocialHeadline>);
    expect(screen.getByText("Tonight Only")).toHaveClass("uppercase");
  });

  it.each([
    ["tight", "max-w-social-headline-tight"],
    ["default", "max-w-social-headline-default"],
    ["wide", "max-w-social-headline-wide"],
  ] as const)("caps the %s measure with %s", (measure, measureClass) => {
    render(<SocialHeadline measure={measure}>One kitchen. One grinder.</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass(measureClass);
  });

  it("centres the block as well as its lines", () => {
    render(<SocialHeadline align="center">Chai first</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass("text-center", "mx-auto");
  });

  it("aligns to the end without moving the block", () => {
    render(<SocialHeadline align="end">Chai first</SocialHeadline>);
    const headline = screen.getByRole("heading");
    expect(headline).toHaveClass("text-end");
    expect(headline).not.toHaveClass("mx-auto");
  });

  it("lets `as` make it the artboard's one h1", () => {
    render(
      <SocialHeadline size="hero" as="h1">
        Chai first, decisions later.
      </SocialHeadline>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-canvas-hero");
  });

  it("merges a consumer className", () => {
    render(<SocialHeadline className="mt-8">Chai first</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass("mt-8", "m-0");
  });

  it("lets a consumer className replace the size step", () => {
    render(<SocialHeadline className="text-canvas-h2">Masala Cold Brew</SocialHeadline>);
    const headline = screen.getByRole("heading");
    expect(headline).toHaveClass("text-canvas-h2");
    expect(headline).not.toHaveClass("text-canvas-h1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SocialHeadline size="overline">Tonight Only</SocialHeadline>
        <SocialHeadline size="hero">Chai first, decisions later.</SocialHeadline>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
