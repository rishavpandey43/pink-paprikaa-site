### Task 14: MenuList

**Dev reference:** `git show dev:packages/ui/src/organisms/menu-list/menu-list.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                      | Ruling         | Where / clause                                                                                                                             |
| ----------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Section header when titled                                                    | ALREADY        | test "heads the section with overline, a level-2 title and the action"                                                                     |
| No header at all without a title                                              | ALREADY        | test "renders only the filters when there is no title"                                                                                     |
| One pill per category, behind "All"                                           | ALREADY        | test "offers All first…"                                                                                                                   |
| The note pinned beside the pills                                              | ADD            | test "pins the note beside the filters" (its default copy: DROP, D9)                                                                       |
| First four dishes as cards, the rest as rows                                  | ALREADY        | test "shows the first gridCount dishes as cards…"                                                                                          |
| A caller's smaller `gridCount`                                                | ADD            | test "honours a smaller gridCount and drops the overflow…"                                                                                 |
| Rows only in `list`                                                           | ALREADY        | test "shows every dish as a row in the list variant"                                                                                       |
| No overflow divider when every dish fits                                      | ADD            | same new test (`gridCount={10}`)                                                                                                           |
| Filtering by pill; the chosen pill marked                                     | ALREADY        | tests "filters to a category…", "offers All first…" (`aria-checked`)                                                                       |
| `defaultCategory`                                                             | ADD            | contract delta 6 (R110): a string seeding the client leaf, All when not on offer; tests "opens on defaultCategory", "falls back to All…"   |
| Controlled `category` + `onCategoryChange`                                    | DROP           | D6 — the filter is a client leaf under a server organism, which cannot pass it a function (Contract deviations); contract §7 lists neither |
| `onAdd`; no Add control without it                                            | DROP / ALREADY | spec §9.2 — the `action` slot replaces `onAdd`: `renderItemAction` (tested); none given, no action                                         |
| Empty-state copy built in                                                     | DROP           | D9 — `emptyState` slot (tested)                                                                                                            |
| Auto-fit grid survives 360px                                                  | ALREADY        | `autogrid`                                                                                                                                 |
| Merges a caller `className`                                                   | ADD            | test "merges a caller className"                                                                                                           |
| axe                                                                           | ALREADY        | test "has no accessibility violations"                                                                                                     |
| `lede` under the heading                                                      | ADD            | contract delta 7 (R110): to SectionHeader; test "renders the lede under the heading"                                                       |
| `diet` per dish                                                               | DROP           | C10                                                                                                                                        |
| `href` per dish                                                               | ALREADY        | `getItemHref`                                                                                                                              |
| Stories Default · WithAction · ListVariant · WithoutHeader · Empty · Smallest | ALREADY        | GridWebsite · Playground (`action` arg) · ListApp · ListApp · EmptyCategory · Mobile                                                       |
| Stories GridOnly · SmallGrid                                                  | ADD            | `GridOnly`, `SmallGrid`                                                                                                                    |
| Stories PreselectedCategory · WithLede                                        | ADD            | `PreselectedCategory` · `WithLede` (contract deltas 6, 7)                                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/ui/src/organisms/menu-list/menu-list.tsx`, `menu-list-filter.tsx` (client leaf), `menu-list.test.tsx`, `menu-list.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Divider`, `SectionHeader`, `MenuItemCard`, `MenuItemRow`/`MenuItemImage`, `FilterBar`/`FilterOption`, `LinkAs`, `componentVariants`, `HeadingLevel`; the `autogrid` utility (the card's 240px minimum snaps to 260, spec §15.2); stories: `Button`, `EmptyState`, `IconButton`.
- Produces: `MenuList`, `MenuListProps`, `MenuListItem`. The filter leaf is internal.

The server organism renders one panel per filter option (All + each category) — cards for the first `gridCount` dishes and rows for the rest — calling `renderItemAction` and `getItemHref` on the server. The client leaf holds only the chosen option and shows that option's panel. No component tokens: rhythm `section-y`, width `container-page`, grid `autogrid`.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/organisms/menu-list/menu-list.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
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
    expect(container.querySelector("ul.autogrid")?.querySelectorAll("article")).toHaveLength(4);
    expect(screen.getAllByRole("article")).toHaveLength(MENU.length);
    expect(screen.getByText("Also on the menu")).toBeInTheDocument();
  });

  it("honours a smaller gridCount and drops the overflow when every dish fits", () => {
    const { container, rerender } = render(
      <MenuList items={MENU} gridCount={2} overflowLabel="Also on the menu" />
    );
    expect(container.querySelector("ul.autogrid")?.querySelectorAll("article")).toHaveLength(2);
    rerender(<MenuList items={MENU} gridCount={10} overflowLabel="Also on the menu" />);
    expect(container.querySelector("ul.autogrid")?.querySelectorAll("article")).toHaveLength(
      MENU.length
    );
    expect(screen.queryByText("Also on the menu")).not.toBeInTheDocument();
  });

  it("shows every dish as a row in the list variant", () => {
    const { container } = render(<MenuList items={MENU} variant="list" />);
    expect(screen.getAllByRole("article")).toHaveLength(MENU.length);
    expect(container.querySelector("ul.autogrid")).toBeNull();
    expect(screen.queryByText("Also on the menu")).not.toBeInTheDocument();
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

  it("shows the empty state for a category with no dishes", async () => {
    const user = userEvent.setup();
    render(
      <MenuList
        items={MENU}
        categories={["Small Plates", "Thalis"]}
        emptyState={<p>Nothing matches that yet.</p>}
      />
    );
    await user.click(option("Thalis"));
    expect(screen.getByText("Nothing matches that yet.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
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
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-list 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./menu-list`.

- [ ] **Step 3: Implement the filter leaf**

`packages/ui/src/organisms/menu-list/menu-list-filter.tsx`:

```tsx
"use client";

import { type ReactNode, useState } from "react";

import { FilterBar, type FilterOption } from "../../molecules/filter-bar/filter-bar";

export interface MenuListPanel {
  value: string;
  /** The dishes for this option, rendered by the server organism. */
  content: ReactNode;
}

export interface MenuListFilterProps {
  label: string;
  options: FilterOption[];
  /** The option chosen on arrival; one of `options`. */
  defaultValue: string;
  panels: MenuListPanel[];
  note?: ReactNode;
  className?: string | undefined;
}

/**
 * MenuList's client corner: it holds the chosen option and shows that option's pre-rendered
 * panel. (FilterBar already ignores Radix's `""` when the chosen option is pressed again.)
 */
export function MenuListFilter({
  label,
  options,
  defaultValue,
  panels,
  note,
  className,
}: MenuListFilterProps) {
  const [value, setValue] = useState(defaultValue);
  const panel = panels.find((candidate) => candidate.value === value);
  return (
    <div className={className}>
      <FilterBar
        label={label}
        options={options}
        value={value}
        onValueChange={setValue}
        isWrapping
        note={note}
      />
      {panel?.content}
    </div>
  );
}
```

- [ ] **Step 4: Implement the organism**

`packages/ui/src/organisms/menu-list/menu-list.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { HeadingLevel } from "../../lib/heading";
import type { LinkAs } from "../../lib/link-as";

import { Divider } from "../../atoms/divider/divider";
import { componentVariants } from "../../lib/component-variants";
import { MenuItemCard } from "../../molecules/menu-item-card/menu-item-card";
import { type MenuItemImage, MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { SectionHeader } from "../../molecules/section-header/section-header";
import { MenuListFilter } from "./menu-list-filter";

export interface MenuListItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  badge?: string | undefined;
  was?: number | undefined;
  image?: MenuItemImage | undefined;
  /** Placeholder label while the photo is missing. */
  imageLabel?: string | undefined;
}

/** How many dishes show as cards before the grid variant hands over to rows (design system). */
const DEFAULT_GRID_COUNT = 4;

/** Dish headings sit one level below the section title. */
const CHILD_LEVEL: Readonly<Record<HeadingLevel, HeadingLevel>> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 6,
};

const menuList = componentVariants({
  slots: {
    root: "section-y",
    inner: "container-page",
    filter: "flex flex-col",
    cards: "mt-8 autogrid",
    card: "flex",
    cardBody: "flex-1",
    overflow: "",
    rows: "",
    empty: "mt-6",
  },
  variants: {
    variant: {
      grid: { overflow: "mt-12", rows: "mt-2" },
      list: { overflow: "mt-5" },
    },
    hasHeader: { true: { filter: "mt-7" } },
  },
  defaultVariants: { variant: "grid", hasHeader: true },
});

/** A dish's display props — the list's own fields (id, category) stay out of the card's DOM. */
function dishOf({ id: _id, category: _category, ...dish }: MenuListItem) {
  return dish;
}

export interface MenuListProps extends Omit<ComponentProps<"section">, "title"> {
  items: MenuListItem[];
  /** Filter order and subset; defaults to every category in the dishes, in order. "All" is always first. */
  categories?: string[] | undefined;
  allLabel?: string | undefined;
  /** The category chosen on arrival; "All" when omitted or not on offer. */
  defaultCategory?: string | undefined;
  /** Accessible name of the filter group. */
  filterLabel?: string | undefined;
  overline?: ReactNode;
  /** Omit (or pass null) for filters with no section header — the app pattern. */
  title?: ReactNode | null | undefined;
  /** One sentence under the heading (shown only with a `title`). */
  lede?: ReactNode;
  action?: ReactNode;
  /** `grid` = cards then an overflow list (website) · `list` = rows only (app). */
  variant?: "grid" | "list" | undefined;
  /** How many dishes show as cards before rows take over. */
  gridCount?: number | undefined;
  /** Statement badge in the filter bar, e.g. "100% Vegetarian". */
  note?: ReactNode;
  /** Divider label above the overflow rows, e.g. "Also on the menu". */
  overflowLabel?: string | undefined;
  /** Shown for a category with no dishes. */
  emptyState?: ReactNode;
  /** Runs on the server with the organism: the dish's add/order control. */
  renderItemAction?: ((item: MenuListItem) => ReactNode) | undefined;
  /** Runs on the server with the organism: makes each card a link. */
  getItemHref?: ((item: MenuListItem) => string) | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The filterable menu section — use it rather than assembling cards by hand. Every dish is
 * rendered on the server, once per filter option; only the chosen option is client state.
 */
export function MenuList({
  items,
  categories,
  allLabel = "All",
  defaultCategory,
  filterLabel = "Filter the menu",
  overline,
  title,
  lede,
  action,
  variant = "grid",
  gridCount = DEFAULT_GRID_COUNT,
  note,
  overflowLabel,
  emptyState,
  renderItemAction,
  getItemHref,
  linkAs = "a",
  headingLevel = 2,
  className,
  ...props
}: MenuListProps) {
  const hasHeader = title !== undefined && title !== null;
  const slots = menuList({ variant, hasHeader });
  const itemLevel = CHILD_LEVEL[headingLevel];
  const categoryNames = (categories ?? [...new Set(items.map((item) => item.category))]).filter(
    (name) => name !== allLabel
  );
  const options = [allLabel, ...categoryNames].map((name) => ({ value: name, label: name }));
  const initial =
    defaultCategory !== undefined && categoryNames.includes(defaultCategory)
      ? defaultCategory
      : allLabel;

  const panelFor = (dishes: MenuListItem[]): ReactNode => {
    if (dishes.length === 0) {
      return emptyState ? <div className={slots.empty()}>{emptyState}</div> : null;
    }
    const cardDishes = variant === "grid" ? dishes.slice(0, gridCount) : [];
    const rowDishes = variant === "grid" ? dishes.slice(gridCount) : dishes;
    return (
      <>
        {cardDishes.length > 0 ? (
          <ul className={slots.cards()}>
            {cardDishes.map((item) => (
              <li key={item.id} className={slots.card()}>
                <MenuItemCard
                  {...dishOf(item)}
                  action={renderItemAction?.(item)}
                  href={getItemHref?.(item)}
                  linkAs={linkAs}
                  headingLevel={itemLevel}
                  className={slots.cardBody()}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {rowDishes.length > 0 ? (
          <div className={slots.overflow()}>
            {variant === "grid" ? <Divider label={overflowLabel} /> : null}
            <ul className={slots.rows()}>
              {rowDishes.map((item, index) => (
                <li key={item.id}>
                  <MenuItemRow
                    {...dishOf(item)}
                    action={renderItemAction?.(item)}
                    hasDivider={index < rowDishes.length - 1}
                    headingLevel={itemLevel}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </>
    );
  };

  const panels = options.map(({ value }) => ({
    value,
    content: panelFor(value === allLabel ? items : items.filter((item) => item.category === value)),
  }));

  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        {hasHeader ? (
          <SectionHeader
            overline={overline}
            title={title}
            lede={lede}
            action={action}
            headingLevel={headingLevel}
          />
        ) : null}
        <MenuListFilter
          label={filterLabel}
          options={options}
          panels={panels}
          defaultValue={initial}
          note={note}
          className={slots.filter()}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-list 2>&1 | tail -8`
Expected: PASS (18 tests). If the keyboard test fails because FilterBar's roving focus starts elsewhere, read `molecules/filter-bar/filter-bar.tsx` and adjust only the key sequence — the assertion (arrowing to the next option and pressing Space selects it) stays.

- [ ] **Step 6: Stories (card parity with `MenuList.card.html`)**

`packages/ui/src/organisms/menu-list/menu-list.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { MenuList, type MenuListItem } from "./menu-list";

/** The design system card's dishes. */
const MENU: MenuListItem[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
    imageLabel: "Dish photo",
  },
  {
    id: "keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
    imageLabel: "Dish photo",
  },
  {
    id: "cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
    imageLabel: "Dish photo",
  },
  {
    id: "kulhad-chai",
    name: "Kulhad Chai",
    price: 90,
    spice: 1,
    category: "Chai & Coffee",
    description: "Assam leaf, ginger, clay cup.",
    imageLabel: "Dish photo",
  },
  {
    id: "toastie",
    name: "Bombay Toastie",
    price: 240,
    spice: 2,
    category: "All Day",
    description: "Green chutney, potato, coal-grilled.",
    imageLabel: "Dish photo",
  },
  {
    id: "kulfi",
    name: "Gulkand Kulfi",
    price: 180,
    spice: 1,
    category: "Sweets",
    description: "Rose petal preserve, pistachio, saffron.",
    imageLabel: "Dish photo",
  },
];

const addAction = (item: MenuListItem) => (
  <IconButton icon={Plus} label={`Add ${item.name}`} variant="primary" size="sm" />
);

const meta = {
  title: "Organisms/MenuList",
  component: MenuList,
  args: {
    items: MENU,
    overline: "The Menu",
    title: "Most ordered this week",
    note: "100% Vegetarian",
    overflowLabel: "Also on the menu",
    gridCount: 4,
    renderItemAction: addAction,
    action: (
      <Button asChild variant="ghost" size="sm" iconAfter={ArrowRight}>
        <a href="#menu">See Full Menu</a>
      </Button>
    ),
    emptyState: (
      <EmptyState variant="symbol" title="Nothing matches that yet." body="Try another category." />
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The whole menu section, filters included — use this rather than assembling cards by hand. `variant="grid"` is the website (cards, then an overflow list); `variant="list"` is the app (rows only). Filters derive from each dish\'s category; "All" is always first. Every dish is server-rendered; only the chosen category is client state.',
      },
    },
  },
} satisfies Meta<typeof MenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `variant="grid"` (website). */
export const GridWebsite: Story = {};

/** Card row: `variant="list"` (app), no section header. */
export const ListApp: Story = { args: { variant: "list", title: null } };

/** Every dish in the grid: the overflow list and its divider disappear. */
export const GridOnly: Story = { args: { gridCount: 6 } };

/** Two cards and a long overflow list — the shape a big menu takes. */
export const SmallGrid: Story = { args: { gridCount: 2 } };

/** Filter by pointer: Chai & Coffee shows its two dishes. */
export const FilterByCategory: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Chai & Coffee" }));
    await expect(canvas.getAllByRole("article")).toHaveLength(2);
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** A page linked from "Chai & Coffee" opens on that category. */
export const PreselectedCategory: Story = {
  args: { defaultCategory: "Chai & Coffee" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await expect(canvas.getAllByRole("article")).toHaveLength(2);
  },
};

export const WithLede: Story = { args: { lede: "Cooked to order in one pure-veg kitchen." } };

/** A category with no dishes shows the empty state. */
export const EmptyCategory: Story = {
  args: { categories: ["Small Plates", "Thalis"] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Thalis" }));
    await expect(canvas.getByText("Nothing matches that yet.")).toBeVisible();
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { MenuList, type MenuListItem, type MenuListProps } from "./organisms/menu-list/menu-list";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/menu-list packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/ui/src/organisms/menu-list packages/ui/src/index.ts
git commit -m "feat(ui): add the MenuList organism

The filterable menu section: a section header, a FilterBar with All plus
each category, and per-category panels of cards and overflow rows (grid) or
rows only (list). Dishes, their actions and links render on the server; a
tiny client leaf holds only the chosen category.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

