import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PriceSummary } from "./price-summary";

const LINES = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
];

describe("PriceSummary", () => {
  it("prints every line with a rupee sign, no space and no decimals", () => {
    render(<PriceSummary lines={LINES} total={1239} />);
    expect(screen.getByText("Subtotal")).toBeVisible();
    expect(screen.getByText("₹1,180")).toBeVisible();
    expect(screen.getByText("₹59")).toBeVisible();
  });

  it("groups digits the Indian way", () => {
    render(<PriceSummary lines={[{ label: "Subtotal", amount: 120000 }]} total={126000} />);
    expect(screen.getByText("₹1,20,000")).toBeVisible();
  });

  it("prints a saving in mint with a leading minus", () => {
    render(
      <PriceSummary
        lines={[...LINES, { label: "First order", amount: 100, isDiscount: true }]}
        total={1139}
      />
    );
    const saving = screen.getByText("−₹100");
    expect(saving).toBeVisible();
    expect(saving).toHaveClass("text-status-success");
  });

  it("emphasises a strong line", () => {
    render(
      <PriceSummary lines={[{ label: "Items", amount: 1180, isStrong: true }]} total={1239} />
    );
    expect(screen.getByText("Items")).toHaveClass("text-text-heading");
  });

  it("labels the total and lets the caller rename it", () => {
    const { rerender } = render(<PriceSummary lines={LINES} total={1239} />);
    expect(screen.getByText("Total")).toBeVisible();
    expect(screen.getByText("₹1,239")).toBeVisible();

    rerender(<PriceSummary lines={LINES} total={1239} totalLabel="Amount Paid" />);
    expect(screen.getByText("Amount Paid")).toBeVisible();
  });

  it("sets the figures in mono so the column's digits line up", () => {
    render(<PriceSummary lines={LINES} total={1239} />);
    expect(screen.getByText("₹1,180")).toHaveClass("font-mono");
    expect(screen.getByText("₹1,239")).toHaveClass("font-mono");
  });

  it("renders the fine print only when given", () => {
    const { rerender } = render(<PriceSummary lines={LINES} total={1239} />);
    expect(screen.queryByText("Inclusive of all taxes.")).not.toBeInTheDocument();

    rerender(<PriceSummary lines={LINES} note="Inclusive of all taxes." total={1239} />);
    expect(screen.getByText("Inclusive of all taxes.")).toBeVisible();
  });

  it("renders with no lines at all", () => {
    render(<PriceSummary total={280} />);
    expect(screen.getByText("₹280")).toBeVisible();
  });

  it("lifts the ink tones to white on a flooded panel", () => {
    render(<PriceSummary lines={LINES} tone="inverse" total={1239} />);
    expect(screen.getByText("₹1,239")).toHaveClass("text-text-on-inverse");
    expect(screen.getByText("Subtotal")).toHaveClass("text-text-on-inverse/75");
  });

  it("merges a caller className", () => {
    const { container } = render(<PriceSummary className="gap-y-4" lines={LINES} total={1239} />);
    expect(container.firstElementChild).toHaveClass("gap-y-4");
    expect(container.firstElementChild).not.toHaveClass("gap-y-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PriceSummary
        lines={[...LINES, { label: "First order", amount: 100, isDiscount: true }]}
        note="Inclusive of all taxes."
        total={1139}
      />
    );
    await expectNoA11yViolations(container);
  });
});
