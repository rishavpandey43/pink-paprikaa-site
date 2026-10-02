import { render, screen } from "@testing-library/react";

import { assertStruckAbove, StruckPrice } from "./struck-price";

describe("StruckPrice", () => {
  it("strikes the price in text-subtle and says a hidden lower-case 'was' (R94)", () => {
    const { container } = render(<StruckPrice className="text-body-sm">₹140</StruckPrice>);
    const struck = container.querySelector("s");
    expect(struck).toHaveTextContent("was ₹140");
    expect(struck).toHaveClass("text-text-subtle", "text-body-sm");
    expect(screen.getByText("was")).toHaveClass("sr-only");
  });

  it("takes another hidden word, for a page in another language", () => {
    const { container } = render(<StruckPrice label="pehle">₹140</StruckPrice>);
    expect(container.querySelector("s")).toHaveTextContent("pehle ₹140");
    expect(screen.getByText("pehle")).toHaveClass("sr-only");
  });

  it("lets a consumer replace the colour", () => {
    const { container } = render(<StruckPrice className="text-ink-400">₹140</StruckPrice>);
    expect(container.querySelector("s")).toHaveClass("text-ink-400");
    expect(container.querySelector("s")).not.toHaveClass("text-text-subtle");
  });
});

describe("assertStruckAbove", () => {
  it("passes a higher struck price, or none", () => {
    expect(() => {
      assertStruckAbove("PriceTag", 140, 130);
    }).not.toThrow();
    expect(() => {
      assertStruckAbove("PriceTag", undefined, 130);
    }).not.toThrow();
  });

  it.each([130, 120])("throws a RangeError naming the component for was %d against 130", (was) => {
    expect(() => {
      assertStruckAbove("PricingCard", was, 130);
    }).toThrow(
      new RangeError(
        `PricingCard: was (${String(was)}) must be more than the price it strikes through (130)`
      )
    );
  });
});
