import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PatternField } from "./pattern-field";

describe("PatternField", () => {
  it("renders its children above the texture", () => {
    render(
      <PatternField>
        <p>100% vegetarian kitchen</p>
      </PatternField>
    );
    expect(screen.getByText("100% vegetarian kitchen")).toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
    ["soft", "bg-surface-brand-soft"],
    ["light", "bg-surface-card"],
  ] as const)("floods the panel with the %s ground", (tone, expected) => {
    const { container } = render(<PatternField tone={tone} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it.each([
    ["brand", "text-text-on-brand"],
    ["ink", "text-text-on-inverse"],
    ["soft", "text-text-brand"],
    ["light", "text-text-brand"],
  ] as const)("colours the %s texture from a token", (tone, expected) => {
    const { container } = render(<PatternField tone={tone} />);
    expect(container.querySelector("svg")).toHaveClass(expected);
  });

  it("keeps the texture a whisper — never above 12% on any tone", () => {
    const { container } = render(<PatternField tone="soft" />);
    expect(container.querySelector("svg")).toHaveClass("opacity-9");
  });

  it("tiles the diamond symbol at the requested size", () => {
    const { container } = render(<PatternField tile={96} />);
    const pattern = container.querySelector("pattern");
    expect(pattern).toHaveAttribute("width", "96");
    expect(pattern).toHaveAttribute("height", "96");
    expect(pattern?.querySelectorAll("path").length).toBeGreaterThan(0);
  });

  it("gives every instance its own paint server", () => {
    const { container } = render(
      <>
        <PatternField tile={56} />
        <PatternField tile={96} />
      </>
    );
    const ids = [...container.querySelectorAll("pattern")].map((node) => node.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("hides the texture from assistive tech", () => {
    const { container } = render(<PatternField />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["none", "rounded-4"],
    ["md", "rounded-4"],
    ["lg", "rounded-5"],
  ] as const)("applies the %s radius", (radius, corner) => {
    const { container } = render(<PatternField radius={radius} />);
    const matcher = expect(container.firstElementChild);
    if (radius === "none") {
      matcher.not.toHaveClass(corner);
    } else {
      matcher.toHaveClass(corner);
    }
  });

  it("merges a caller className", () => {
    const { container } = render(<PatternField className="rounded-6" radius="md" />);
    expect(container.firstElementChild).toHaveClass("rounded-6");
    expect(container.firstElementChild).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PatternField radius="lg" tone="brand">
        <p className="p-8 text-text-on-brand">Open 8am – 11:30pm</p>
      </PatternField>
    );
    await expectNoA11yViolations(container);
  });
});
