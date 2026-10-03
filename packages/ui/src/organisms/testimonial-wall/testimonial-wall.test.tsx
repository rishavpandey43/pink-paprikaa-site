import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { GOOGLE_REVIEWS } from "../story-fixtures";
import { TestimonialWall } from "./testimonial-wall";

const REVIEWS = GOOGLE_REVIEWS.slice(1);

describe("TestimonialWall", () => {
  it("heads the wall with its overline and a level-2 title", () => {
    render(
      <TestimonialWall overline="Guests" title="What people actually say" reviews={REVIEWS} />
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "What people actually say" })
    ).toBeInTheDocument();
    expect(screen.getByText("Guests")).toBeInTheDocument();
  });

  it("renders the lede under the heading", () => {
    render(
      <TestimonialWall
        title="Reviews"
        lede="Verified Google reviews, in the guests' own words."
        reviews={REVIEWS}
      />
    );
    expect(
      screen.getByText("Verified Google reviews, in the guests' own words.")
    ).toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} headingLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Reviews" })).toBeInTheDocument();
  });

  it("lists one review card per review, quotes verbatim", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    const list = screen.getByRole("list");
    // Safari drops list semantics under `list-style: none` unless the role is explicit.
    expect(list).toHaveAttribute("role", "list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(REVIEWS.length);
    expect(screen.getAllByRole("figure")).toHaveLength(REVIEWS.length);
    expect(screen.getByText(/Had Honey chili potato and it was good/)).toBeInTheDocument();
  });

  it("dresses every card in the wall's variant", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} variant="brand" />);
    // ReviewCard's brand variant is Card's pale-pink `feature` surface.
    for (const card of screen.getAllByRole("figure")) {
      expect(card).toHaveAttribute("data-surface", "soft");
    }
  });

  it("lays the cards on the auto-fitting card grid", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    expect(screen.getByRole("list")).toHaveClass("autogrid");
  });

  it("announces each score as an image with its value", () => {
    render(<TestimonialWall title="Reviews" reviews={REVIEWS} />);
    expect(screen.getAllByRole("img", { name: /out of 5$/ })).toHaveLength(REVIEWS.length);
  });

  it("omits the score for a review that carries none", () => {
    const [first] = REVIEWS;
    if (first === undefined) throw new Error("no fixture review");
    render(<TestimonialWall title="Reviews" reviews={[{ ...first, rating: undefined }]} />);
    expect(screen.queryByRole("img", { name: /out of 5$/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(1);
  });

  it("merges a caller className", () => {
    const { container } = render(
      <TestimonialWall title="Reviews" reviews={REVIEWS} className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestimonialWall overline="Guests" title="What people actually say" reviews={REVIEWS} />
    );
    await expectNoA11yViolations(container);
  });
});
