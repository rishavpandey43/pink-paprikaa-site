import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { StickyActionBar } from "./sticky-action-bar";

const BAR = {
  amount: "₹3,276",
  caption: "₹130/meal · Classic · Weekday plan · Lunch",
  action: <a href="#send">Send plan</a>,
} as const;

describe("StickyActionBar", () => {
  it("shows the amount, the caption and the action", () => {
    render(<StickyActionBar {...BAR} />);
    expect(screen.getByText("₹3,276")).toBeInTheDocument();
    expect(screen.getByText(BAR.caption)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send plan" })).toBeInTheDocument();
  });

  it("shows a caption whenever React would render it — a 0 counts, false does not", () => {
    const { container, rerender } = render(<StickyActionBar {...BAR} caption={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    rerender(<StickyActionBar {...BAR} caption={false} />);
    expect(container.querySelector(".text-caption")).toBeNull();
  });

  it("is an ink pill on every surface", () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "ink");
    expect(container.firstElementChild).toHaveClass("rounded-pill", "bg-surface-inverse");
  });

  it("sticks just above the mobile action dock", () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveClass("sticky", "bottom-dock-clearance", "z-raised");
  });

  it("hides from the two-column breakpoint by default, or never", () => {
    const { container, rerender } = render(<StickyActionBar {...BAR} />);
    expect(container.firstElementChild).toHaveClass("lg:hidden");
    rerender(<StickyActionBar {...BAR} hideFrom="never" />);
    expect(container.firstElementChild).not.toHaveClass("lg:hidden");
  });

  it("truncates a long caption instead of wrapping the pill", () => {
    render(<StickyActionBar {...BAR} />);
    expect(screen.getByText(BAR.caption)).toHaveClass("truncate");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StickyActionBar {...BAR} />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <StickyActionBar
        amount="₹240"
        action={<button type="button">Pay</button>}
        sx={{ mt: 4 }}
        className="italic"
      />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
