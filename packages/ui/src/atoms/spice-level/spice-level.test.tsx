import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SpiceLevel } from "./spice-level";

describe("SpiceLevel", () => {
  it("is one image named with the level", () => {
    render(<SpiceLevel level={3} />);
    expect(screen.getByRole("img", { name: "Spice level 3 of 4" })).toBeInTheDocument();
  });

  it("fills the first diamonds with the level's heat colour and leaves the rest ink-200", () => {
    const { container } = render(<SpiceLevel level={3} />);
    expect(container.querySelectorAll(".rotate-45.bg-heat-3")).toHaveLength(3);
    expect(container.querySelectorAll(".rotate-45.bg-ink-200")).toHaveLength(1);
  });

  it.each([
    [1, "bg-heat-1"],
    [2, "bg-heat-2"],
    [4, "bg-heat-4"],
  ] as const)("colours level %d with %s — the heat ramp, mint to pink", (level, heat) => {
    const { container } = render(<SpiceLevel level={level} />);
    expect(container.querySelectorAll(`.rotate-45.${heat}`)).toHaveLength(level);
  });

  it.each([
    [1, "Mild"],
    [2, "Medium"],
    [3, "Hot"],
    [4, "Extra Hot"],
  ] as const)("names level %d %s with hasLabel, as an uppercase overline", (level, label) => {
    render(<SpiceLevel level={level} hasLabel />);
    expect(screen.getByText(label)).toHaveClass("uppercase", "text-overline", "text-text-muted");
  });

  it("shows no label by default", () => {
    render(<SpiceLevel level={2} />);
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "size-brand-diamond-12"],
    ["md", "size-brand-diamond-14"],
    ["lg", "size-brand-diamond-20"],
  ] as const)("draws size %s diamonds at %s", (size, diamond) => {
    const { container } = render(<SpiceLevel level={2} size={size} />);
    expect(container.querySelectorAll(`.${diamond}`)).toHaveLength(4);
  });

  it("carries a white mark on a filled diamond and a pink one on an empty diamond", () => {
    const { container } = render(<SpiceLevel level={1} />);
    expect(container.querySelector(".bg-heat-1 > .mask-symbol")).toHaveClass("text-ink-000");
    expect(container.querySelector(".bg-ink-200 > .mask-symbol")).toHaveClass("text-pink-500");
  });

  it("merges a caller className onto the root, replacing a conflicting class", () => {
    render(<SpiceLevel level={2} className="gap-6" />);
    const spice = screen.getByRole("img");
    expect(spice).toHaveClass("gap-6");
    expect(spice).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SpiceLevel level={1} />
        <SpiceLevel level={4} hasLabel />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
