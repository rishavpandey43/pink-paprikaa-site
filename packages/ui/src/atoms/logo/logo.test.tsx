import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Logo, type LogoProps } from "./logo";

describe("Logo", () => {
  it("is the lockup in brand pink by default, named for assistive tech", () => {
    render(<Logo />);
    const logo = screen.getByRole("img", { name: "Pink Paprikaa — India's First Desi Urban Café" });
    expect(logo).toHaveClass("text-pink-500", "w-logo-lockup");
    // An unfilled path inherits the root fill, so it can never fall back to black.
    expect(logo).toHaveAttribute("fill", "currentColor");
  });

  it.each([
    ["wordmark", "Pink Paprikaa", "w-logo-wordmark"],
    ["symbol", "Pink Paprikaa", "w-logo-symbol"],
  ] as const)("names the %s variant %s", (variant, name, widthClass) => {
    render(<Logo variant={variant} />);
    expect(screen.getByRole("img", { name })).toHaveClass(widthClass);
  });

  it("names itself with a caller's title instead of the default", () => {
    render(<Logo title="Pink Paprikaa home" />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa home" })).toBeInTheDocument();
  });

  it("paints the inverse color for pink and ink fields", () => {
    render(<Logo color="inverse" />);
    expect(screen.getByRole("img")).toHaveClass("text-ink-000");
  });

  it("puts the badge color on a square brand plate", () => {
    const { container } = render(<Logo color="badge" variant="symbol" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 100 100");
    expect(container.querySelector("rect")).toHaveClass("fill-pink-500");
    expect(container.querySelector("svg svg")).toHaveAttribute("fill", "currentColor");
  });

  it.each(["brand", "inverse"] as const)(
    "leaves the plate off the transparent %s color",
    (color) => {
      const { container } = render(<Logo color={color} />);
      expect(container.querySelector("rect")).not.toBeInTheDocument();
      expect(container.querySelector("svg svg")).not.toBeInTheDocument();
    }
  );

  it("insets the symbol badge's artwork 20 units on every side (60 of 100)", () => {
    const { container } = render(<Logo color="badge" variant="symbol" />);
    const artwork = container.querySelector("svg svg");
    expect(artwork).toHaveAttribute("x", "20");
    expect(artwork).toHaveAttribute("y", "20");
    expect(artwork).toHaveAttribute("width", "60");
  });

  it("sets the lockup badge's artwork 76 of 100 units wide", () => {
    const { container } = render(<Logo color="badge" />);
    expect(container.querySelector("svg svg")).toHaveAttribute("width", "76");
  });

  it("sx lands on the svg and beats its own width", () => {
    render(<Logo sx={{ w: "full", mt: 4 }} />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveClass("w-full", "mt-4");
    expect(logo).not.toHaveClass("w-logo-lockup");
  });

  it("hides a decorative logo from assistive tech", () => {
    const { container } = render(<Logo isDecorative />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("gives two logos on one page distinct clip-path ids", () => {
    const { container } = render(
      <>
        <Logo />
        <Logo color="inverse" />
      </>
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
    for (const reference of container.innerHTML.matchAll(/url\(#([^)]+)\)/g)) {
      expect(ids).toContain(reference[1]);
    }
  });

  it("lets a consumer resize it", () => {
    render(<Logo className="w-50" />);
    expect(screen.getByRole("img")).toHaveClass("w-50");
    expect(screen.getByRole("img")).not.toHaveClass("w-logo-lockup");
  });

  it("sizes to a header height with h-* w-auto (width follows the artwork)", () => {
    render(<Logo className="h-10 w-auto" />);
    const logo = screen.getByRole("img");
    expect(logo).toHaveClass("h-10", "w-auto");
    expect(logo).not.toHaveClass("h-auto", "w-logo-lockup");
  });

  it("takes no width or height prop — size comes from classes only (checked by typecheck)", () => {
    expectTypeOf<LogoProps>().not.toHaveProperty("width");
    expectTypeOf<LogoProps>().not.toHaveProperty("height");
  });

  it("takes no markup of its own — the root renders the artwork (checked by typecheck)", () => {
    expectTypeOf<LogoProps>().not.toHaveProperty("children");
    expectTypeOf<LogoProps>().not.toHaveProperty("dangerouslySetInnerHTML");
  });

  it("has no accessibility violations: default, badge and decorative", async () => {
    const { container } = render(
      <>
        <Logo />
        <Logo color="badge" variant="symbol" />
        <Logo color="inverse" isDecorative />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
