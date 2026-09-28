import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { Plus } from "lucide-react";
import { expect } from "storybook/test";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { MenuItemCard } from "./menu-item-card";

/**
 * One card at the design system's 210px. A story decorator, not a `meta` one: Storybook
 * concatenates story and meta decorators (`decorators: []` on a story removes nothing), so a
 * meta-level width would squeeze the grid stories too.
 */
const cardWidth: Decorator = (Story) => (
  <div className="w-52.5">
    <Story />
  </div>
);

const addAction = (name: string) => (
  <IconButton
    icon={Plus}
    label={`Add ${name}`}
    variant="primary"
    size="lg"
    className="shadow-brand"
  />
);

const meta = {
  title: "Molecules/MenuItemCard",
  component: MenuItemCard,
  args: {
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
    action: addAction("Masala Cold Brew"),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Dish card for grids and horizontal rails — the website\'s "Most Ordered" and the app home. A 4:3 image on top with an overlapping floating `+` (pink, `shadow-brand`), then DietMark + name + price. Every dish is vegetarian (no `diet` prop). Give it `href` and the name becomes a link covering the card, which then lifts −2px on hover; the action stays its own button.',
      },
    },
  },
} satisfies Meta<typeof MenuItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { decorators: [cardWidth] };

/** Card row "variants": badge + add, discount + add, no action. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3.5">
      <div className="w-52.5">
        <MenuItemCard
          name="Masala Cold Brew"
          price={220}
          spice={1}
          badge="New"
          description="Cold brew, jaggery, cardamom."
          action={addAction("Masala Cold Brew")}
        />
      </div>
      <div className="w-52.5">
        <MenuItemCard
          name="Masala Fries"
          price={190}
          was={240}
          spice={4}
          description="Masala fries, amchur, curry-leaf salt."
          action={addAction("Masala Fries")}
        />
      </div>
      <div className="w-52.5">
        <MenuItemCard
          name="Kulhad Chai"
          price={90}
          spice={1}
          description="Assam leaf, ginger, clay cup."
        />
      </div>
    </div>
  ),
};

/** `href`: the whole card is a link to the dish; the add button stays separate. */
export const AsLink: Story = {
  args: { href: "#masala-cold-brew" },
  decorators: [cardWidth],
  // Real layout: a tap on the description lands on the stretched link; a tap on the floating
  // button lands on the button, above the link's overlay (z-raised).
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Masala Cold Brew" });
    const add = canvas.getByRole("button", { name: "Add Masala Cold Brew" });
    const at = (element: Element) => {
      const box = element.getBoundingClientRect();
      return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    };
    await expect(at(canvas.getByText("Cold brew, jaggery, cardamom."))).toBe(link);
    await expect(add.contains(at(add))).toBe(true);
  },
};

/** Keyboard: when the stretched link has focus the ring goes round the whole card it covers. */
export const KeyboardFocus: Story = {
  args: { href: "#masala-cold-brew" },
  decorators: [cardWidth],
  play: async ({ canvas, userEvent }) => {
    const card = canvas.getByRole("article");
    const ringOf = () => getComputedStyle(card).outlineStyle;
    await expect(ringOf()).toBe("none");
    // The floating Add button comes first; it rings itself, not the card.
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Add Masala Cold Brew" })).toHaveFocus();
    await expect(ringOf()).toBe("none");
    await userEvent.tab();
    const link = canvas.getByRole("link", { name: "Masala Cold Brew" });
    await expect(link).toHaveFocus();
    await expect(ringOf()).toBe("solid");
    // One ring, not two: the name drops its own.
    await expect(getComputedStyle(link).outlineStyle).toBe("none");
  },
};

/** Uneven descriptions still line up: the price row is pinned to the bottom of every card. */
export const InAGrid: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MenuItemCard
        name="Paprikaa Chilli Paneer"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche, house pickle."
        href="#paprikaa-chilli-paneer"
        action={addAction("Paprikaa Chilli Paneer")}
      />
      <MenuItemCard
        name="Kulhad Chai"
        price={90}
        description="Assam leaf, ginger."
        href="#kulhad-chai"
        action={addAction("Kulhad Chai")}
      />
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        description="Cold brew, jaggery, cardamom."
        href="#masala-cold-brew"
        action={addAction("Masala Cold Brew")}
      />
      <MenuItemCard
        name="Masala Fries"
        price={190}
        was={240}
        spice={4}
        description="Masala fries, amchur, curry-leaf salt."
        href="#masala-fries"
        action={addAction("Masala Fries")}
      />
    </div>
  ),
};

/** 360px: a long dish name wraps inside the card instead of pushing the price out of it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  args: {
    name: "Paprikaa Chilli Paneer With Burnt Garlic",
    price: 280,
    was: 320,
    badge: "Bestseller",
    href: "#paprikaa-chilli-paneer",
    action: addAction("Paprikaa Chilli Paneer With Burnt Garlic"),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};
