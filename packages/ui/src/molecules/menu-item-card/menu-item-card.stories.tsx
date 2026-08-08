import type { Meta, StoryObj } from "@storybook/react-vite";

import { MenuItemCard } from "./menu-item-card";

const meta = {
  title: "Molecules/MenuItemCard",
  component: MenuItemCard,
  args: {
    name: "Masala Cold Brew",
    price: 220,
    description: "Cold brew, jaggery, cardamom.",
    spice: 1,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The dish card for grids and rails. A 4:3 photograph with the floating pink add button " +
          "overlapping its edge, then the diet mark, name and price. Pass `href` and the whole " +
          "card becomes one real link that lifts −2px on hover.",
      },
    },
  },
} satisfies Meta<typeof MenuItemCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-56">
      <MenuItemCard {...args} />
    </div>
  ),
};

/** The three shapes side by side: badged, discounted, and a card that cannot take an order. */
export const Variants: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
      <MenuItemCard
        {...args}
        badge="New"
        href="/menu/masala-cold-brew"
        name="Masala Cold Brew"
        onAdd={() => undefined}
        price={220}
        spice={1}
      />
      <MenuItemCard
        {...args}
        description="Masala fries, amchur, curry-leaf salt."
        href="/menu/masala-fries"
        name="Masala Fries"
        onAdd={() => undefined}
        price={190}
        spice={4}
        was={240}
      />
      <MenuItemCard
        {...args}
        description="Assam leaf, ginger, clay cup."
        href="/menu/kulhad-chai"
        name="Kulhad Chai"
        price={90}
        spice={1}
      />
    </div>
  ),
};

/** `egg` is the turmeric mark on the few bakes that contain egg. There is no non-veg mark. */
export const DietMarks: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
      <MenuItemCard {...args} diet="veg" name="Paprikaa Chilli Paneer" price={280} spice={3} />
      <MenuItemCard
        {...args}
        description="Dark chocolate, sea salt, warm from the oven."
        diet="egg"
        name="Chocolate Brownie"
        price={160}
        spice={undefined}
      />
    </div>
  ),
};

/** Uneven descriptions still line up: the price row is pinned to the bottom of every card. */
export const InAGrid: Story = {
  render: (args) => (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
      <MenuItemCard
        {...args}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche, house pickle."
        href="/menu/paprikaa-chilli-paneer"
        name="Paprikaa Chilli Paneer"
        onAdd={() => undefined}
        price={280}
        spice={3}
      />
      <MenuItemCard
        {...args}
        description="Assam leaf, ginger."
        href="/menu/kulhad-chai"
        name="Kulhad Chai"
        onAdd={() => undefined}
        price={90}
        spice={1}
      />
      <MenuItemCard
        {...args}
        description="Cold brew, jaggery, cardamom."
        href="/menu/masala-cold-brew"
        name="Masala Cold Brew"
        onAdd={() => undefined}
        price={220}
        spice={1}
      />
      <MenuItemCard
        {...args}
        description="Masala fries, amchur, curry-leaf salt."
        href="/menu/masala-fries"
        name="Masala Fries"
        onAdd={() => undefined}
        price={190}
        spice={4}
        was={240}
      />
    </div>
  ),
};

/** A long dish name wraps inside the card instead of pushing the price out of it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="w-full max-w-80">
      <MenuItemCard
        {...args}
        badge="Bestseller"
        href="/menu/paprikaa-chilli-paneer"
        name="Paprikaa Chilli Paneer With Burnt Garlic"
        onAdd={() => undefined}
        price={280}
        was={320}
      />
    </div>
  ),
};
