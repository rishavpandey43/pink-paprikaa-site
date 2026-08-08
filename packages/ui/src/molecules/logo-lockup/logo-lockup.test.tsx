import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LogoLockup } from "./logo-lockup";

const TAGLINE = "India’s First Desi Urban Café";

describe("LogoLockup", () => {
  it("names the mark for assistive tech", () => {
    render(<LogoLockup />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it("sets the signature line without it being re-typed", () => {
    render(<LogoLockup />);
    expect(screen.getByText(TAGLINE)).toBeInTheDocument();
  });

  it("takes an override tagline", () => {
    render(<LogoLockup tagline="Desi at heart. Urban by nature." />);
    expect(screen.getByText("Desi at heart. Urban by nature.")).toBeInTheDocument();
  });

  it("drops the tagline for the bare wordmark", () => {
    render(<LogoLockup hasTagline={false} />);

    expect(screen.queryByText(TAGLINE)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it("hides the mark from assistive tech when the artwork already names the brand", () => {
    render(<LogoLockup label="" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "[&>svg]:h-20"],
    ["md", "[&>svg]:h-24"],
    ["lg", "[&>svg]:h-32"],
  ] as const)("re-heights the mark for the %s lockup", (size, expected) => {
    const { container } = render(<LogoLockup size={size} />);
    expect(container.querySelector("span")).toHaveClass(expected);
  });

  it("pins the wordmark's 140px minimum width structurally", () => {
    const { container } = render(<LogoLockup size="sm" />);
    expect(container.querySelector("span")).toHaveClass("[&>svg]:min-w-35");
  });

  it.each([
    ["sm", "p-14"],
    ["md", "p-16"],
    ["lg", "p-24"],
  ] as const)("reserves the %s lockup's clear space", (size, expected) => {
    const { container } = render(<LogoLockup size={size} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("drops the clear space when the parent already reserves it", () => {
    const { container } = render(<LogoLockup hasClearSpace={false} />);
    expect(container.firstElementChild).not.toHaveClass("p-16");
  });

  it("flips the tagline to white on a flooded ground", () => {
    render(<LogoLockup tone="white" />);
    expect(screen.getByText(TAGLINE)).toHaveClass("text-text-on-brand/86");
  });

  it("centres the lockup when asked", () => {
    const { container } = render(<LogoLockup align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center");
  });

  it("merges a caller className", () => {
    const { container } = render(<LogoLockup className="p-0" />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("p-0");
    expect(node).not.toHaveClass("p-16");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <LogoLockup />
        <LogoLockup align="center" size="lg" tone="white" />
        <LogoLockup hasTagline={false} label="" size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
