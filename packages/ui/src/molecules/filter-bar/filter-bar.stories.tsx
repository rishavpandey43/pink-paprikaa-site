import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clock, Flame, Leaf, Search } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { FilterBar } from "./filter-bar";

const WEBSITE = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "chai-coffee", label: "Chai & Coffee" },
  { value: "sweets", label: "Sweets" },
];

const meta = {
  title: "Molecules/FilterBar",
  component: FilterBar,
  args: { label: "Menu category", options: WEBSITE, note: "100% Vegetarian", isWrapping: true },
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
          "Menu category rail on both the website and the app. Scrolls horizontally by default (the app pattern); pass `isWrapping` for the website. Exactly one option is selected at a time — pressing the chosen filter keeps it. Radix ToggleGroup items styled with the Tag skin; arrow keys move, Space/Enter choose.",
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The overflow ancestors of `element` whose padding box cuts its focus outline. */
function ringClippers(element: HTMLElement) {
  const style = getComputedStyle(element);
  const reach = Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset);
  // Scroll extents are whole pixels, so a child scrolled fully into view can sit a fraction past.
  const box = element.getBoundingClientRect();
  const slack = 1;
  const clippers: HTMLElement[] = [];
  for (let node = element.parentElement; node !== null; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const frame = node.getBoundingClientRect();
    const left = frame.left + node.clientLeft;
    const top = frame.top + node.clientTop;
    if (
      box.left - reach < left - slack ||
      box.top - reach < top - slack ||
      box.right + reach > left + node.clientWidth + slack ||
      box.bottom + reach > top + node.clientHeight + slack
    ) {
      clippers.push(node);
    }
  }
  return clippers;
}

export const Playground: Story = {};

/** Card row "wrap" — the website, with the statement badge. */
export const Wrap: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Sweets" }));
    await expect(canvas.getByRole("radio", { name: "Sweets" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowLeft} ");
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** Card row "scroll" — the app rail, one line. */
export const Scroll: Story = {
  args: {
    isWrapping: false,
    note: undefined,
    options: [...WEBSITE, { value: "bar", label: "Bar" }],
  },
  decorators: [
    (Story) => (
      <div className="w-90 max-w-full">
        <Story />
      </div>
    ),
  ],
  // The rail is a scroll container, so a chip's focus ring is clipped like any other paint: the
  // first chip's and, scrolled to the end, the last chip's ring must both stay whole.
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    const first = canvas.getByRole("radio", { name: "All" });
    await expect(first).toHaveFocus();
    await expect(first.matches(":focus-visible")).toBe(true);
    await expect(ringClippers(first)).toEqual([]);
    await userEvent.keyboard("{End}");
    const last = canvas.getByRole("radio", { name: "Bar" });
    await expect(last).toHaveFocus();
    await expect(ringClippers(last)).toEqual([]);
  },
};

/** Card row "icons". */
export const Icons: Story = {
  args: {
    label: "Dietary and speed filters",
    note: undefined,
    defaultValue: "jain",
    options: [
      { value: "jain", label: "Jain", icon: Leaf },
      { value: "spicy", label: "Hot", icon: Flame },
      { value: "quick", label: "Under 15 min", icon: Clock },
    ],
  },
};

/** `trailing`: a control pinned to the end of the rail, never squeezed by it. */
export const WithTrailing: Story = {
  args: {
    trailing: (
      <Button size="sm" variant="ghost" icon={Search}>
        Search
      </Button>
    ),
  },
};

/** 360px, scrolling: the filters scroll under a pinned statement badge and trailing control. */
export const ScrollPinned: Story = {
  args: {
    isWrapping: false,
    options: [...WEBSITE, { value: "bar", label: "Bar" }],
    trailing: (
      <Button size="sm" variant="ghost" icon={Search}>
        Search
      </Button>
    ),
  },
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    const group = canvas.getByRole("radiogroup");
    const root = group.parentElement;
    await expect(root).toBeInstanceOf(HTMLElement);
    if (root === null) return;
    await expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
    const edge = root.getBoundingClientRect().right;
    await expect(
      canvas.getByText("100% Vegetarian").getBoundingClientRect().right
    ).toBeLessThanOrEqual(edge);
    await expect(
      canvas.getByRole("button", { name: "Search" }).getBoundingClientRect().right
    ).toBeLessThanOrEqual(edge);
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <FilterBar {...args} />
      </div>
    </OnSurfaces>
  ),
};
