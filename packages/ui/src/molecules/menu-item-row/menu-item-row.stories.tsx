import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { MenuItemRow } from "./menu-item-row";

/** The dish is folded into the name, so a menu is not a list of controls all called "Add". */
const addButton = (name: string) => (
  <Button size="sm" variant="secondary" icon={Plus} aria-label={`Add ${name}`}>
    Add
  </Button>
);

const meta = {
  title: "Molecules/MenuItemRow",
  component: MenuItemRow,
  args: {
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
    action: addButton("Paprikaa Chilli Paneer"),
  },
  decorators: [
    (Story) => (
      <div className="w-190 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The menu list row — no card, just a `border-subtle` hairline between items. Every dish is vegetarian, so the DietMark always shows (there is no `diet` prop). Omit `image` and a labelled light-pink placeholder appears — no supplied photography exists yet. `action` takes the Add button (or a QuantityStepper); the row never owns cart state. Use `MenuItemCard` for grids and rails instead.",
      },
    },
  },
} satisfies Meta<typeof MenuItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "full": badge, heat, description and the Add button. */
export const Full: Story = {};

/** Card row "discount": `was` strikes the old price. */
export const Discount: Story = {
  args: {
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
    action: addButton("Mushroom Keema Pav"),
    badge: undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Bestseller")).toBeNull();
  },
};

/** Card row "devanagari" (the design system's egg variant is not built — spec C10). */
export const Devanagari: Story = {
  args: {
    name: "Gulkand Kulfi",
    nameDevanagari: "कुल्फी",
    price: 180,
    spice: 1,
    description: "Rose petal preserve, pistachio, saffron.",
    action: addButton("Gulkand Kulfi"),
    badge: undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Bestseller")).toBeNull();
  },
};

/** Card row "minimal": `hasDivider={false}`, no action. */
export const Minimal: Story = {
  args: {
    name: "Kulhad Chai",
    price: 90,
    hasDivider: false,
    action: undefined,
    badge: undefined,
    spice: undefined,
    description: undefined,
  },
  // The card's minimal row is the name, the price and the photo: no meta leaks in from the defaults.
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Bestseller")).toBeNull();
    await expect(canvas.queryByRole("img", { name: /Spice level/ })).toBeNull();
    await expect(canvas.queryByText(/Amritsari paneer/)).toBeNull();
    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

/** A real section: one hairline between rows, and the last row drops its rule. */
export const AsAMenuSection: Story = {
  render: () => (
    <div>
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        action={addButton("Paprikaa Chilli Paneer")}
      />
      <MenuItemRow
        name="Masala Fries"
        price={190}
        was={240}
        spice={4}
        description="Masala fries, amchur, curry-leaf salt."
        action={addButton("Masala Fries")}
      />
      <MenuItemRow
        name="Kulhad Chai"
        price={90}
        description="Assam leaf, ginger, clay cup."
        action={addButton("Kulhad Chai")}
        hasDivider={false}
      />
    </div>
  ),
};

/** The four heat steps, each named ("Spice level 2 of 4") rather than left to colour. */
export const SpiceLevels: Story = {
  render: () => (
    <div>
      <MenuItemRow name="Steamed Momos" price={150} spice={1} />
      <MenuItemRow name="Honey Chilli Potato" price={220} spice={2} />
      <MenuItemRow name="Paprikaa Chilli Paneer" price={280} spice={3} />
      <MenuItemRow name="Masala Fries" price={190} spice={4} hasDivider={false} />
    </div>
  ),
};

/** Once the dish is in the cart the page swaps the action; the row never owns cart state. */
export const InCart: Story = {
  args: {
    action: (
      // Named with the dish, like the Add button: a menu of "In cart · 2" controls says nothing.
      <Button size="sm" variant="ghost" aria-label="Paprikaa Chilli Paneer in cart, 2">
        In cart · 2
      </Button>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Paprikaa Chilli Paneer in cart, 2" })
    ).toBeVisible();
  },
};

/** 360px: the thumbnail steps down to 80px and a long name wraps instead of widening the row. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  args: {
    name: "Paprikaa Chilli Paneer With Burnt Garlic",
    nameDevanagari: "पनीर",
    was: 320,
    hasDivider: false,
  },
  decorators: [
    (Story) => (
      <div className="w-90 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const row = canvas.getByRole("article");
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <MenuItemRow {...args} hasDivider={false} />
      </div>
    </OnSurfaces>
  ),
};
