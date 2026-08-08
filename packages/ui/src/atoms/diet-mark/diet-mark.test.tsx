import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { DietMark } from "./diet-mark";

describe("DietMark", () => {
  it("renders the vegetarian mark by default", () => {
    render(<DietMark />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("renders the turmeric mark for egg-containing bakes", () => {
    render(<DietMark variant="egg" />);
    expect(screen.getByRole("img", { name: "Contains egg" })).toHaveClass("border-turmeric");
  });

  it.each([
    ["veg", "border-status-success"],
    ["egg", "border-turmeric"],
  ] as const)("outlines the %s mark in its own colour", (variant, expected) => {
    render(<DietMark variant={variant} />);
    expect(screen.getByRole("img")).toHaveClass(expected);
  });

  it("fills the dot from the outline colour so a tone is set once", () => {
    render(<DietMark />);
    expect(screen.getByRole("img").firstElementChild).toHaveClass("bg-current");
  });

  it.each([
    ["xs", "size-3.5", "size-1.5"],
    ["sm", "size-4", "size-2"],
    ["md", "size-5", "size-2.5"],
    ["lg", "size-6", "size-3"],
  ] as const)("scales the square and the dot together at %s", (size, square, dot) => {
    render(<DietMark size={size} />);
    const node = screen.getByRole("img");
    expect(node).toHaveClass(square);
    expect(node.firstElementChild).toHaveClass(dot);
  });

  it("accepts a caller-supplied accessible name", () => {
    render(<DietMark label="Vegetarian dish" />);
    expect(screen.getByRole("img", { name: "Vegetarian dish" })).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    render(<DietMark className="rounded-6" />);
    const node = screen.getByRole("img");
    expect(node).toHaveClass("rounded-6");
    expect(node).not.toHaveClass("rounded-1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <DietMark />
        <DietMark variant="egg" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
