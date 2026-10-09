import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import type { LinkAsProps } from "../../lib/link-as";
import { MenuList, type MenuListItem } from "./menu-list";

const MENU: MenuListItem[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
  },
  {
    id: "keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
  },
  {
    id: "cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
  },
  { id: "kulhad-chai", name: "Kulhad Chai", price: 90, spice: 1, category: "Chai & Coffee" },
  { id: "toastie", name: "Bombay Toastie", price: 240, spice: 2, category: "All Day" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, spice: 1, category: "Sweets" },
];

/** FilterBar is a Radix ToggleGroup: single-select options are radios. */
const option = (name: string) => screen.getByRole("radio", { name });

const namesIn = (element: HTMLElement) =>
  within(element)
    .getAllByRole("article")
    .map((article) => within(article).getByRole("heading").textContent);

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="">
      {children}
    </a>
  );
}

describe("MenuList", () => {
  it("heads the section with overline, a level-2 title and the action", () => {
    render(
      <MenuList
        items={MENU}
        overline="The Menu"
        title="Most ordered this week"
        action={<a href="#menu">See Full Menu</a>}
      />
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Most ordered this week" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See Full Menu" })).toBeInTheDocument();
  });

  it("renders the lede under the heading", () => {
    render(
      <MenuList
        items={MENU}
        title="Most ordered this week"
        lede="Cooked to order in one pure-veg kitchen."
      />
    );
    expect(screen.getByText("Cooked to order in one pure-veg kitchen.")).toBeInTheDocument();
  });

  it("renders only the filters when there is no title", () => {
    render(<MenuList items={MENU} variant="list" />);
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Filter the menu" })).toBeInTheDocument();
  });

  it("offers All first, then every category in the order the dishes bring them", () => {
    render(<MenuList items={MENU} />);
    const names = within(screen.getByRole("radiogroup"))
      .getAllByRole("radio")
      .map((radio) => radio.textContent);
    expect(names).toEqual(["All", "Small Plates", "Chai & Coffee", "All Day", "Sweets"]);
    expect(option("All")).toHaveAttribute("aria-checked", "true");
  });

  it("follows an explicit category list for order and subset", () => {
    render(<MenuList items={MENU} categories={["Sweets", "Small Plates"]} />);
    const names = within(screen.getByRole("radiogroup"))
      .getAllByRole("radio")
      .map((radio) => radio.textContent);
    expect(names).toEqual(["All", "Sweets", "Small Plates"]);
  });

  it("pins the note beside the filters", () => {
    render(<MenuList items={MENU} note="100% Vegetarian" />);
    expect(screen.getByText("100% Vegetarian")).toBeInTheDocument();
  });

  it("shows the first gridCount dishes as cards and the rest as rows under the overflow label", () => {
    const { container } = render(
      <MenuList items={MENU} gridCount={4} overflowLabel="Also on the menu" />
    );
    expect(
      container.querySelector("ul.autogrid-min-card")?.querySelectorAll("article")
    ).toHaveLength(4);
    expect(screen.getAllByRole("article")).toHaveLength(MENU.length);
    expect(screen.getByText("Also on the menu")).toBeInTheDocument();
  });

  it("honours a smaller gridCount and drops the overflow when every dish fits", () => {
    const { container, rerender } = render(
      <MenuList items={MENU} gridCount={2} overflowLabel="Also on the menu" />
    );
    expect(
      container.querySelector("ul.autogrid-min-card")?.querySelectorAll("article")
    ).toHaveLength(2);
    rerender(<MenuList items={MENU} gridCount={10} overflowLabel="Also on the menu" />);
    expect(
      container.querySelector("ul.autogrid-min-card")?.querySelectorAll("article")
    ).toHaveLength(MENU.length);
    expect(screen.queryByText("Also on the menu")).not.toBeInTheDocument();
  });

  it("shows every dish as a row in the list variant", () => {
    const { container } = render(<MenuList items={MENU} variant="list" />);
    expect(screen.getAllByRole("article")).toHaveLength(MENU.length);
    expect(container.querySelector("ul.autogrid-min-card")).toBeNull();
    expect(screen.queryByText("Also on the menu")).not.toBeInTheDocument();
  });

  it("keeps list semantics on the cards and the rows", () => {
    render(<MenuList items={MENU} gridCount={2} />);
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(2);
    const [cards, rows] = lists;
    if (cards === undefined || rows === undefined) {
      throw new Error("MenuList must render two lists: cards then rows.");
    }
    for (const list of lists) expect(list).toHaveAttribute("role", "list");
    expect(within(cards).getAllByRole("listitem")).toHaveLength(2);
    expect(within(rows).getAllByRole("listitem")).toHaveLength(MENU.length - 2);
  });

  it("filters to a category by pointer and by keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<MenuList items={MENU} variant="list" />);
    await user.click(option("Chai & Coffee"));
    expect(namesIn(container)).toEqual(["Masala Cold Brew", "Kulhad Chai"]);

    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");
    expect(option("All Day")).toHaveAttribute("aria-checked", "true");
    expect(namesIn(container)).toEqual(["Bombay Toastie"]);
  });

  it("opens on defaultCategory", () => {
    const { container } = render(<MenuList items={MENU} variant="list" defaultCategory="Sweets" />);
    expect(option("Sweets")).toHaveAttribute("aria-checked", "true");
    expect(namesIn(container)).toEqual(["Gulkand Kulfi"]);
  });

  it("falls back to All when defaultCategory is not on offer", () => {
    const { container } = render(<MenuList items={MENU} variant="list" defaultCategory="Thalis" />);
    expect(option("All")).toHaveAttribute("aria-checked", "true");
    expect(namesIn(container)).toHaveLength(MENU.length);
  });

  it("keeps the current category when the chosen option is pressed again", async () => {
    const user = userEvent.setup();
    const { container } = render(<MenuList items={MENU} variant="list" />);
    await user.click(option("Sweets"));
    await user.click(option("Sweets"));
    expect(namesIn(container)).toEqual(["Gulkand Kulfi"]);
  });

  it("puts each dish's action from renderItemAction on its card or row", () => {
    render(
      <MenuList
        items={MENU}
        renderItemAction={(item) => <button type="button">{`Add ${item.name}`}</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Add Paprikaa Chilli Paneer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Gulkand Kulfi" })).toBeInTheDocument();
  });

  it("links cards through linkAs with getItemHref", () => {
    render(
      <MenuList items={MENU} getItemHref={(item) => `#dish-${item.id}`} linkAs={RouterLink} />
    );
    const link = screen
      .getAllByRole("link")
      .find((candidate) => candidate.getAttribute("href") === "#dish-chilli-paneer");
    expect(link).toHaveAttribute("data-router-link");
  });

  it("shows the default empty state for a category with no dishes", async () => {
    const user = userEvent.setup();
    render(<MenuList items={MENU} categories={["Small Plates", "Thalis"]} />);
    await user.click(option("Thalis"));
    expect(screen.getByText("Nothing matches that yet.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("renders no wrapper for an empty emptyState and no header for an empty title", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <MenuList items={MENU} title="" categories={["Small Plates", "Thalis"]} emptyState="" />
    );
    expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    await user.click(option("Thalis"));
    // The filter's own box holds the FilterBar and nothing else.
    const filterBox = () => screen.getByRole("radiogroup").parentElement?.parentElement;
    expect(filterBox()?.children).toHaveLength(1);
    // React prints 0, so a 0 slot keeps its wrapper — a truthiness gate would drop it.
    rerender(<MenuList items={MENU} categories={["Small Plates", "Thalis"]} emptyState={0} />);
    expect(filterBox()?.children).toHaveLength(2);
  });

  it("merges a caller className", () => {
    const { container } = render(<MenuList items={MENU} className="bg-surface-page-alt" />);
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <MenuList
        items={MENU}
        overline="The Menu"
        title="Most ordered this week"
        note="100% Vegetarian"
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <MenuList items={MENU} title="Menu" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
