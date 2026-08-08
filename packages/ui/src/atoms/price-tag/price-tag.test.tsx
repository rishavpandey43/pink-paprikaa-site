import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PriceTag } from "./price-tag";

describe("PriceTag", () => {
  it("prints a whole rupee amount with no space and no decimals", () => {
    render(<PriceTag amount={280} />);
    expect(screen.getByText("₹280")).toBeInTheDocument();
  });

  it("groups thousands the Indian way", () => {
    render(<PriceTag amount={125000} />);
    expect(screen.getByText("₹1,25,000")).toBeInTheDocument();
  });

  it("keeps paise only when the amount is not whole", () => {
    render(<PriceTag amount={99.5} />);
    expect(screen.getByText("₹99.5")).toBeInTheDocument();
  });

  it("joins a range with an en dash", () => {
    render(<PriceTag amount={180} to={320} />);
    expect(screen.getByText("₹180–₹320")).toBeInTheDocument();
  });

  it("strikes the original price and says what it was", () => {
    render(<PriceTag amount={240} was={320} />);
    expect(screen.getByText("₹240")).toBeInTheDocument();
    expect(screen.getByText("₹320")).toHaveClass("line-through");
    expect(screen.getByText("Was")).toHaveClass("sr-only");
  });

  it("prints no struck price when there is no discount", () => {
    render(<PriceTag amount={240} />);
    expect(screen.queryByText("Was")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "text-body2"],
    ["md", "text-subtitle1"],
    ["lg", "text-h3"],
  ] as const)("sets the %s size on the ramp", (size, expected) => {
    render(<PriceTag amount={280} size={size} />);
    expect(screen.getByText("₹280")).toHaveClass(expected);
  });

  it.each([
    ["ink", "text-text-heading"],
    ["brand", "text-text-link"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("colours the %s tone", (tone, expected) => {
    render(<PriceTag amount={280} tone={tone} />);
    expect(screen.getByText("₹280")).toHaveClass(expected);
  });

  it("keeps the price display-face and bold at every size", () => {
    render(<PriceTag amount={280} size="sm" />);
    expect(screen.getByText("₹280")).toHaveClass("font-display", "font-bold");
  });

  it("merges a caller className", () => {
    render(<PriceTag amount={280} className="gap-6" />);
    const node = screen.getByText("₹280").parentElement;
    expect(node).toHaveClass("gap-6");
    expect(node).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <PriceTag amount={280} />
        <PriceTag amount={240} was={320} />
        <PriceTag amount={180} size="sm" to={320} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
