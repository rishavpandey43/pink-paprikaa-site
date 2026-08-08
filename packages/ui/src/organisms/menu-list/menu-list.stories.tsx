import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
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
  {
    name: "Masala Cold Brew",
    price: 220,
    category: "Chai & Coffee",
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
  },
  {
    name: "Kulhad Chai",
    price: 90,
    category: "Chai & Coffee",
    description: "Assam leaf, ginger, clay cup.",
  },
  {
    name: "Bombay Toastie",
    price: 240,
    spice: 2,
    category: "All Day",
    description: "Green chutney, potato, coal-grilled.",
  },
  {
    name: "Gulkand Kulfi",
    price: 180,
    category: "Sweets",
    description: "Rose petal preserve, pistachio, saffron.",
  },
];

const meta = {
  title: "Organisms/MenuList",
  component: MenuList,
  args: {
    items: MENU,
    overline: "The Menu",
    title: "Most ordered this week",
    onAdd: () => undefined,
  },
  argTypes: { onAdd: { control: false }, onCategoryChange: { control: false } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The whole menu section — header, category filters and the dishes. Reach for this " +
          "rather than assembling cards by hand, so the pills, the empty state and the list stay " +
          "wired to one another. Categories derive from each dish's `category`; `grid` is the " +
          "website, `list` is the app.",
      },
    },
  },
} satisfies Meta<typeof MenuList>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Four dishes as cards, the rest as rows under the section break. */
export const Default: Story = {};

/** The website shape, with a way out of the section in the header. */
export const WithAction: Story = {
  args: {
    action: (
      <Button iconAfter={ArrowRight} size="sm" variant="ghost">
        See Full Menu
      </Button>
    ),
  },
};

/** The app pattern: rows only, no cards, and no section break. */
export const ListVariant: Story = {
  args: { variant: "list" },
};

/** Filters with no header at all — for a page whose heading already sits above the section. */
export const WithoutHeader: Story = {
  render: ({ items, onAdd }) => <MenuList items={items} onAdd={onAdd} variant="list" />,
};

/** Everything in the grid: the overflow list and its section break disappear. */
export const GridOnly: Story = {
  args: { gridCount: 6 },
};

/** Two cards and a long overflow list — the shape a big menu takes. */
export const SmallGrid: Story = {
  args: { gridCount: 2 },
};

/** Opening on a category rather than on All. */
export const PreselectedCategory: Story = {
  args: { defaultCategory: "Chai & Coffee" },
};

/** No dish matched, so the section says what to do next instead of going blank. */
export const Empty: Story = {
  args: { categories: ["Breakfast"], lede: "Breakfast lands in the new year." },
};

/** A lede under the heading, for a section that needs one sentence of setup. */
export const WithLede: Story = {
  args: { lede: "Everything is cooked to order, so the kitchen asks for fifteen minutes." },
};

/** At 360px the grid folds to one column, the pills wrap, and the rows keep their thumbnails. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" } },
};
