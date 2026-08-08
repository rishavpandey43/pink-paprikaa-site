import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Rating } from "./rating";

/** The partial-fill windows, in document order — one per mark that is at least partly filled. */
function fillWidths(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>("span[style]")].map(
    (node) => node.style.width
  );
}

describe("Rating", () => {
  it("names itself with the score and the scale", () => {
    render(<Rating value={4.6} />);
    expect(screen.getByRole("img", { name: "Rated 4.6 out of 5" })).toBeInTheDocument();
  });

  it("folds the review count into the accessible name with Indian digit grouping", () => {
    render(<Rating count={2184} value={4.6} />);
    expect(
      screen.getByRole("img", { name: "Rated 4.6 out of 5 from 2,184 reviews" })
    ).toBeInTheDocument();
  });

  it("shows the review count in brackets, grouped the Indian way", () => {
    render(<Rating count={2184} value={4.6} />);
    expect(screen.getByText("(2,184)")).toBeInTheDocument();
  });

  it("shows the numeric score to one decimal", () => {
    render(<Rating value={5} />);
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });

  it("hides the numeric score when asked", () => {
    render(<Rating hasValueLabel={false} value={4.6} />);
    expect(screen.queryByText("4.6")).not.toBeInTheDocument();
  });

  it("draws one mark per point on the scale", () => {
    const { container } = render(<Rating max={5} value={0} />);
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("honours a shorter scale", () => {
    const { container } = render(<Rating max={3} value={0} />);
    expect(container.querySelectorAll("svg")).toHaveLength(3);
    expect(screen.getByRole("img", { name: "Rated 0.0 out of 3" })).toBeInTheDocument();
  });

  it("fills whole marks completely and the fractional one by its real percentage", () => {
    const { container } = render(<Rating value={4.3} />);
    const widths = fillWidths(container);

    expect(widths).toHaveLength(5);
    expect(widths.slice(0, 4)).toEqual(["100%", "100%", "100%", "100%"]);
    expect(widths[4]).toBe("30%");
  });

  it("draws no fill window at all on an empty mark", () => {
    const { container } = render(<Rating value={2} />);
    expect(fillWidths(container)).toEqual(["100%", "100%"]);
  });

  it("clamps a score that overshoots the scale", () => {
    render(<Rating value={7} />);
    expect(screen.getByRole("img", { name: "Rated 5.0 out of 5" })).toBeInTheDocument();
  });

  it.each([
    ["xs", "size-3"],
    ["sm", "size-4"],
    ["md", "size-6"],
    ["lg", "size-8"],
  ] as const)("renders the %s size at its fixed mark box", (size, expected) => {
    const { container } = render(<Rating size={size} value={5} />);
    expect(container.querySelector("[role='img'] > span > span")).toHaveClass(expected);
  });

  it("rotates the square into a diamond by default", () => {
    const { container } = render(<Rating value={5} />);
    expect(container.querySelector("[role='img'] > span > span > span > span")).toHaveClass(
      "rotate-45"
    );
  });

  it("drops the diamond for the bare brand mark in the symbol treatment", () => {
    const { container } = render(<Rating value={5} variant="symbol" />);
    const node = container.querySelector("[role='img'] > span > span > span > span");

    expect(node).not.toHaveClass("rotate-45");
    expect(node).toHaveClass("size-full");
  });

  it("merges a caller className", () => {
    render(<Rating className="gap-6" value={4.6} />);
    const node = screen.getByRole("img", { name: "Rated 4.6 out of 5" });

    expect(node).toHaveClass("gap-6");
    expect(node).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Rating count={2184} value={4.6} />
        <Rating size="lg" value={5} variant="symbol" />
        <Rating hasValueLabel={false} size="sm" value={4.3} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
