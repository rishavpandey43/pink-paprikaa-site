import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuList, type MenuListItem } from "./menu-list";

const MENU: MenuListItem[] = [
  {
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
  },
  {
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
  },
  { name: "Masala Cold Brew", price: 220, category: "Chai & Coffee", badge: "New" },
  { name: "Kulhad Chai", price: 90, category: "Chai & Coffee" },
  { name: "Bombay Toastie", price: 240, category: "All Day" },
  { name: "Gulkand Kulfi", price: 180, category: "Sweets" },
];

/** `MenuItemCard` and `MenuItemRow` hold different crops, so the placeholders count each. */
const CARD_PLACEHOLDER = "Dish photo 4:3";
const ROW_PLACEHOLDER = "Dish photo 1:1";

describe("MenuList", () => {
  it("renders the section header when a title is given", () => {
    render(<MenuList items={MENU} overline="The Menu" title="Most ordered this week" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Most ordered this week" })
    ).toBeInTheDocument();
    expect(screen.getByText("The Menu")).toBeInTheDocument();
  });

  it("renders no header at all when the title is left off", () => {
    render(<MenuList items={MENU} />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
  });

  it("derives one pill per category, behind All", () => {
    render(<MenuList items={MENU} />);
    const group = screen.getByRole("group", { name: "Filter the menu by category" });
    expect(group).toBeInTheDocument();
    for (const label of ["All", "Small Plates", "Chai & Coffee", "All Day", "Sweets"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("pins the kitchen's standing statement after the pills", () => {
    render(<MenuList items={MENU} />);
    expect(screen.getByText("100% Vegetarian Kitchen")).toBeInTheDocument();
  });

  it("shows the first four dishes as cards and the rest as rows", () => {
    render(<MenuList items={MENU} />);
    expect(screen.getAllByText(CARD_PLACEHOLDER)).toHaveLength(4);
    expect(screen.getAllByText(ROW_PLACEHOLDER)).toHaveLength(2);
    expect(screen.getByText("Also On The Menu")).toBeInTheDocument();
  });

  it("honours a caller's grid count", () => {
    render(<MenuList gridCount={2} items={MENU} />);
    expect(screen.getAllByText(CARD_PLACEHOLDER)).toHaveLength(2);
    expect(screen.getAllByText(ROW_PLACEHOLDER)).toHaveLength(4);
  });

  it("renders rows only in the list variant", () => {
    render(<MenuList items={MENU} variant="list" />);
    expect(screen.queryByText(CARD_PLACEHOLDER)).not.toBeInTheDocument();
    expect(screen.getAllByText(ROW_PLACEHOLDER)).toHaveLength(MENU.length);
    expect(screen.queryByText("Also On The Menu")).not.toBeInTheDocument();
  });

  it("drops the overflow divider when every dish fits in the grid", () => {
    render(<MenuList gridCount={10} items={MENU} />);
    expect(screen.queryByText("Also On The Menu")).not.toBeInTheDocument();
  });

  it("filters the dishes when a category pill is pressed", async () => {
    render(<MenuList items={MENU} />);
    expect(screen.getByRole("heading", { name: "Kulhad Chai" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Sweets" }));

    expect(screen.getByRole("heading", { name: "Gulkand Kulfi" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kulhad Chai" })).not.toBeInTheDocument();
  });

  it("marks the selected pill as pressed", async () => {
    render(<MenuList items={MENU} />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "Sweets" }));

    expect(screen.getByRole("button", { name: "Sweets" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
  });

  it("opens on the caller's default category", () => {
    render(<MenuList defaultCategory="Sweets" items={MENU} />);
    expect(screen.getByRole("heading", { name: "Gulkand Kulfi" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kulhad Chai" })).not.toBeInTheDocument();
  });

  it("stays on the controlled category and reports the pill that was pressed", async () => {
    const handleChange = vi.fn();
    render(<MenuList category="Sweets" items={MENU} onCategoryChange={handleChange} />);

    await userEvent.click(screen.getByRole("button", { name: "All Day" }));

    expect(handleChange).toHaveBeenCalledWith("All Day");
    expect(screen.getByRole("heading", { name: "Gulkand Kulfi" })).toBeInTheDocument();
  });

  it("calls onAdd with the dish behind the control", async () => {
    const handleAdd = vi.fn();
    render(<MenuList items={MENU} onAdd={handleAdd} />);

    await userEvent.click(screen.getByRole("button", { name: "Add Paprikaa Chilli Paneer" }));

    expect(handleAdd).toHaveBeenCalledWith(MENU[0]);
  });

  it("draws no Add control when there is nothing to call", () => {
    render(<MenuList items={MENU} />);
    expect(screen.queryByRole("button", { name: /^Add / })).not.toBeInTheDocument();
  });

  it("says what to do next when nothing matches", () => {
    render(<MenuList categories={["Breakfast"]} items={MENU} />);
    expect(screen.getByText("Nothing matches that yet.")).toBeInTheDocument();
    expect(screen.getByText("Try another category.")).toBeInTheDocument();
  });

  it("auto-fits the grid so one long dish name cannot widen the row at 360px", () => {
    const { container } = render(<MenuList items={MENU} />);
    expect(
      container.querySelector(
        ".grid-cols-\\[repeat\\(auto-fit\\,minmax\\(min\\(260px\\,100\\%\\)\\,1fr\\)\\)\\]"
      )
    ).toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(<MenuList className="bg-surface-page-alt" items={MENU} />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MenuList items={MENU} onAdd={vi.fn()} title="Most ordered this week" />
    );
    await expectNoA11yViolations(container);
  });
});
