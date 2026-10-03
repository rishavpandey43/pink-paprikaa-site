import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, Plus } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { ringClippers } from "../../lib/story-ring";
import { EmptyState } from "../../molecules/empty-state/empty-state";
import { VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { MenuList, type MenuListItem } from "./menu-list";

/** The design system card's dishes (the chilli paneer's sides reworded: no mayo or brioche). */
const MENU: MenuListItem[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli chutney, spring onion.",
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

/**
 * Tab through every stop — the header's action, the filter (then arrow across each chip), each
 * dish's action — and keep each focus ring whole.
 */
const proveRingsWhole: NonNullable<Story["play"]> = async ({
  canvas,
  canvasElement,
  userEvent,
}) => {
  const radios = canvas.getAllByRole("radio");
  const headerActions = canvas.queryAllByRole("link", { name: "See Full Menu" });
  const stops = headerActions.length + 1 + canvas.getAllByRole("button", { name: /^Add / }).length;
  const seen = new Set<Element>();
  for (let step = 0; step < stops; step += 1) {
    await userEvent.tab();
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || seen.has(active)) break;
    seen.add(active);
    await expect(canvasElement).toContainElement(active);
    await expect(ringClippers(active)).toEqual([]);
    if (active === radios[0]) {
      for (const radio of radios.slice(1)) {
        await userEvent.keyboard("{ArrowRight}");
        await expect(radio).toHaveFocus();
        await expect(ringClippers(radio)).toEqual([]);
      }
    }
  }
  await expect(seen.size).toBe(stops);
};

export const Playground: Story = {};

/** Card row: `variant="grid"` (website). */
export const GridWebsite: Story = { play: proveRingsWhole };

/** Card row: `variant="list"` (app), no section header. */
export const ListApp: Story = { args: { variant: "list", title: null }, play: proveRingsWhole };

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

/** The smallest page: the chips wrap inside the 16px gutter and every ring stays whole. */
export const Mobile: Story = { globals: VIEWPORT_360, play: proveRingsWhole };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
