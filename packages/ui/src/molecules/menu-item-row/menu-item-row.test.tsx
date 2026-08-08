import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemRow } from "./menu-item-row";

describe("MenuItemRow", () => {
  it("renders the dish as a heading with its price", () => {
    render(<MenuItemRow name="Paprikaa Chilli Paneer" price={280} />);

    expect(screen.getByRole("heading", { name: "Paprikaa Chilli Paneer" })).toBeInTheDocument();
    expect(screen.getByText("₹280")).toBeInTheDocument();
  });

  it("renders the dish name at a caller-chosen level", () => {
    render(<MenuItemRow name="Kulhad Chai" nameAs="h4" price={90} />);

    expect(screen.getByRole("heading", { level: 4, name: "Kulhad Chai" })).toBeInTheDocument();
  });

  it("prints the pre-discount price struck through beside the live one", () => {
    render(<MenuItemRow name="Masala Fries" price={190} was={240} />);

    expect(screen.getByText("₹190")).toBeInTheDocument();
    expect(screen.getByText("₹240").tagName).toBe("S");
  });

  it("marks the dish vegetarian by default and turmeric when it contains egg", () => {
    const { rerender } = render(<MenuItemRow name="Masala Fries" price={190} />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();

    rerender(<MenuItemRow diet="egg" name="Chocolate Brownie" price={160} />);
    expect(screen.getByRole("img", { name: "Contains egg" })).toBeInTheDocument();
  });

  it("names the heat rather than leaving colour to carry it", () => {
    render(<MenuItemRow name="Paprikaa Chilli Paneer" price={280} spice={3} />);

    expect(screen.getByRole("img", { name: "Spice level: Hot" })).toBeInTheDocument();
  });

  it("renders no spice scale when the dish carries no heat", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);

    expect(screen.queryByRole("img", { name: /Spice level/ })).not.toBeInTheDocument();
  });

  it("tags the Devanagari name so assistive tech switches voice", () => {
    render(<MenuItemRow name="Paprikaa Chilli Paneer" nameDevanagari="पनीर" price={280} />);

    expect(screen.getByText("पनीर")).toHaveAttribute("lang", "hi");
  });

  it("shows the badge when one is given", () => {
    render(<MenuItemRow badge="Bestseller" name="Paprikaa Chilli Paneer" price={280} />);

    expect(screen.getByText("Bestseller")).toBeInTheDocument();
  });

  it("folds the dish name into the Add button's accessible name", async () => {
    const handleAdd = vi.fn();
    render(<MenuItemRow name="Masala Fries" onAdd={handleAdd} price={190} />);

    await userEvent.click(screen.getByRole("button", { name: "Add Masala Fries" }));

    expect(handleAdd).toHaveBeenCalledOnce();
  });

  it("renders no Add button when the row cannot take an order", () => {
    render(<MenuItemRow name="Masala Fries" price={190} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lets a custom action replace the default Add button", () => {
    render(
      <MenuItemRow
        action={<button type="button">Remove One</button>}
        name="Masala Fries"
        onAdd={vi.fn()}
        price={190}
      />
    );

    expect(screen.getByRole("button", { name: "Remove One" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Masala Fries" })).not.toBeInTheDocument();
  });

  it("renders the labelled placeholder until a photograph exists", () => {
    render(<MenuItemRow name="Masala Fries" price={190} />);

    expect(screen.getByText("Dish photo 1:1")).toBeInTheDocument();
  });

  it("renders the photograph with its alt text once one is supplied", () => {
    render(
      <MenuItemRow
        image="/menu/masala-fries.jpg"
        imageAlt="Masala fries in a paper cone"
        name="Masala Fries"
        price={190}
      />
    );

    expect(screen.getByRole("img", { name: "Masala fries in a paper cone" })).toBeInTheDocument();
  });

  it("separates rows with a hairline unless the divider is turned off", () => {
    const { container, rerender } = render(<MenuItemRow name="Masala Fries" price={190} />);
    expect(container.firstElementChild).toHaveClass("border-b");

    rerender(<MenuItemRow hasDivider={false} name="Masala Fries" price={190} />);
    expect(container.firstElementChild).not.toHaveClass("border-b");
  });

  it("merges a caller className", () => {
    const { container } = render(<MenuItemRow className="py-2" name="Masala Fries" price={190} />);

    expect(container.firstElementChild).toHaveClass("py-2");
    expect(container.firstElementChild).not.toHaveClass("py-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MenuItemRow
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        onAdd={vi.fn()}
        price={280}
        spice={3}
        was={320}
      />
    );
    await expectNoA11yViolations(container);
  });
});
