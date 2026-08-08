import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ReviewCard } from "./review-card";

const QUOTE = "The chilli paneer is the whole reason I moved to Sector 57.";

describe("ReviewCard", () => {
  it("renders the guest quote inside the component's own quote marks", () => {
    render(<ReviewCard name="Aditi Rao" quote={QUOTE} />);
    expect(screen.getByText(`“${QUOTE}”`)).toBeInTheDocument();
  });

  it("marks the quote up as a blockquote", () => {
    const { container } = render(<ReviewCard name="Aditi Rao" quote={QUOTE} />);
    expect(container.querySelector("blockquote")).toHaveTextContent(QUOTE);
  });

  it("attributes the review to the guest", () => {
    render(<ReviewCard meta="Sector 57 — March" name="Aditi Rao" quote={QUOTE} />);

    expect(screen.getByText("Aditi Rao")).toBeInTheDocument();
    expect(screen.getByText("Sector 57 — March")).toBeInTheDocument();
  });

  it("falls back to the guest's initials when there is no photo", () => {
    render(<ReviewCard name="Aditi Rao" quote={QUOTE} />);
    expect(screen.getByText("AR")).toBeInTheDocument();
  });

  it("omits the meta line when none is given", () => {
    render(<ReviewCard name="Aditi Rao" quote={QUOTE} />);
    expect(screen.queryByText("Sector 57 — March")).not.toBeInTheDocument();
  });

  it("names the score for assistive tech", () => {
    render(<ReviewCard name="Aditi Rao" quote={QUOTE} rating={4.5} />);
    expect(screen.getByRole("img", { name: "Rated 4.5 out of 5" })).toBeInTheDocument();
  });

  it("renders no score at all when none is given", () => {
    render(<ReviewCard name="Aditi Rao" quote={QUOTE} />);
    expect(screen.queryByRole("img", { name: /Rated/ })).not.toBeInTheDocument();
  });

  it("renders the default treatment on the plain card skin", () => {
    const { container } = render(<ReviewCard name="Aditi Rao" quote={QUOTE} />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("bg-surface-card");
    expect(screen.getByText("Aditi Rao")).toHaveClass("text-text-heading");
  });

  it("inks the brand treatment in the brand pink on the pale pink skin", () => {
    const { container } = render(<ReviewCard name="Meera Iyer" quote={QUOTE} variant="brand" />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("bg-surface-brand-soft");
    expect(screen.getByText("Meera Iyer")).toHaveClass("text-text-brand");
  });

  it("drops the diamond for the bare mark when asked", () => {
    const { container } = render(
      <ReviewCard mark="symbol" name="Rhea Dutta" quote={QUOTE} rating={4.3} />
    );
    expect(container.querySelector(".rotate-45")).not.toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(
      <ReviewCard className="rounded-1" name="Aditi Rao" quote={QUOTE} />
    );
    const node = container.firstElementChild;

    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <ReviewCard meta="Sector 57 — March" name="Aditi Rao" quote={QUOTE} rating={5} />
        <ReviewCard
          mark="symbol"
          meta="Sector 57 — April"
          name="Kabir Shah"
          quote="Chai at 8am, chilli paneer at 11pm. They mean it."
          rating={4.5}
          variant="brand"
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
