import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import { Button } from "../../atoms/button/button";
import { type CartLine, CartPanel, type CartPanelProps } from "./cart-panel";

const LINES: CartLine[] = [
  { name: "Paprikaa Chilli Paneer", price: 280, quantity: 2, note: "Sharing · Hot" },
  { name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { name: "Gulkand Kulfi", price: 180, quantity: 1, diet: "egg", note: "Regular" },
];

const ONE_LINE: CartLine[] = [
  { name: "Paprikaa Chilli Paneer", price: 280, quantity: 1, note: "Regular · Hot" },
];

const meta = {
  title: "Organisms/CartPanel",
  component: CartPanel,
  args: { lines: LINES },
  argTypes: {
    container: { control: false },
    lines: { control: false },
    trigger: { control: false },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The cart, whole — a Radix Dialog side sheet with its own line items, a note for the " +
          "kitchen, the totals and a pay bar that never scrolls away. Stepping a line to zero is " +
          "what removes it, and an empty cart renders its own empty state rather than a bare list.",
      },
    },
  },
} satisfies Meta<typeof CartPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Opened from the floating cart button — the shape a real screen uses. */
export const Default: Story = {
  args: {
    trigger: (
      <Button icon={ShoppingBag} size="lg">
        Cart · 4
      </Button>
    ),
  },
  render: (args) => (
    <div className="grid min-h-100 place-items-center p-8">
      <CartPanel {...args} />
    </div>
  ),
};

/**
 * The sheet inside a phone frame: `position="container"` plus the same element as `container`. Both
 * are needed; one without the other misplaces it.
 */
function FramedCart(args: CartPanelProps) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);

  return (
    <div
      className="relative h-165 w-90 overflow-hidden rounded-4 border border-border-subtle bg-surface-page-alt"
      ref={setFrame}
    >
      <CartPanel {...args} container={frame} isDefaultOpen position="container" />
    </div>
  );
}

/** Three lines, a kitchen note and the totals — everything scrolls except the pay bar. */
export const Filled: Story = {
  render: (args) => (
    <div className="p-6">
      <FramedCart {...args} lines={LINES} />
    </div>
  ),
};

/** Nothing in it yet. One action, never two, and never an apology. */
export const Empty: Story = {
  render: (args) => (
    <div className="p-6">
      <FramedCart {...args} lines={[]} />
    </div>
  ),
};

/** A single line, so the summary and the pay bar can be read against a short list. */
export const OneLine: Story = {
  render: (args) => (
    <div className="p-6">
      <FramedCart {...args} lines={ONE_LINE} />
    </div>
  ),
};

/** Dine-in swaps the fulfilment line; everything else is the same sheet. */
export const DineIn: Story = {
  render: (args) => (
    <div className="p-6">
      <FramedCart {...args} lines={LINES} meta="Dine-in · Table 4 · Sector 57" />
    </div>
  ),
};

/** The smallest supported viewport — the sheet runs full width and nothing truncates badly. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { isDefaultOpen: true },
};
