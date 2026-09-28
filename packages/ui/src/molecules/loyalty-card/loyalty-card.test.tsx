import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LoyaltyCard } from "./loyalty-card";

describe("LoyaltyCard", () => {
  it.each([
    [3, 6, "3 more visits and chai is on us."],
    [5, 6, "1 more visit and chai is on us."],
    [6, 6, "Your chai is on us."],
  ])("reads naturally at %i of %i visits", (visits, goal, headline) => {
    render(<LoyaltyCard visits={visits} goal={goal} reward="chai" />);
    expect(screen.getByText(headline)).toBeInTheDocument();
  });

  it("reads naturally with an article-first reward", () => {
    render(<LoyaltyCard visits={2} goal={6} reward="a kulfi" />);
    expect(screen.getByText("4 more visits and a kulfi is on us.")).toBeInTheDocument();
  });

  it("drops the article once an article-first reward is earned", () => {
    render(<LoyaltyCard visits={6} goal={6} reward="a kulfi" />);
    expect(screen.getByText("Your kulfi is on us.")).toBeInTheDocument();
  });

  it('drops an "an" too, but keeps a word that only starts with one', () => {
    render(
      <>
        <LoyaltyCard visits={6} goal={6} reward="an iced chai" />
        <LoyaltyCard visits={6} goal={6} reward="anjeer barfi" />
      </>
    );
    expect(screen.getByText("Your iced chai is on us.")).toBeInTheDocument();
    expect(screen.getByText("Your anjeer barfi is on us.")).toBeInTheDocument();
  });

  it("lets the page replace the generated headline", () => {
    render(<LoyaltyCard visits={2} goal={6} reward="a kulfi" headline="Two down, four to go." />);
    expect(screen.getByText("Two down, four to go.")).toBeInTheDocument();
  });

  it("shows the stamps as a segmented progress bar", () => {
    render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    // Named "Visits" (R97): the value text carries the count, so it is not read twice.
    const stamps = screen.getByRole("progressbar", { name: "Visits" });
    expect(stamps).toHaveAttribute("aria-valuenow", "3");
    expect(stamps).toHaveAttribute("aria-valuemax", "6");
    expect(stamps).toHaveAttribute("aria-valuetext", "3 of 6");
    // One stamp segment per visit the goal asks for.
    expect(stamps.children).toHaveLength(6);
    // The name is announced, never printed: the sentence above already says it.
    expect(screen.getByText("Visits")).toHaveClass("sr-only");
  });

  it("never shows more stamps than the goal", () => {
    render(<LoyaltyCard visits={9} goal={6} reward="chai" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("Your chai is on us.")).toBeInTheDocument();
  });

  it("sits on the light-pink feature card by default", () => {
    const { container } = render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "soft");
  });

  it("hides the brand symbol from assistive tech — the sentence carries the meaning", () => {
    const { container } = render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a caller className replace the card radius", () => {
    const { container } = render(
      <LoyaltyCard visits={3} goal={6} reward="chai" className="rounded-lg" />
    );
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-xl");
  });

  it("floods pink for the brand variant", () => {
    const { container } = render(
      <LoyaltyCard visits={2} goal={6} reward="a kulfi" variant="brand" />
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "brand");
  });

  it.each([[{ visits: 1, goal: 0 }], [{ visits: 1, goal: 2.5 }], [{ visits: -1, goal: 6 }]])(
    "rejects an impossible count %o instead of drawing nonsense",
    (counts) => {
      // A server component is a plain function: call it to see the throw without a React error boundary.
      expect(() => LoyaltyCard({ ...counts, reward: "chai" })).toThrow(RangeError);
    }
  );

  it("has no accessibility violations in progress, complete and on brand", async () => {
    const { container } = render(
      <>
        <LoyaltyCard visits={3} goal={6} reward="chai" />
        <LoyaltyCard visits={6} goal={6} reward="chai" />
        <LoyaltyCard visits={2} goal={6} reward="a kulfi" variant="brand" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
