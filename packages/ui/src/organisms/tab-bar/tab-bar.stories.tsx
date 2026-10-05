import type { Meta, StoryObj } from "@storybook/react-vite";

import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";

import { ringClippers } from "../../lib/story-ring";
import { StatesRow, type StoryForceState, storyStatesPseudo } from "../../lib/story-states";
import { VIEWPORT_360 } from "../story-fixtures";
import { TabBar, type TabBarItem } from "./tab-bar";

const TAB_STATES = ["rest", "hover", "focus"] as const satisfies readonly StoryForceState[];

const FOUR: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

const FIVE: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag },
  { value: "orders", label: "Orders", icon: Receipt },
  { value: "you", label: "You", icon: User },
];

/** A phone-width frame, as on the card; it shrinks to a narrower canvas. */
function Frame({ items, initial }: { items: TabBarItem[]; initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-97.5 max-w-full overflow-hidden rounded-lg border border-border-subtle">
      <TabBar items={items} value={value} onValueChange={setValue} />
    </div>
  );
}

/**
 * The tabs fill the bar edge to edge inside a clipping frame, so their rings are drawn inset: tab
 * to the first and the last and prove nothing cuts either.
 */
function proveEndRingsWhole(role: "button" | "link"): NonNullable<Story["play"]> {
  return async ({ canvas, userEvent }) => {
    const controls = canvas.getAllByRole(role);
    for (const [index, control] of controls.entries()) {
      await userEvent.tab();
      await expect(control).toHaveFocus();
      if (index === 0 || index === controls.length - 1) {
        await expect(control.matches(":focus-visible")).toBe(true);
        await expect(ringClippers(control)).toEqual([]);
      }
    }
  };
}

const meta = {
  title: "Organisms/TabBar",
  component: TabBar,
  args: { items: FOUR, value: "menu" },
  parameters: {
    docs: {
      description: {
        component:
          "The app's fixed bottom navigation — 64px, four or five destinations, never more. The active destination is pink with a bold label; counts render as a pink pill on the icon and are read with the label. Items with `href` are links (through `linkAs`); otherwise buttons that call `onValueChange`.",
      },
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** INTERACTIONS row: rest → hover → focus; press is `group-active` on the icon pill (see unit test). */
export const States: Story = {
  parameters: { pseudo: storyStatesPseudo(TAB_STATES) },
  render: () => (
    <StatesRow
      states={TAB_STATES}
      render={(state) => (
        <div className="w-24 overflow-hidden rounded-lg border border-border-subtle">
          <TabBar
            items={[{ value: "home", label: "Home", icon: House }]}
            value="home"
            label={`Primary, ${state}`}
          />
        </div>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const hover = canvasElement.querySelector("#cell-hover button");
    if (!(hover instanceof HTMLElement)) {
      throw new Error("TabBar States: #cell-hover button missing");
    }
    await expect(hover).toHaveClass("group");
    const pill = hover.querySelector(".h-7\\.5.w-14.rounded-pill");
    await expect(pill).toHaveClass("group-hover:bg-state-hover", "group-active:press-scale-icon");
  },
};

/** Card row: 4 tabs + count. */
export const FourTabsWithCount: Story = {
  render: () => <Frame items={FOUR} initial="menu" />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cart (2)" }));
    await expect(canvas.getByRole("button", { name: "Cart (2)" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await expect(canvas.getByRole("button", { name: "Menu" })).not.toHaveAttribute("aria-current");
  },
};

/** Card row: 5 tabs. */
export const FiveTabs: Story = {
  render: () => <Frame items={FIVE} initial="home" />,
  play: proveEndRingsWhole("button"),
};

export const AsLinks: Story = {
  args: { items: FOUR.map((item) => ({ ...item, href: `#${item.value}` })), value: "home" },
  render: (args) => (
    <div className="w-97.5 max-w-full overflow-hidden rounded-lg border border-border-subtle">
      <TabBar {...args} />
    </div>
  ),
  play: proveEndRingsWhole("link"),
};

/**
 * Each destination active in turn, for comparing the active treatment at a glance. Four bars are
 * four navigation landmarks, so each names itself — four called "Primary" could not be told apart.
 */
export const EachDestinationActive: Story = {
  render: () => (
    <div className="flex w-97.5 max-w-full flex-col gap-4">
      {FOUR.map((item) => (
        <div key={item.value} className="overflow-hidden rounded-lg border border-border-subtle">
          <TabBar items={FOUR} value={item.value} label={`Primary, ${item.label} in view`} />
        </div>
      ))}
    </div>
  ),
};

/** Five tabs across the smallest supported viewport (360px): nothing wraps. */
export const Mobile: Story = {
  globals: VIEWPORT_360,
  parameters: { layout: "fullscreen" },
  render: () => <TabBar items={FIVE} value="home" />,
  play: async (context) => {
    await expect(context.canvasElement.scrollWidth).toBeLessThanOrEqual(
      context.canvasElement.clientWidth
    );
    await proveEndRingsWhole("button")(context);
  },
};
