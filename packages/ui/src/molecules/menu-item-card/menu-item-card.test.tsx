import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemCard } from "./menu-item-card";

describe("MenuItemCard", () => {
  it("renders the dish as a heading with its price", () => {
    render(<MenuItemCard name="Masala Cold Brew" price={220} />);

    expect(screen.getByRole("heading", { name: "Masala Cold Brew" })).toBeInTheDocument();
    expect(screen.getByText("₹220")).toBeInTheDocument();
  });

  it("renders the dish name at a caller-chosen level", () => {
    render(<MenuItemCard name="Kulhad Chai" nameAs="h4" price={90} />);

    expect(screen.getByRole("heading", { level: 4, name: "Kulhad Chai" })).toBeInTheDocument();
  });

  it("is a card, not a row — a bordered surface that lifts on hover", () => {
    const { container } = render(
      <MenuItemCard href="/menu/kulhad-chai" name="Kulhad Chai" price={90} />
    );
    const card = container.firstElementChild;

    expect(card).toHaveClass("bg-surface-card");
    expect(card).toHaveClass("rounded-4");
    expect(card).toHaveClass("shadow-elevation1");
    expect(card).toHaveClass("hover:shadow-elevation3");
  });

  it("stretches one real link over the whole card rather than hanging a click on it", () => {
    render(<MenuItemCard href="/menu/masala-cold-brew" name="Masala Cold Brew" price={220} />);
    const link = screen.getByRole("link", { name: "Masala Cold Brew" });

    expect(link).toHaveAttribute("href", "/menu/masala-cold-brew");
    expect(link).toHaveClass("after:inset-0");
  });

  it("stays a plain card with no link when no destination is given", () => {
    const { container } = render(<MenuItemCard name="Masala Cold Brew" price={220} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveClass("hover:shadow-elevation3");
  });

  it("prints the pre-discount price struck through beside the live one", () => {
    render(<MenuItemCard name="Masala Fries" price={190} was={240} />);

    expect(screen.getByText("₹240").tagName).toBe("S");
  });

  it("marks the dish vegetarian by default and turmeric when it contains egg", () => {
    const { rerender } = render(<MenuItemCard name="Masala Fries" price={190} />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();

    rerender(<MenuItemCard diet="egg" name="Chocolate Brownie" price={160} />);
    expect(screen.getByRole("img", { name: "Contains egg" })).toBeInTheDocument();
  });

  it("names the heat rather than leaving colour to carry it", () => {
    render(<MenuItemCard name="Masala Fries" price={190} spice={4} />);

    expect(screen.getByRole("img", { name: "Spice level: Extra Hot" })).toBeInTheDocument();
  });

  it("shows the badge over the photograph when one is given", () => {
    render(<MenuItemCard badge="New" name="Masala Cold Brew" price={220} />);

    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("names the floating add button after the dish and calls back when pressed", async () => {
    const handleAdd = vi.fn();
    render(<MenuItemCard name="Masala Cold Brew" onAdd={handleAdd} price={220} />);

    await userEvent.click(screen.getByRole("button", { name: "Add Masala Cold Brew" }));

    expect(handleAdd).toHaveBeenCalledOnce();
  });

  it("draws no add button on a card that cannot take an order", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the labelled placeholder until a photograph exists", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);

    expect(screen.getByText("Dish photo 4:3")).toBeInTheDocument();
  });

  it("renders the photograph with its alt text once one is supplied", () => {
    render(
      <MenuItemCard
        image="/menu/kulhad-chai.jpg"
        imageAlt="Kulhad chai in a clay cup"
        name="Kulhad Chai"
        price={90}
      />
    );

    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(
      <MenuItemCard className="rounded-1" name="Kulhad Chai" price={90} />
    );

    expect(container.firstElementChild).toHaveClass("rounded-1");
    expect(container.firstElementChild).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MenuItemCard
        badge="New"
        description="Cold brew, jaggery, cardamom."
        href="/menu/masala-cold-brew"
        name="Masala Cold Brew"
        onAdd={vi.fn()}
        price={220}
        spice={1}
        was={260}
      />
    );
    await expectNoA11yViolations(container);
  });
});
