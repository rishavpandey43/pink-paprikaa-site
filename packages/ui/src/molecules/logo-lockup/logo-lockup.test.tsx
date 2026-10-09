import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { LogoLockup } from "./logo-lockup";

describe("LogoLockup", () => {
  it("signs the artwork with the white lockup, tagline included, by default", () => {
    render(<LogoLockup />);
    const logo = screen.getByRole("img", { name: "Pink Paprikaa — India's First Desi Urban Café" });
    expect(logo).toHaveClass("text-ink-000", "w-60");
  });

  it("drops to the wordmark when the tagline cannot read", () => {
    render(<LogoLockup hasTagline={false} />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it.each([
    ["sm", "w-50", "p-9"],
    ["md", "w-60", "p-11"],
    ["lg", "w-70", "p-13"],
    ["xl", "w-90", "p-17"],
  ] as const)("at size %s is %s wide with %s of clear space", (size, width, padding) => {
    const { container } = render(<LogoLockup size={size} />);
    expect(container.firstElementChild).toHaveClass(padding);
    expect(screen.getByRole("img")).toHaveClass(width);
  });

  it("paints the brand color on light artwork", () => {
    render(<LogoLockup color="brand" />);
    expect(screen.getByRole("img")).toHaveClass("text-pink-500");
  });

  it("centres the signature when asked", () => {
    const { container } = render(<LogoLockup align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center");
  });

  it("hides the logo from assistive tech when the artwork already names the brand", () => {
    render(<LogoLockup isDecorative />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("drops its clear space when the parent already reserves it", () => {
    const { container } = render(<LogoLockup className="p-0" />);
    expect(container.firstElementChild).toHaveClass("p-0");
    expect(container.firstElementChild).not.toHaveClass("p-11");
  });

  it("sx lands on the root and beats its own clear space", () => {
    const { container } = render(<LogoLockup sx={{ p: 0, mt: 4 }} />);
    expect(container.firstElementChild).toHaveClass("p-0", "mt-4");
    expect(container.firstElementChild).not.toHaveClass("p-11");
  });

  it("paints the badge color on its own plate", () => {
    const { container } = render(<LogoLockup color="badge" />);
    expect(container.querySelector("rect")).toHaveClass("fill-pink-500");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <LogoLockup color="brand" />
        <LogoLockup color="inverse" align="center" size="lg" />
        <LogoLockup color="brand" size="sm" hasTagline={false} isDecorative />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
