import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../atoms/button/button";
import { MenuItemRow } from "./menu-item-row";

const meta = {
  title: "Molecules/MenuItemRow",
  component: MenuItemRow,
  args: {
    name: "Paprikaa Chilli Paneer",
    price: 280,
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
    spice: 3,
  },
  argTypes: { action: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "The menu list row. Not a card — one hairline between items, so the eye reads the " +
          "column of dish names. Always pass `diet`; leave `image` off and the labelled " +
          "placeholder holds the space until real photography exists.",
      },
    },
  },
} satisfies Meta<typeof MenuItemRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A real section: rows stack, and the last one drops its rule. */
export const AsAMenuSection: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="max-w-160">
      <MenuItemRow
        {...args}
        badge="Bestseller"
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        onAdd={() => undefined}
        price={280}
        spice={3}
      />
      <MenuItemRow
        {...args}
        description="Masala fries, amchur, curry-leaf salt."
        name="Masala Fries"
        onAdd={() => undefined}
        price={190}
        spice={4}
        was={240}
      />
      <MenuItemRow
        {...args}
        description="Assam leaf, ginger, clay cup."
        hasDivider={false}
        name="Kulhad Chai"
        onAdd={() => undefined}
        price={90}
        spice={undefined}
      />
    </div>
  ),
};

/** The Devanagari name sits beside the Latin one, tagged `lang="hi"` so it is spoken, not spelled. */
export const WithDevanagariName: Story = {
  args: { nameDevanagari: "पनीर", badge: "Bestseller" },
};

/** Discounts print the live price first and the old one struck through after it. */
export const Discounted: Story = {
  args: { name: "Masala Fries", price: 190, was: 240, spice: 4 },
};

/** The four heat steps, named rather than left to colour. */
export const SpiceLevels: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="max-w-160">
      <MenuItemRow {...args} name="Kulhad Chai" price={90} spice={1} />
      <MenuItemRow {...args} name="Paneer Tikka" price={260} spice={2} />
      <MenuItemRow {...args} name="Paprikaa Chilli Paneer" price={280} spice={3} />
      <MenuItemRow {...args} hasDivider={false} name="Masala Fries" price={190} spice={4} />
    </div>
  ),
};

/** `egg` is the turmeric mark on the few bakes that contain egg. There is no non-veg mark. */
export const DietMarks: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="max-w-160">
      <MenuItemRow {...args} diet="veg" name="Paprikaa Chilli Paneer" price={280} />
      <MenuItemRow
        {...args}
        description="Dark chocolate, sea salt, warm from the oven."
        diet="egg"
        hasDivider={false}
        name="Chocolate Brownie"
        price={160}
        spice={undefined}
      />
    </div>
  ),
};

/** An `action` replaces the default Add button once the dish is already in the cart. */
export const WithCustomAction: Story = {
  args: {
    action: (
      <Button size="sm" variant="ghost">
        In Cart · 2
      </Button>
    ),
  },
};

/** Everything the row has to survive at the smallest supported width. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="max-w-80">
      <MenuItemRow
        {...args}
        badge="Bestseller"
        hasDivider={false}
        name="Paprikaa Chilli Paneer With Burnt Garlic"
        nameDevanagari="पनीर"
        onAdd={() => undefined}
        price={280}
        was={320}
      />
    </div>
  ),
};
