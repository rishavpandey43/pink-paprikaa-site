import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemRow } from "./menu-item-row";

describe("MenuItemRow", () => {
  it("names the dish as a level-3 heading and always shows the vegetarian mark", () => {
    render(<MenuItemRow name="Paprikaa Chilli Paneer" price={280} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Paprikaa Chilli Paneer" })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("takes no diet prop — every dish on the menu is vegetarian", () => {
    // @ts-expect-error — the kitchen is egg-free (spec C10): a diet prop must never compile.
    render(<MenuItemRow name="Gulkand Kulfi" price={180} diet="egg" />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("prints the price the brand way and keeps the struck-through old price", () => {
    render(<MenuItemRow name="Mushroom Keema Pav" price={340} was={380} />);
    const row = screen.getByRole("article");
    expect(row).toHaveTextContent("₹340");
    expect(row).toHaveTextContent("₹380");
  });

  it("marks the Devanagari name as Hindi so screen readers pronounce it", () => {
    render(<MenuItemRow name="Gulkand Kulfi" nameDevanagari="कुल्फी" price={180} />);
    expect(screen.getByText("कुल्फी")).toHaveAttribute("lang", "hi");
  });

  it("shows the heat, the badge and the description when given", () => {
    render(
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
      />
    );
    expect(screen.getByRole("img", { name: "Spice level 3 of 4" })).toBeInTheDocument();
    expect(screen.getByText("Bestseller")).toBeInTheDocument();
    expect(
      screen.getByText("Amritsari paneer, burnt chilli mayo, potato brioche.")
    ).toBeInTheDocument();
  });

  it("renders no heat scale on a dish without heat", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("img", { name: /Spice level/ })).not.toBeInTheDocument();
  });

  it("labels the photo placeholder until photography exists, then shows the photo", () => {
    const { rerender } = render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.getByText("Dish photo")).toBeInTheDocument();
    rerender(
      <MenuItemRow
        name="Kulhad Chai"
        price={90}
        image={{
          src: "/menu/kulhad-chai.avif",
          alt: "Kulhad chai in a clay cup",
          width: 208,
          height: 208,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toHaveAttribute(
      "src",
      "/menu/kulhad-chai.avif"
    );
  });

  it("renders the action slot — the row never owns cart state", () => {
    render(
      <MenuItemRow name="Kulhad Chai" price={90} action={<button type="button">Add</button>} />
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("renders no control when the menu cannot take orders", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("draws the hairline divider by default and drops it on request", () => {
    const { rerender } = render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.getByRole("article")).toHaveClass("border-b");
    rerender(<MenuItemRow name="Kulhad Chai" price={90} hasDivider={false} />);
    expect(screen.getByRole("article")).not.toHaveClass("border-b");
  });

  it("uses the heading level the page needs", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} headingLevel={4} />);
    expect(screen.getByRole("heading", { level: 4, name: "Kulhad Chai" })).toBeInTheDocument();
  });

  it("lets a caller className replace its own padding", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} className="py-2" />);
    expect(screen.getByRole("article")).toHaveClass("py-2");
    expect(screen.getByRole("article")).not.toHaveClass("py-5");
  });

  it("has no accessibility violations in its fullest state", async () => {
    const { container } = render(
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        price={280}
        was={320}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        action={<button type="button">Add</button>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
