import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Pencil } from "lucide-react";
import { type ReactNode, useState } from "react";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { ringClippers } from "../../lib/story-ring";
import { OnSurfaces } from "../../lib/story-surfaces";
import { VIEWPORT_360 } from "../story-fixtures";
import { CartPanel } from "./cart-panel";
import { type CartLine, cartTotals } from "./cart-totals";

const FILLED: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 2,
    note: "Sharing - Hot",
  },
  { id: "cold-brew", name: "Masala Cold Brew", price: 220, quantity: 1, note: "Regular" },
  { id: "kulfi", name: "Gulkand Kulfi", price: 180, quantity: 1, note: "Regular" },
];

const ONE: CartLine[] = [
  {
    id: "chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 1,
    note: "Regular · Hot",
  },
];

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-165 w-90 max-w-full flex-col overflow-hidden rounded-lg border border-border-subtle">
      {children}
    </div>
  );
}

function LiveCart({
  initial,
  title = "Your order",
  meta = "Pickup · Sector 57 · 12 min",
}: {
  initial: CartLine[];
  title?: string | undefined;
  meta?: string | undefined;
}) {
  const [lines, setLines] = useState(initial);
  const totals = cartTotals(lines);
  return (
    <CartPanel
      lines={lines}
      title={title}
      meta={meta}
      onQuantityChange={(id, quantity) => {
        setLines((current) =>
          quantity <= 0
            ? current.filter((line) => line.id !== id)
            : current.map((line) => (line.id === id ? { ...line, quantity } : line))
        );
      }}
      noteField={
        <Input
          aria-label="Notes for the kitchen"
          placeholder="Any notes for the kitchen?"
          icon={Pencil}
        />
      }
      placeAction={
        <Button type="button" size="lg" isFullWidth iconAfter={ArrowRight}>
          {`Pay ${formatRupees(totals.total)}`}
        </Button>
      }
      browseAction={
        <Button asChild>
          <a href="#menu">Browse the Menu</a>
        </Button>
      }
      note="Inclusive of all taxes."
    />
  );
}

const meta = {
  title: "Organisms/CartPanel",
  component: CartPanel,
  args: {
    lines: FILLED,
    title: "Your order",
    meta: "Pickup · Sector 57 · 12 min",
  },
  decorators: [
    (Story) => (
      <Frame>
        <Story />
      </Frame>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The whole cart: line items with a stepper, a kitchen-note field, PriceSummary totals, and a pay bar that stays outside the scroll. Quantity 0 removes the line. An empty cart is its own EmptyState.",
      },
    },
  },
} satisfies Meta<typeof CartPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The panel and the phone frame both clip (`overflow-hidden` / `overflow-y-auto`), so padding
 * must hold every stepper and field ring whole.
 */
const proveRingsWhole: Story["play"] = async ({ canvas, userEvent }) => {
  const first = canvas.getAllByRole("button", { name: "Remove one" })[0];
  if (first === undefined) throw new Error("CartPanel: expected a stepper.");
  await userEvent.tab();
  await expect(first).toHaveFocus();
  await expect(ringClippers(first)).toEqual([]);
  const note = canvas.queryByRole("textbox", { name: "Notes for the kitchen" });
  if (note) {
    note.focus();
    await expect(note).toHaveFocus();
    const box = note.parentElement;
    if (!(box instanceof HTMLElement)) throw new Error("CartPanel: note field has no box.");
    await expect(ringClippers(box)).toEqual([]);
  }
};

export const Playground: Story = {
  render: (args) => (
    <LiveCart
      initial={args.lines}
      title={typeof args.title === "string" ? args.title : "Your order"}
      meta={typeof args.meta === "string" ? args.meta : undefined}
    />
  ),
  play: proveRingsWhole,
};

/** Card row: a filled pickup cart. Adding one Masala Cold Brew pays ₹1,239. */
export const Filled: Story = {
  render: () => <LiveCart initial={FILLED} />,
  play: async (context) => {
    await proveRingsWhole(context);
    const addButtons = context.canvas.getAllByRole("button", { name: "Add one" });
    const addColdBrew = addButtons[1];
    if (addColdBrew === undefined) throw new Error("CartPanel: expected the Cold Brew stepper.");
    await context.userEvent.click(addColdBrew);
    await expect(context.canvas.getByRole("button", { name: "Pay ₹1,239" })).toBeVisible();
  },
};

/** Card row: nothing in the cart yet. */
export const Empty: Story = {
  args: { lines: [] },
  render: () => <LiveCart initial={[]} />,
};

export const OneLine: Story = {
  render: () => <LiveCart initial={ONE} />,
  play: async (context) => {
    await proveRingsWhole(context);
    await context.userEvent.click(context.canvas.getByRole("button", { name: "Remove one" }));
    await expect(context.canvas.getByRole("heading", { name: "Nothing here yet." })).toHaveFocus();
  },
};

export const DineIn: Story = {
  render: () => <LiveCart initial={FILLED} meta="Dine-in · Sector 57" />,
  play: proveRingsWhole,
};

export const Mobile: Story = {
  globals: VIEWPORT_360,
  parameters: { layout: "fullscreen" },
  render: () => <LiveCart initial={FILLED} />,
  play: proveRingsWhole,
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  decorators: [(Story) => <Story />],
  render: () => (
    <OnSurfaces>
      {(ground) => (
        <div className="w-80">
          <LiveCart initial={ONE} title={`Your order · ${ground}`} />
        </div>
      )}
    </OnSurfaces>
  ),
};
