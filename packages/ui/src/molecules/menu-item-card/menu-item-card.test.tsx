import { render, screen } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemCard } from "./menu-item-card";

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router="">
      {children}
    </a>
  );
}

describe("MenuItemCard", () => {
  it("names the dish as a heading and always shows the vegetarian mark", () => {
    render(<MenuItemCard name="Masala Cold Brew" price={220} />);
    expect(screen.getByRole("heading", { level: 3, name: "Masala Cold Brew" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("takes no diet prop — every dish on the menu is vegetarian", () => {
    // @ts-expect-error — the kitchen is egg-free (spec C10): a diet prop must never compile.
    render(<MenuItemCard name="Masala Fries" price={190} diet="egg" />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("prints the price and the struck-through old price", () => {
    render(<MenuItemCard name="Masala Fries" price={190} was={240} />);
    const card = screen.getByRole("article");
    expect(card).toHaveTextContent("₹190");
    expect(card).toHaveTextContent("₹240");
  });

  it("shows the badge, the heat and the description when given", () => {
    render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        badge="New"
        description="Cold brew, jaggery, cardamom."
      />
    );
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Spice level 1 of 4" })).toBeInTheDocument();
    // Ingredient-led, 14 words at most — the card clamps it so a grid keeps one rhythm.
    expect(screen.getByText("Cold brew, jaggery, cardamom.")).toHaveClass("line-clamp-2");
  });

  it("labels the 4:3 photo placeholder until photography exists", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.getByText("Dish photo")).toBeInTheDocument();
  });

  it("shows the photograph once one is supplied", () => {
    render(
      <MenuItemCard
        name="Kulhad Chai"
        price={90}
        image={{
          src: "/menu/kulhad-chai.avif",
          alt: "Kulhad chai in a clay cup",
          width: 420,
          height: 315,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toHaveAttribute(
      "src",
      "/menu/kulhad-chai.avif"
    );
    expect(screen.queryByText("Dish photo")).not.toBeInTheDocument();
  });

  it("draws no action on a card that cannot take an order", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("makes the name a link that covers the card when given an href", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" />);
    const link = screen.getByRole("link", { name: "Kulhad Chai" });
    expect(link).toHaveAttribute("href", "/menu/kulhad-chai");
    // One real, focusable link stretched over the card — never a click handler on the card.
    expect(link).toHaveClass("after:inset-0");
  });

  it("lifts only when it is a link — a lift on a plain card promises a click that does nothing", () => {
    const { rerender } = render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveClass("hover:lift");
    rerender(<MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" />);
    expect(screen.getByRole("article")).toHaveClass("hover:lift");
  });

  it("lets a caller className replace the card radius", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} className="rounded-md" />);
    expect(screen.getByRole("article")).toHaveClass("rounded-md");
    expect(screen.getByRole("article")).not.toHaveClass("rounded-lg");
  });

  it("renders the link through the app's router link when given one", () => {
    render(
      <MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" linkAs={RouterLink} />
    );
    expect(screen.getByRole("link", { name: "Kulhad Chai" })).toHaveAttribute("data-router");
  });

  it("keeps the floating action a sibling of the link, never nested inside it", () => {
    render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        href="/menu/masala-cold-brew"
        action={
          <button type="button" aria-label="Add Masala Cold Brew">
            +
          </button>
        }
      />
    );
    const link = screen.getByRole("link", { name: "Masala Cold Brew" });
    expect(link).not.toContainElement(screen.getByRole("button", { name: "Add Masala Cold Brew" }));
  });

  it("has no accessibility violations as a link with an action", async () => {
    const { container } = render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        badge="New"
        description="Cold brew, jaggery, cardamom."
        href="/menu/masala-cold-brew"
        action={
          <button type="button" aria-label="Add Masala Cold Brew">
            +
          </button>
        }
      />
    );
    await expectNoA11yViolations(container);
  });
});
