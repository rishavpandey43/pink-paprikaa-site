import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Tag } from "../../atoms/tag/tag";
import { GAP_CLASS } from "../../lib/space";
import { Cluster } from "./cluster";

const ACTIONS = ["Order Now", "See Menu", "Find Us", "Book a Table", "Franchise"];
const CATEGORIES = [
  "All",
  "Small Plates",
  "All Day",
  "Chai & Coffee",
  "Sweets",
  "Bar",
  "Breakfast",
];

/** styles.css base layer: `:focus-visible { outline: 2px; outline-offset: 2px }` reaches 4px out. */
const FOCUS_RING_REACH = 4;
/** Layout lands on sub-pixels; half a pixel is rounding, not a clipped ring. */
const SUBPIXEL = 0.5;

const meta = {
  title: "Layouts/Cluster",
  component: Cluster,
  args: {
    space: 3,
    align: "center",
    justify: "start",
    isNowrap: false,
    isScrollable: false,
    children: ACTIONS.map((label) => (
      <Button key={label} size="sm" variant="secondary">
        {label}
      </Button>
    )),
  },
  argTypes: { space: { control: "select", options: Object.keys(GAP_CLASS).map(Number) } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Any horizontal run of small things: buttons, tags, badges, meta. `space` is the step number, N × 4px. Wraps by default so a row can never clip. Pass `isScrollable` for the app category rail: it scrolls instead of wrapping, is a keyboard tab stop (name it with `role="group"` + `aria-label`; pass `tabIndex={-1}` when every item is focusable) and keeps room for focus rings.',
      },
    },
  },
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Wrap: Story = { name: "wrap (default)" };

export const JustifyBetween: Story = {
  name: 'justify="between"',
  args: {
    justify: "between",
    children: [
      <Tag key="all">All</Tag>,
      <Tag key="sweets" isSelected>
        Sweets
      </Tag>,
    ],
  },
};

export const Scroll: Story = {
  name: "isScrollable (app rail)",
  render: () => (
    <Cluster isScrollable role="group" aria-label="Categories">
      {CATEGORIES.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </Cluster>
  ),
};

export const WrapAt360: Story = {
  name: "360px — wraps onto new lines, never clips",
  globals: { viewport: { value: "floor360", isRotated: false } },
};

/** Every `justify` value on one short row (dev parity). */
export const Justify: Story = {
  name: "justify",
  render: () => (
    <div className="grid gap-4">
      {(["start", "center", "end", "between"] as const).map((justify) => (
        <Cluster key={justify} justify={justify}>
          <Tag>{`justify="${justify}"`}</Tag>
          <Tag>Sweets</Tag>
        </Cluster>
      ))}
    </div>
  ),
};

/** The step scale on a row: 4px · 8px · 12px (the default) · 24px (dev parity). */
export const Spacing: Story = {
  name: "space — 1 · 2 · 3 · 6",
  render: () => (
    <div className="grid gap-4">
      {([1, 2, 3, 6] as const).map((space) => (
        <Cluster key={space} space={space}>
          <Tag>{`space={${String(space)}}`}</Tag>
          <Tag>Momos</Tag>
          <Tag>Sweets</Tag>
        </Cluster>
      ))}
    </div>
  ),
};

/** A menu meta row: `align="baseline"` keeps the small note on the dish name's line (dev parity). */
export const BaselineMetaRow: Story = {
  name: 'align="baseline" · a menu meta row',
  render: () => (
    <div className="max-w-90">
      <Cluster align="baseline" justify="between">
        <span className="font-display text-h4 text-text-heading">Paprikaa Chilli Paneer</span>
        <span className="font-body text-body-sm text-text-muted">Serves 2</span>
      </Cluster>
    </div>
  ),
};

/**
 * Review Focus 3: the rail scrolls, Tab reaches it (so the keyboard can scroll it), and a focused
 * item keeps its whole ring — at rest, and at the far end once the rail is scrolled there.
 *
 * Chromium does not focus-scroll an item that is partly in view by 32px or more (its "minimum
 * intersect for reveal"), so Tab alone can leave the last item half outside the rail whatever the
 * CSS; probed with real Playwright key presses. The far-end check therefore scrolls the rail to its
 * end, as a keyboard user does on the focused rail, and measures the ring room its padding leaves.
 */
export const ScrollableRailAt360: Story = {
  name: "360px — rail keyboard reach and focus-ring room",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Cluster isScrollable role="group" aria-label="Categories">
      {CATEGORIES.map((label) => (
        <Button key={label} size="sm" variant="secondary">
          {label}
        </Button>
      ))}
    </Cluster>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rail = canvas.getByRole("group", { name: "Categories" });
    const buttons = canvas.getAllByRole("button");
    const first = buttons[0];
    const last = buttons.at(-1);
    if (first === undefined || last === undefined) throw new Error("the rail needs buttons");
    const room = (item: HTMLElement) => {
      const outer = rail.getBoundingClientRect();
      const inner = item.getBoundingClientRect();
      return {
        top: inner.top - outer.top,
        bottom: outer.bottom - inner.bottom,
        start: inner.left - outer.left,
        end: outer.right - inner.right,
      };
    };
    const minimum = FOCUS_RING_REACH - SUBPIXEL;

    await expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
    await userEvent.tab();
    await expect(rail).toHaveFocus();

    await userEvent.tab();
    await expect(first).toHaveFocus();
    const atStart = room(first);
    await expect(atStart.top).toBeGreaterThanOrEqual(minimum);
    await expect(atStart.bottom).toBeGreaterThanOrEqual(minimum);
    await expect(atStart.start).toBeGreaterThanOrEqual(minimum);

    for (let step = 1; step < buttons.length; step += 1) {
      await userEvent.tab();
    }
    await expect(last).toHaveFocus();
    rail.scrollLeft = rail.scrollWidth;
    await expect(room(last).end).toBeGreaterThanOrEqual(minimum);
  },
};
