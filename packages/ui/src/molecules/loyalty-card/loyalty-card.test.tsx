import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LoyaltyCard } from "./loyalty-card";

describe("LoyaltyCard", () => {
  it("pluralises the remaining visits", () => {
    render(<LoyaltyCard goal={6} reward="chai" visits={3} />);
    expect(screen.getByText("3 more visits and chai is on us.")).toBeInTheDocument();
  });

  it("drops to the singular with one visit left", () => {
    render(<LoyaltyCard goal={6} reward="chai" visits={5} />);
    expect(screen.getByText("1 more visit and chai is on us.")).toBeInTheDocument();
  });

  it("switches to the earned sentence once the goal is met", () => {
    render(<LoyaltyCard goal={6} reward="chai" visits={6} />);
    expect(screen.getByText("Your chai is on us.")).toBeInTheDocument();
  });

  it("reads naturally with an article-first reward", () => {
    render(<LoyaltyCard goal={6} reward="a kulfi" visits={2} />);
    expect(screen.getByText("4 more visits and a kulfi is on us.")).toBeInTheDocument();
  });

  it("draws one stamp per goal visit rather than a percentage bar", () => {
    const { container } = render(<LoyaltyCard goal={6} visits={3} />);
    const track = screen.getByRole("progressbar");

    expect(track.children).toHaveLength(6);
    expect(container.querySelector(".bg-brand-soft")).toBeInTheDocument();
  });

  it("names the track for assistive tech without printing a caption", () => {
    render(<LoyaltyCard goal={6} visits={3} />);

    expect(screen.getByRole("progressbar", { name: "3 of 6 visits" })).toBeInTheDocument();
    expect(screen.queryByText("3 of 6 visits")).not.toBeInTheDocument();
  });

  it("clamps a stale count into the track", () => {
    render(<LoyaltyCard goal={6} visits={9} />);

    const track = screen.getByRole("progressbar", { name: "6 of 6 visits" });
    expect(track).toHaveAttribute("aria-valuenow", "6");
  });

  it("clamps a negative count to zero", () => {
    render(<LoyaltyCard goal={6} visits={-2} />);
    expect(screen.getByRole("progressbar", { name: "0 of 6 visits" })).toBeInTheDocument();
  });

  it("renders the feature skin on the pale pink ground", () => {
    const { container } = render(<LoyaltyCard goal={6} visits={3} />);

    expect(container.firstElementChild).toHaveClass("bg-surface-brand-soft");
    expect(screen.getByText("3 more visits and chai is on us.")).toHaveClass("text-text-brand");
  });

  it("flips the ink and the stamps on the flooded pink skin", () => {
    const { container } = render(<LoyaltyCard goal={6} variant="brand" visits={3} />);

    expect(container.firstElementChild).toHaveClass("bg-surface-brand");
    expect(screen.getByText("3 more visits and chai is on us.")).toHaveClass("text-text-on-brand");
  });

  it("hides the brand symbol from assistive tech — the headline already says the brand", () => {
    const { container } = render(<LoyaltyCard goal={6} visits={3} />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("merges a caller className", () => {
    const { container } = render(<LoyaltyCard className="rounded-1" goal={6} visits={3} />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <LoyaltyCard goal={6} reward="chai" visits={3} />
        <LoyaltyCard goal={6} reward="chai" visits={6} />
        <LoyaltyCard goal={6} reward="a kulfi" variant="brand" visits={2} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
