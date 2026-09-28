import type { Meta, StoryObj } from "@storybook/react-vite";

import { Croissant, IceCreamCone, Soup } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Icon } from "../../atoms/icon/icon";
import { groundOf } from "../../lib/story-paint";
import { OnSurfaces } from "../../lib/story-surfaces";
import { type TabItem, Tabs } from "./tabs";

function panel(text: string) {
  return <p className="m-0 text-body-sm text-text-muted">{text}</p>;
}

const MENU: TabItem[] = [
  { value: "all-day", label: "All Day", content: panel("All-day plates, 8am – 11:30pm.") },
  { value: "breakfast", label: "Breakfast", content: panel("Breakfast plates.") },
  { value: "bar", label: "Bar", content: panel("Chai, coffee and coolers.") },
  { value: "sweets", label: "Sweets", content: panel("Kulfi, halwa and bakes.") },
];

const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  args: { label: "Menu sections", items: MENU, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Tabs switch sections inside one page. `underline` (the design system): Poppins 700, a 3px pink bar under the active tab. `segmented` (the handoff's pill rail on This Week, Homely Meals and Catering): a white rail with a pink active pill, 44px tall. Arrow keys move between tabs and select as they go; Home/End jump. Every panel stays in the page (inactive ones hidden), so search engines index the whole menu. For filtering a list use FilterBar; for app-level navigation use TabBar.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "default". */
export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Breakfast" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("breakfast");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Bar" })).toHaveFocus();
    await expect(canvas.getByText("Chai, coffee and coolers.")).toBeVisible();
  },
};

/** Card row "two items". */
export const TwoItems: Story = {
  args: {
    label: "Feed",
    items: [
      { value: "feed", label: "Feed", content: panel("Posts.") },
      { value: "stories", label: "Stories", content: panel("Stories.") },
    ],
  },
};

/** Handoff This Week rail — `variant="segmented"`. */
export const Segmented: Story = {
  args: {
    label: "This week's menu",
    variant: "segmented",
    items: [
      { value: "classic", label: "Classic & Signature", content: panel("The classic week.") },
      { value: "everyday", label: "Everyday", content: panel("The everyday week.") },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Everyday" }));
    await expect(canvas.getByRole("tab", { name: "Everyday" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  },
};

/** Dev parity (R39): an inert section — shown, not selectable, skipped by the arrow keys. */
export const WithDisabledTab: Story = {
  args: {
    items: MENU.map((item) =>
      item.value === "bar" ? { ...item, label: "Bar (off today)", isDisabled: true } : item
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const bar = canvas.getByRole("tab", { name: "Bar (off today)" });
    await expect(bar).toBeDisabled();
    await userEvent.click(canvas.getByRole("tab", { name: "Breakfast" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Sweets" })).toHaveFocus();
  },
};

/** Dev parity (R39): `isFullWidth` shares the rail equally, e.g. across a card. */
export const FullWidth: Story = {
  args: {
    label: "This week's menu",
    variant: "segmented",
    isFullWidth: true,
    items: [
      { value: "classic", label: "Classic & Signature", content: panel("The classic week.") },
      { value: "everyday", label: "Everyday", content: panel("The everyday week.") },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-120">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const [classic, everyday] = canvas.getAllByRole("tab");
    await expect(classic?.getBoundingClientRect().width).toBe(
      everyday?.getBoundingClientRect().width
    );
  },
};

/** `isFullWidth` at 320px: a long label wraps inside its equal share instead of spilling out. */
export const FullWidthLongLabels: Story = {
  args: {
    label: "This week's menu",
    isFullWidth: true,
    items: [
      {
        value: "classic",
        label: "Classic & Signature thalis",
        content: panel("The classic week."),
      },
      { value: "everyday", label: "Everyday comfort plates", content: panel("The everyday week.") },
      { value: "festive", label: "Festive specials", content: panel("The festive week.") },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const list = canvas.getByRole("tablist");
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    for (const tab of canvas.getAllByRole("tab")) {
      await expect(tab.scrollWidth).toBeLessThanOrEqual(tab.clientWidth);
    }
  },
};

/** Dev parity: a glyph before each label — pass it inside the ReactNode `label`. */
export const WithIcons: Story = {
  args: {
    items: [
      {
        value: "all-day",
        label: (
          <>
            <Icon icon={Soup} size="sm" />
            All Day
          </>
        ),
        content: panel("All-day plates, 8am – 11:30pm."),
      },
      {
        value: "breakfast",
        label: (
          <>
            <Icon icon={Croissant} size="sm" />
            Breakfast
          </>
        ),
        content: panel("Breakfast plates."),
      },
      {
        value: "sweets",
        label: (
          <>
            <Icon icon={IceCreamCone} size="sm" />
            Sweets
          </>
        ),
        content: panel("Kulfi, halwa and bakes."),
      },
    ],
  },
};

/** Dev parity: the smallest supported width (320px of content) — the rail wraps, it never clips. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};

/** The underline rail on every field: the active bar turns white on pink (R89, spec §10.2). */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <Tabs {...args} className="min-w-0 flex-1" />
    </OnSurfaces>
  ),
  play: async ({ canvas }) => {
    const active = canvas.getAllByRole("tab", { selected: true });
    // One selected tab on each of the 5 grounds.
    await expect(active).toHaveLength(5);
    for (const tab of active) {
      await expect(getComputedStyle(tab, "::after").backgroundColor).not.toBe(groundOf(tab));
    }
  },
};
