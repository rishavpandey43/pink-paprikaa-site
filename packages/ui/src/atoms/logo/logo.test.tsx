import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Logo } from "./logo";

describe("Logo", () => {
  it("is the lockup in brand pink by default, named for assistive tech", () => {
    render(<Logo />);
    const logo = screen.getByRole("img", { name: "Pink Paprikaa — India's First Desi Urban Café" });
    expect(logo).toHaveClass("text-pink-500", "w-logo-lockup");
  });

  it.each([
    ["wordmark", "Pink Paprikaa", "w-logo-wordmark"],
    ["symbol", "Pink Paprikaa", "w-logo-symbol"],
  ] as const)("names the %s variant %s", (variant, name, widthClass) => {
    render(<Logo variant={variant} />);
    expect(screen.getByRole("img", { name })).toHaveClass(widthClass);
  });

  it("paints the white tone for pink and ink fields", () => {
    render(<Logo tone="white" />);
    expect(screen.getByRole("img")).toHaveClass("text-ink-000");
  });

  it("puts the badge tone on a square brand plate", () => {
    const { container } = render(<Logo tone="badge" variant="symbol" />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 100 100");
    expect(container.querySelector("rect")).toHaveClass("fill-pink-500");
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
        <Logo tone="white" />
      </>
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
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

  it("has no accessibility violations", async () => {
    const { container } = render(<Logo />);
    await expectNoA11yViolations(container);
  });
});
