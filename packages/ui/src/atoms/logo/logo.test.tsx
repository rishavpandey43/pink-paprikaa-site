import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Logo } from "./logo";
import { SYMBOL_VIEW_BOX, WORDMARK_VIEW_BOX } from "./logo-paths";

describe("Logo", () => {
  it("renders the wordmark named after the brand by default", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toHaveAttribute(
      "viewBox",
      WORDMARK_VIEW_BOX
    );
  });

  it("renders the standalone diamond for the symbol variant", () => {
    render(<Logo variant="symbol" />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toHaveAttribute(
      "viewBox",
      SYMBOL_VIEW_BOX
    );
  });

  it.each([
    ["brand", "text-text-brand"],
    ["white", "text-text-on-brand"],
    ["badge", "text-text-on-brand"],
  ] as const)("colours the %s mark from a token", (tone, expected) => {
    render(<Logo tone={tone} />);
    expect(screen.getByRole("img")).toHaveClass(expected);
  });

  it("puts the badge mark on a pink plate", () => {
    render(<Logo tone="badge" variant="symbol" />);
    const plate = screen.getByRole("img").parentElement;
    expect(plate).toHaveClass("bg-surface-brand");
    expect(plate).toHaveClass("rounded-4");
  });

  it("leaves the plate off the transparent colourways", () => {
    render(<Logo tone="white" />);
    expect(screen.getByRole("img").parentElement).not.toHaveClass("bg-surface-brand");
  });

  it.each([
    ["sm", "h-7"],
    ["md", "h-10"],
    ["lg", "h-14"],
  ] as const)("renders the %s size at its fixed height", (size, expected) => {
    render(<Logo size={size} />);
    expect(screen.getByRole("img")).toHaveClass(expected);
  });

  it("hides itself from assistive tech when the name is already in the copy", () => {
    render(<Logo label="" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("merges a caller className", () => {
    render(<Logo className="rounded-6" tone="badge" variant="symbol" />);
    const plate = screen.getByRole("img").parentElement;
    expect(plate).toHaveClass("rounded-6");
    expect(plate).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Logo />
        <Logo tone="badge" variant="symbol" />
        <Logo label="" tone="white" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
