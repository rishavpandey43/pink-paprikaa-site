import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { TestimonialWall, type WallReview } from "./testimonial-wall";

const REVIEWS: WallReview[] = [
  {
    name: "Aditi Rao",
    rating: 5,
    meta: "Sector 57 — March",
    quote: "The chilli paneer is the whole reason I moved to Sector 57.",
  },
  {
    name: "Kabir Shah",
    rating: 4.5,
    meta: "Sector 57 — April",
    quote: "Finally a kitchen that tastes like home.",
  },
  {
    name: "Meera Iyer",
    rating: 5,
    meta: "Sector 57 — May",
    quote: "Chai at 8am, chilli paneer at 11pm. They mean it.",
  },
];

describe("TestimonialWall", () => {
  it("renders the section heading and every review", () => {
    render(
      <TestimonialWall overline="Guests" reviews={REVIEWS} title="What people actually say" />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "What people actually say" })
    ).toBeInTheDocument();
    expect(screen.getByText("Guests")).toBeInTheDocument();
    for (const { name } of REVIEWS) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("wraps each quote in the component's own quote marks", () => {
    render(<TestimonialWall reviews={REVIEWS} title="What people actually say" />);

    expect(screen.getByText("“Finally a kitchen that tastes like home.”")).toBeInTheDocument();
  });

  it("renders the lede when one is passed", () => {
    render(
      <TestimonialWall
        lede="Every quote here is a guest's own words, unedited."
        reviews={REVIEWS}
        title="What people actually say"
      />
    );

    expect(
      screen.getByText("Every quote here is a guest's own words, unedited.")
    ).toBeInTheDocument();
  });

  it("renders the heading at the requested outline level", () => {
    render(<TestimonialWall headingLevel={3} reviews={REVIEWS} title="What people actually say" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "What people actually say" })
    ).toBeInTheDocument();
  });

  it("announces each score as an image with its value", () => {
    render(<TestimonialWall reviews={REVIEWS} title="What people actually say" />);

    expect(screen.getByRole("img", { name: "Rated 4.5 out of 5" })).toBeInTheDocument();
  });

  it("omits the score when a review carries none", () => {
    render(
      <TestimonialWall
        reviews={[{ name: "Rhea Dutta", quote: "Good coffee, better fries." }]}
        title="What people actually say"
      />
    );

    expect(screen.queryByRole("img", { name: /out of 5/ })).not.toBeInTheDocument();
    expect(screen.getByText("Rhea Dutta")).toBeInTheDocument();
  });

  it("floods the cards pale pink by default and drops to white on request", () => {
    const { rerender } = render(
      <TestimonialWall reviews={REVIEWS} title="What people actually say" />
    );
    expect(screen.getByText("Aditi Rao").closest("div.bg-surface-brand-soft")).toBeInTheDocument();

    rerender(
      <TestimonialWall reviews={REVIEWS} title="What people actually say" variant="default" />
    );
    expect(screen.getByText("Aditi Rao").closest("div.bg-surface-card")).toBeInTheDocument();
  });

  it("lays the cards out on an auto-fit grid that survives 360px", () => {
    const { container } = render(
      <TestimonialWall reviews={REVIEWS} title="What people actually say" />
    );

    expect(container.firstElementChild?.lastElementChild).toHaveClass(
      "grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]"
    );
  });

  it("merges a caller className", () => {
    const { container } = render(
      <TestimonialWall className="py-0" reviews={REVIEWS} title="What people actually say" />
    );

    expect(container.firstElementChild).toHaveClass("py-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestimonialWall overline="Guests" reviews={REVIEWS} title="What people actually say" />
    );
    await expectNoA11yViolations(container);
  });
});
