import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { ReviewCard } from "./review-card";

const REVIEW = {
  name: "Vikas Kumar",
  meta: "Restaurant · Google review",
  quote: "Very nice and economical food or very tasty food as home",
} as const;

describe("ReviewCard", () => {
  it("quotes the guest in curly quotes inside a blockquote, attributed in the caption", () => {
    const { container } = render(<ReviewCard {...REVIEW} />);
    expect(container.querySelector("blockquote")).toHaveTextContent(`“${REVIEW.quote}”`);
    expect(container.querySelector("figcaption")).toHaveTextContent(REVIEW.name);
    expect(container.querySelector("figcaption")).toHaveTextContent(REVIEW.meta);
  });

  it("shows the score when given one", () => {
    render(<ReviewCard {...REVIEW} rating={5} />);
    expect(screen.getByRole("img", { name: "5.0 out of 5" })).toBeInTheDocument();
  });

  it("sits on a white light-island card by default", () => {
    const { container } = render(<ReviewCard {...REVIEW} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
  });

  it("omits the score and the meta line when neither is given", () => {
    const { container } = render(<ReviewCard name={REVIEW.name} quote={REVIEW.quote} />);
    expect(screen.queryByRole("img", { name: /out of 5/ })).not.toBeInTheDocument();
    expect(container.querySelector("figcaption")).not.toHaveTextContent(REVIEW.meta);
  });

  it("lets a caller className replace the card radius", () => {
    const { container } = render(<ReviewCard {...REVIEW} className="rounded-md" />);
    expect(container.firstElementChild).toHaveClass("rounded-md");
    expect(container.firstElementChild).not.toHaveClass("rounded-lg");
  });

  it("uses the light-pink feature treatment for the brand surface", () => {
    const { container } = render(<ReviewCard {...REVIEW} surface="brand" />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "soft");
  });

  it("marks a verified review with a chip whose words the page can change", () => {
    const { rerender } = render(<ReviewCard {...REVIEW} isVerified />);
    expect(screen.getByText("Verified on Google")).toBeInTheDocument();
    rerender(<ReviewCard {...REVIEW} isVerified verifiedLabel="Verified guest" />);
    expect(screen.getByText("Verified guest")).toBeInTheDocument();
  });

  it("links to the review at its source, in a new tab", () => {
    render(
      <ReviewCard
        {...REVIEW}
        source={{ label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" }}
      />
    );
    expect(screen.getByRole("link", { name: /View on Google/ })).toHaveAttribute(
      "target",
      "_blank"
    );
  });

  it("drops the avatar when asked (the handoff's Google reviews)", () => {
    const { container, rerender } = render(<ReviewCard {...REVIEW} />);
    expect(container.querySelector("figcaption")).toHaveTextContent("VK");
    rerender(<ReviewCard {...REVIEW} hasAvatar={false} />);
    expect(container.querySelector("figcaption")).not.toHaveTextContent("VK");
  });

  it("has no accessibility violations with every part shown, on both treatments", async () => {
    const { container } = render(
      <>
        <ReviewCard
          {...REVIEW}
          rating={5}
          isVerified
          source={{ label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" }}
        />
        <ReviewCard {...REVIEW} rating={4} surface="brand" mark="symbol" />
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, beating a default class and keeping className", () => {
    const { container } = render(
      <ReviewCard {...REVIEW} sx={{ gap: 2, mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("gap-2", "mt-4", "italic");
    expect(container.firstElementChild).not.toHaveClass("gap-3.5");
  });
});
