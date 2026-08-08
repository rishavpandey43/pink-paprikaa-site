import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SpiceLevel } from "./spice-level";

describe("SpiceLevel", () => {
  it("announces the mild level by default", () => {
    render(<SpiceLevel />);
    expect(screen.getByRole("img", { name: "Spice level: Mild" })).toBeInTheDocument();
  });

  it.each([
    [1, "Mild"],
    [2, "Medium"],
    [3, "Hot"],
    [4, "Extra Hot"],
  ] as const)("names level %i as %s", (level, expected) => {
    render(<SpiceLevel level={level} />);
    expect(screen.getByRole("img", { name: `Spice level: ${expected}` })).toBeInTheDocument();
  });

  it("always renders the whole four-diamond scale", () => {
    render(<SpiceLevel level={2} />);
    expect(screen.getByRole("img").children).toHaveLength(4);
  });

  it("shortens the scale when max is lowered", () => {
    render(<SpiceLevel level={2} max={2} />);
    expect(screen.getByRole("img").children).toHaveLength(2);
  });

  it.each([
    [1, "bg-heat-1"],
    [2, "bg-heat-2"],
    [3, "bg-heat-3"],
    [4, "bg-heat-4"],
  ] as const)("fills every lit diamond with the level %i colour", (level, expected) => {
    render(<SpiceLevel level={level} />);
    const diamonds = [...screen.getByRole("img").children];
    expect(diamonds.slice(0, level).every((node) => node.classList.contains(expected))).toBe(true);
    // The neutral base must be *replaced*, not appended — two backgrounds would leave the colour
    // to stylesheet order.
    expect(diamonds[0]).not.toHaveClass("bg-ink-200");
  });

  it("leaves the diamonds above the level on the neutral ramp", () => {
    render(<SpiceLevel level={2} />);
    const diamonds = [...screen.getByRole("img").children];
    expect(diamonds[2]).toHaveClass("bg-ink-200");
    expect(diamonds[2]).not.toHaveClass("bg-heat-2");
  });

  it("prints the heat name without announcing it twice", () => {
    render(<SpiceLevel hasLabel level={4} />);
    expect(screen.getByText("Extra Hot")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("img", { name: "Spice level: Extra Hot" })).toBeInTheDocument();
  });

  it("hides the heat name unless it is asked for", () => {
    render(<SpiceLevel level={4} />);
    expect(screen.queryByText("Extra Hot")).not.toBeInTheDocument();
  });

  it.each([
    ["xs", "size-2.5"],
    ["sm", "size-3.5"],
    ["md", "size-5"],
    ["lg", "size-7"],
  ] as const)("sizes the diamonds at %s", (size, expected) => {
    render(<SpiceLevel size={size} />);
    expect(screen.getByRole("img").firstElementChild).toHaveClass(expected);
  });

  it("merges a caller className", () => {
    render(<SpiceLevel className="gap-6" />);
    const node = screen.getByRole("img").parentElement;
    expect(node).toHaveClass("gap-6");
    expect(node).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SpiceLevel level={1} />
        <SpiceLevel hasLabel level={3} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
