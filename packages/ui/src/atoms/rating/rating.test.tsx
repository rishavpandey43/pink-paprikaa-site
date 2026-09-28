import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Rating } from "./rating";

/** Diamonds by fill: every unit has an empty base; filled (or partly filled) ones add a pink layer. */
const filled = (container: HTMLElement) => container.querySelectorAll(".rotate-45.bg-pink-500");
const empty = (container: HTMLElement) => container.querySelectorAll(".rotate-45.bg-ink-200");
const clips = (container: HTMLElement) =>
  [...container.querySelectorAll("[style]")].map((element) => element.getAttribute("style"));

describe("Rating", () => {
  it("is one image named with the score", () => {
    render(<Rating value={4.6} />);
    expect(screen.getByRole("img", { name: "4.6 out of 5" })).toBeInTheDocument();
  });

  it("adds the review count to the name and prints it with Indian grouping", () => {
    render(<Rating value={4.6} count={2184} />);
    expect(screen.getByRole("img", { name: "4.6 out of 5, 2,184 reviews" })).toBeInTheDocument();
    expect(screen.getByText("(2,184)")).toHaveClass(
      "text-rating-count",
      "text-text-subtle",
      "tabular-nums"
    );
  });

  it("shows the score to one decimal, or hides it", () => {
    const { rerender } = render(<Rating value={5} />);
    expect(screen.getByText("5.0")).toHaveClass("font-display", "font-bold", "tabular-nums");
    rerender(<Rating value={5} hasValue={false} />);
    expect(screen.queryByText("5.0")).not.toBeInTheDocument();
  });

  it("fills whole diamonds solid and clips a half one at exactly 50%, in screen space", () => {
    const { container } = render(<Rating value={4.5} />);
    expect(empty(container)).toHaveLength(5);
    expect(filled(container)).toHaveLength(5);
    expect(clips(container)).toEqual(["clip-path: inset(0 50% 0 0);"]);
  });

  it("fills 30% of the fifth diamond for 4.3", () => {
    const { container } = render(<Rating value={4.3} />);
    expect(clips(container)).toEqual(["clip-path: inset(0 70% 0 0);"]);
  });

  it("draws no fill at all for 0, and still names the score", () => {
    const { container } = render(<Rating value={0} />);
    expect(screen.getByRole("img", { name: "0 out of 5" })).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(filled(container)).toHaveLength(0);
    expect(empty(container)).toHaveLength(5);
  });

  it.each([-0.5, 5.5, Number.NaN])("rejects the impossible score %d", (value) => {
    expect(() => renderToString(<Rating value={value} />)).toThrow(RangeError);
  });

  it("rejects a max that is not a whole number of at least 1", () => {
    expect(() => renderToString(<Rating value={1} max={2.5} />)).toThrow(RangeError);
    expect(() => renderToString(<Rating value={0} max={0} />)).toThrow(RangeError);
  });

  it("honours another max", () => {
    const { container } = render(<Rating value={2} max={3} />);
    expect(screen.getByRole("img", { name: "2 out of 3" })).toBeInTheDocument();
    expect(empty(container)).toHaveLength(3);
  });

  it.each([
    ["sm", "size-brand-diamond-12", "size-brand-diamond-box-12"],
    ["md", "size-brand-diamond-16", "size-brand-diamond-box-16"],
    ["lg", "size-brand-diamond-24", "size-brand-diamond-box-24"],
  ] as const)("draws size %s diamonds at %s in a %s box", (size, diamond, box) => {
    const { container } = render(<Rating value={3} size={size} />);
    expect(container.querySelectorAll(`.${diamond}`)).toHaveLength(5 + 3);
    expect(container.querySelectorAll(`.${box}`)).toHaveLength(5 + 3);
  });

  it("puts a white mark on a filled diamond and a pink one on an empty diamond", () => {
    const { container } = render(<Rating value={1} max={2} />);
    expect(container.querySelector(".bg-pink-500 > .mask-symbol")).toHaveClass(
      "text-ink-000",
      "size-4/5"
    );
    expect(container.querySelector(".bg-ink-200 > .mask-symbol")).toHaveClass("text-pink-500");
  });

  it("raises the mark's opacity on small diamonds so it still resolves", () => {
    const { container, rerender } = render(<Rating value={1} max={2} size="sm" />);
    expect(container.querySelector(".bg-pink-500 > .mask-symbol")).toHaveClass(
      "opacity-85",
      "size-6/7"
    );
    expect(container.querySelector(".bg-ink-200 > .mask-symbol")).toHaveClass("opacity-80");
    rerender(<Rating value={1} max={2} size="lg" />);
    expect(container.querySelector(".bg-pink-500 > .mask-symbol")).toHaveClass(
      "opacity-50",
      "size-3/4"
    );
  });

  it("swaps the diamonds for the bare brand mark with variant symbol", () => {
    const { container } = render(<Rating value={4.5} variant="symbol" />);
    expect(container.querySelectorAll(".rotate-45")).toHaveLength(0);
    expect(container.querySelectorAll(".mask-symbol.opacity-22")).toHaveLength(5);
    expect(clips(container)).toEqual(["clip-path: inset(0 50% 0 0);"]);
  });

  it("merges a caller className onto the root, replacing a conflicting class", () => {
    render(<Rating value={4.6} className="gap-6" />);
    const rating = screen.getByRole("img", { name: "4.6 out of 5" });
    expect(rating).toHaveClass("gap-6");
    expect(rating).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations with a count, as symbols, and without the score", async () => {
    const { container } = render(
      <>
        <Rating value={4.6} count={2184} />
        <Rating value={5} variant="symbol" size="lg" />
        <Rating value={4.3} size="sm" hasValue={false} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
