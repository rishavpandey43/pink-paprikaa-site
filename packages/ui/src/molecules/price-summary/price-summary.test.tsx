import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { type PriceLine, PriceSummary } from "./price-summary";

const LINES: PriceLine[] = [
  { label: "Subtotal", amount: 1180 },
  { label: "GST (5%)", amount: 59 },
  { label: "First order", amount: 100, isDiscount: true },
];

describe("PriceSummary", () => {
  it("lists each line as a term and its amount, formatted the brand way", () => {
    render(<PriceSummary lines={LINES} total={1139} />);
    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    const amounts = screen.getAllByRole("definition").map((amount) => amount.textContent);
    expect(terms).toEqual(["Subtotal", "GST (5%)", "First order", "Total"]);
    expect(amounts.slice(0, 3)).toEqual(["₹1,180", "₹59", "−₹100"]);
    // Tabular figures, so the column's digits line up.
    expect(screen.getByText("₹1,180")).toHaveClass("tabular-nums");
  });

  it("groups digits the Indian way", () => {
    render(<PriceSummary lines={[{ label: "Subtotal", amount: 120000 }]} total={126000} />);
    expect(screen.getByText("₹1,20,000")).toBeInTheDocument();
  });

  it("renders a total with no lines, and a note only when given", () => {
    const { rerender } = render(<PriceSummary lines={[]} total={280} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(["Total"]);
    expect(screen.queryByText("Inclusive of all taxes.")).not.toBeInTheDocument();
    rerender(<PriceSummary lines={[]} total={280} note="Inclusive of all taxes." />);
    expect(screen.getByText("Inclusive of all taxes.")).toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<PriceSummary lines={LINES} total={1139} className="gap-4" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("prints a discount with a true minus in the discount colour, whatever sign it is given", () => {
    render(
      <PriceSummary lines={[{ label: "First order", amount: -100, isDiscount: true }]} total={0} />
    );
    const amount = screen.getByText("−₹100");
    expect(amount).toHaveClass("text-price-summary-discount");
  });

  it("emphasises a strong line", () => {
    render(<PriceSummary lines={[{ label: "Plates", amount: 960, isStrong: true }]} total={960} />);
    expect(screen.getByText("Plates")).toHaveClass("text-text-heading");
    expect(screen.getByText("₹960", { selector: "dd" })).toHaveClass("font-medium");
  });

  it("closes with the total, under a hairline, in a large price", () => {
    render(<PriceSummary lines={LINES} total={1139} />);
    const totalGroup = screen.getByText("Total").parentElement;
    expect(totalGroup).toHaveClass("border-t");
    expect(totalGroup).toContainElement(screen.getByText("₹1,139"));
  });

  it("takes another total label and a note", () => {
    render(
      <PriceSummary lines={LINES} total={1139} totalLabel="To pay" note="Inclusive of all taxes." />
    );
    expect(screen.getByText("To pay")).toBeInTheDocument();
    expect(screen.getByText("Inclusive of all taxes.")).toHaveClass("text-text-subtle");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PriceSummary lines={LINES} total={1139} note="Inclusive of all taxes." />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <PriceSummary
        lines={[{ label: "Thali", amount: 120 }]}
        total={120}
        sx={{ mt: 4 }}
        className="italic"
      />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
