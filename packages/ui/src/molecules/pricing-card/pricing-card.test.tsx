import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PricingCard } from "./pricing-card";

const CLASSIC = {
  name: "Classic",
  price: 130,
  was: 140,
  unit: "a meal",
  blurb: "The full Pink Paprikaa menu. Our recommendation.",
  points: [
    "30 dishes: Rajma, Chole, Dal Makhani, Kofta, Gatte",
    "Raita three times a week",
    "Weekly biryani + Gulab Jamun",
  ],
} as const;

describe("PricingCard", () => {
  it("names the plate as a heading and prints the price per unit the brand way", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(screen.getByRole("heading", { level: 3, name: "Classic" })).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveTextContent("₹130");
    expect(screen.getByRole("article")).toHaveTextContent("a meal");
  });

  it("strikes the regular price and announces it as the old one", () => {
    const { container } = render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    // PriceTag's hidden word, lower-case (R94).
    expect(container.querySelector("s")).toHaveTextContent("was ₹140");
  });

  it("draws the struck price with the shared StruckPrice, in text-subtle like PriceTag", () => {
    const { container } = render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(container.querySelector("s")).toHaveClass("text-text-subtle", "text-body");
  });

  it.each([130, 120])(
    "refuses a struck price (%i) that is not above the price, like PriceTag",
    (was) => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() =>
        render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} was={was} />)
      ).toThrow(RangeError);
    }
  );

  it("lists what the plate includes, each with a tick", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    for (const item of items) expect(item.querySelector("svg")).not.toBeNull();
  });

  it("keeps its unstyled points a list for Safari, with an explicit list role", () => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} />);
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  it.each([
    ["default", "light"],
    ["featured", "light"],
    ["flooded", "brand"],
  ] as const)("sets the %s card's surface to %s", (variant, surface) => {
    render(<PricingCard {...CLASSIC} points={[...CLASSIC.points]} variant={variant} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-surface", surface);
  });

  it("centres the badge on the top edge and sets the tag beside the name", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        badge={<span>Our recommendation</span>}
        tag={<span>Launch price</span>}
      />
    );
    expect(screen.getByText("Our recommendation").parentElement).toHaveClass(
      "absolute",
      "-top-3",
      "left-1/2"
    );
    expect(screen.getByRole("heading", { name: "Classic" }).parentElement).toContainElement(
      screen.getByText("Launch price")
    );
  });

  it("puts the footnote and the action together at the foot of the card", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        footnote="Weekday plan: ₹3,120 · 24 meals"
        action={<a href="#builder">Build with Classic</a>}
      />
    );
    const footer = screen.getByText("Weekday plan: ₹3,120 · 24 meals").parentElement;
    expect(footer).toHaveClass("mt-auto");
    expect(footer).toContainElement(screen.getByRole("link", { name: "Build with Classic" }));
  });

  it("shows the media slot above the name", () => {
    render(
      <PricingCard {...CLASSIC} points={[...CLASSIC.points]} media={<div data-testid="photo" />} />
    );
    expect(screen.getByRole("article").firstElementChild).toContainElement(
      screen.getByTestId("photo")
    );
  });

  it("lets a very long plate name wrap instead of widening the card", () => {
    render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        name="Classic-with-Dal-Makhani-Jeera-Rice-and-Gulab-Jamun-every-single-day"
        tag={<span>Launch price</span>}
      />
    );
    const name = screen.getByRole("heading");
    expect(name).toHaveClass("min-w-0", "wrap-anywhere");
    expect(name.parentElement).toHaveClass("flex-wrap");
  });

  it("has no accessibility violations flooded with every part", async () => {
    const { container } = render(
      <PricingCard
        {...CLASSIC}
        points={[...CLASSIC.points]}
        variant="flooded"
        badge={<span>Our recommendation</span>}
        footnote="Weekday plan: ₹3,120 · 24 meals"
        action={<a href="#builder">Build with Classic</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
