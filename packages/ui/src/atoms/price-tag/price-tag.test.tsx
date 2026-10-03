import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PriceTag } from "./price-tag";

describe("PriceTag", () => {
  it.each([
    [280, "₹280"],
    [1240, "₹1,240"],
    [125000, "₹1,25,000"],
    [90, "₹90"],
  ])("prints %d as %s — rupee sign, no space, no decimals, Indian grouping", (amount, text) => {
    render(<PriceTag amount={amount} />);
    expect(screen.getByText(text)).toHaveClass("font-display", "font-bold", "text-price-amount");
  });

  it("strikes the original price and says 'was' to assistive tech", () => {
    render(<PriceTag amount={240} was={320} />);
    const struck = screen.getByText("₹320");
    expect(struck.tagName).toBe("S");
    expect(struck).toHaveTextContent("was ₹320");
    expect(screen.getByText("was")).toHaveClass("sr-only");
    expect(struck).toHaveClass("text-price-was", "text-text-subtle");
  });

  it("prints no struck price without a discount", () => {
    const { container } = render(<PriceTag amount={240} />);
    expect(container.querySelector("s")).not.toBeInTheDocument();
    expect(screen.queryByText("was")).not.toBeInTheDocument();
  });

  it("wraps, so a struck price drops under the price in a narrow cell instead of overflowing", () => {
    render(<PriceTag amount={240} was={320} />);
    expect(screen.getByText("₹240").parentElement).toHaveClass("flex-wrap");
  });

  it("joins a range with an en dash and no spaces", () => {
    render(<PriceTag amount={180} to={320} />);
    expect(screen.getByText("₹180–₹320")).toBeInTheDocument();
  });

  it.each([
    [320, 240],
    [240, 240],
  ])("refuses a struck price that is not higher (amount %d, was %d)", (amount, was) => {
    expect(() => renderToString(<PriceTag amount={amount} was={was} />)).toThrow(RangeError);
  });

  it("refuses a struck price below the top of a range", () => {
    expect(() => renderToString(<PriceTag amount={180} to={320} was={300} />)).toThrow(RangeError);
  });

  it("refuses a range that runs backwards", () => {
    expect(() => renderToString(<PriceTag amount={320} to={180} />)).toThrow(RangeError);
  });

  it.each([
    ["sm", "text-price-sm"],
    ["md", "text-price-md"],
    ["lg", "text-price-lg"],
    ["canvas", "text-price-canvas"],
  ] as const)("sets size %s with %s on the tag", (size, sizeClass) => {
    render(<PriceTag amount={280} size={size} />);
    expect(screen.getByText("₹280").parentElement).toHaveClass(sizeClass);
  });

  it("scales the struck price with the canvas size, since it is relative to the tag", () => {
    render(<PriceTag amount={220} was={280} size="canvas" />);
    expect(screen.getByText("₹220").parentElement).toHaveClass("text-price-canvas");
    expect(screen.getByText("₹280")).toHaveClass("text-price-was");
    expect(screen.getByText("₹220")).toHaveClass("text-price-amount");
  });

  it.each([
    ["neutral", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("paints color %s with %s", (color, colour) => {
    render(<PriceTag amount={280} color={color} />);
    expect(screen.getByText("₹280")).toHaveClass(colour);
  });

  it("scales as a whole with one consumer class — the struck price follows", () => {
    render(<PriceTag amount={280} was={320} className="text-canvas-h2" />);
    const tag = screen.getByText("₹280").parentElement;
    expect(tag).toHaveClass("text-canvas-h2");
    expect(tag).not.toHaveClass("text-price-md");
  });

  it("sx lands on the root and beats its own gap", () => {
    render(<PriceTag amount={280} sx={{ mt: 4, gap: 4 }} />);
    const tag = screen.getByText("₹280").parentElement;
    expect(tag).toHaveClass("mt-4", "gap-4");
    expect(tag?.className).not.toMatch(/\bgap-2\b/);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <PriceTag amount={280} />
        <PriceTag amount={240} was={320} />
        <PriceTag amount={180} to={320} size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
