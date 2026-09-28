import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { DietMark } from "./diet-mark";

describe("DietMark", () => {
  it("is an image named Vegetarian", () => {
    render(<DietMark />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("draws the statutory square and dot in the veg green", () => {
    const { container } = render(<DietMark />);
    expect(screen.getByRole("img")).toHaveClass("text-veg");
    expect(container.querySelector("rect")).toHaveAttribute("stroke", "currentColor");
    expect(container.querySelector("rect")).toHaveAttribute("fill", "none");
    expect(container.querySelector("circle")).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["sm", "size-diet-mark-sm"],
    ["md", "size-diet-mark-md"],
    ["lg", "size-diet-mark-lg"],
  ] as const)("renders size %s at %s", (size, sizeClass) => {
    render(<DietMark size={size} />);
    expect(screen.getByRole("img")).toHaveClass(sizeClass);
  });

  it("takes another label", () => {
    render(<DietMark label="Pure vegetarian" />);
    expect(screen.getByRole("img", { name: "Pure vegetarian" })).toBeInTheDocument();
  });

  it("merges a caller className, replacing a conflicting size", () => {
    render(<DietMark className="size-6" />);
    expect(screen.getByRole("img")).toHaveClass("size-6");
    expect(screen.getByRole("img")).not.toHaveClass("size-diet-mark-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<DietMark />);
    await expectNoA11yViolations(container);
  });
});
