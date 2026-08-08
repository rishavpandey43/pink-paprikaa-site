import { render, screen } from "@testing-library/react";
import { Leaf, Star, UtensilsCrossed } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "100%", label: "vegetarian kitchen", icon: Leaf },
  { value: "7", label: "sections on the menu", icon: UtensilsCrossed },
  { value: "4.6", label: "average guest rating", icon: Star },
];

describe("StatBand", () => {
  it("renders every number and its label", () => {
    render(<StatBand stats={STATS} />);

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("vegetarian kitchen")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("sections on the menu")).toBeInTheDocument();
    expect(screen.getByText("4.6")).toBeInTheDocument();
    expect(screen.getByText("average guest rating")).toBeInTheDocument();
  });

  it("renders a sub line only when the item carries one", () => {
    render(
      <StatBand
        stats={[
          { value: "7", label: "sections on the menu", sub: "North Indian through to desserts" },
          { value: "4.6", label: "average guest rating" },
        ]}
      />
    );

    expect(screen.getByText("North Indian through to desserts")).toBeInTheDocument();
    // The item with no sub line renders the number and its label and nothing else.
    expect(screen.getByText("4.6").parentElement?.children).toHaveLength(2);
  });

  it("renders one glyph per item that asks for one", () => {
    const { container } = render(<StatBand stats={STATS} />);

    expect(container.querySelectorAll("svg")).toHaveLength(STATS.length + 1);
  });

  it.each([
    ["soft", "bg-surface-brand-soft"],
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("floods the %s ground", (tone, expected) => {
    const { container } = render(<StatBand stats={STATS} tone={tone} />);

    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("inverts the numbers on a flooded ground and keeps them pink on soft", () => {
    const { rerender } = render(<StatBand stats={STATS} tone="brand" />);
    expect(screen.getByText("4.6")).toHaveClass("text-text-on-inverse");

    rerender(<StatBand stats={STATS} tone="soft" />);
    expect(screen.getByText("4.6")).toHaveClass("text-text-brand");
  });

  it("centres every column so the row reads as one band", () => {
    render(<StatBand stats={STATS} />);

    expect(screen.getByText("4.6").parentElement).toHaveClass("text-center");
  });

  it("lays the row out on an auto-fit grid that survives 360px", () => {
    render(<StatBand stats={STATS} />);

    expect(screen.getByText("4.6").parentElement?.parentElement).toHaveClass(
      "grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))]"
    );
  });

  it("merges a caller className", () => {
    const { container } = render(<StatBand className="rounded-5" stats={STATS} />);

    expect(container.firstElementChild).toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StatBand stats={STATS} />);
    await expectNoA11yViolations(container);
  });
});
