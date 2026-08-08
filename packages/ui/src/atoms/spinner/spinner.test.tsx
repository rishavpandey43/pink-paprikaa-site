import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  it("is hidden from assistive technology when it carries no label", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces what is loading when labelled", () => {
    render(<Spinner label="Adding to cart" />);
    expect(screen.getByRole("status", { name: "Adding to cart" })).toBeInTheDocument();
  });

  it("pulses the brand diamond rather than spinning a ring", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("animate-pp-pulse");
    // The mark is drawn from the brand symbol paths, so it is never an imported ring graphic.
    expect(svg?.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("paints with currentColor so a tone is just a text colour", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });

  it.each([
    ["xs", "size-4"],
    ["sm", "size-5"],
    ["md", "size-8"],
    ["lg", "size-12"],
    ["xl", "size-16"],
  ] as const)("renders the %s size", (size, expected) => {
    const { container } = render(<Spinner size={size} />);
    expect(container.querySelector("svg")).toHaveClass(expected);
  });

  it("defaults to 32px — a standalone loader, not an inline glyph", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveClass("size-8");
  });

  it.each([
    ["brand", "text-text-brand"],
    ["muted", "text-text-muted"],
    ["subtle", "text-text-subtle"],
    ["onBrand", "text-text-on-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("renders the %s tone", (tone, expected) => {
    const { container } = render(<Spinner tone={tone} />);
    expect(container.querySelector("svg")).toHaveClass(expected);
  });

  it("defaults to the brand tone", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toHaveClass("text-text-brand");
  });

  it("inherits the surrounding colour when tone is current", () => {
    const { container } = render(<Spinner tone="current" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toHaveClass("text-text-brand");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });

  it("merges a caller className", () => {
    const { container } = render(<Spinner className="size-6" size="md" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-6");
    expect(svg).not.toHaveClass("size-8");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Spinner label="Adding to cart" />);
    await expectNoA11yViolations(container);
  });
});
