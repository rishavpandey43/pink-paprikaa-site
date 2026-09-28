import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, spyOn } from "storybook/test";

import { cssValue, stepUtilities, utilitiesOf } from "../../docs-kit/catalogue";
import { requireElement } from "../../docs-kit/dom";
import { RadiusScale } from "../../docs-kit/radius-scale";
import { ShadowLadder } from "../../docs-kit/shadow-ladder";
import { SpacingScale } from "../../docs-kit/spacing-scale";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Spacing pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Spacing/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every step of the scale in order. Deferred (fold list item 6): the compile-time check against
 * the layouts' `StackProps["space"]` returns with Stack (Plan 2c).
 */
const SPACE_STEPS = [
  0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32,
] as const;

const RHYTHM_TOKENS = [
  "spacing-gutter",
  "spacing-gutter-mobile",
  "spacing-gutter-desktop",
  "spacing-section",
  "spacing-section-mobile",
  "spacing-section-desktop",
  "spacing-grid-gap",
];

const CHROME_TOKENS = [
  "spacing-header",
  "spacing-header-compact",
  "spacing-tabbar",
  "spacing-dock-clearance",
  "spacing-hit",
];

const DEPTH_LADDER = ["shadow-1", "shadow-2", "shadow-3", "shadow-4", "shadow-brand"];

/** R56: a chip copies exactly its class, and says so in the scope's status line. */
async function expectChipCopies(
  canvas: { getByRole: (role: "button", options: { name: string }) => HTMLElement },
  click: (element: HTMLElement) => Promise<void>,
  utility: string
) {
  const write = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
  await click(canvas.getByRole("button", { name: utility }));
  await expect(write).toHaveBeenLastCalledWith(utility);
  write.mockRestore();
}

export const Scale: Story = {
  render: () => <SpacingScale steps={SPACE_STEPS} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Design-system rule: step N is N × 4px, so step 6 is always 24px.
    const unit = Number.parseFloat(cssValue("spacing"));
    await expect(unit).toBe(4);
    const six = requireElement(canvasElement, '[data-step="6"]');
    await expect(six.getBoundingClientRect().width).toBe(24);
    // R56: step 3's margin-top chip copies `mt-3`.
    const marginTop = stepUtilities(3).find((utility) => utility.startsWith("mt-"));
    if (marginTop === undefined) throw new Error("step 3 has no mt- utility");
    await expectChipCopies(canvas, (element) => userEvent.click(element), marginTop);
  },
};

// Deferred (fold list item 3): `Rhythm` — a Section with an AutoGrid of Cards (Plan 2c T5/T6).

export const RhythmTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Containers" selection={{ prefix: "container-" }} />
      <TokenTable
        caption="Gutters, section rhythm and grid gap"
        selection={{ names: RHYTHM_TOKENS }}
      />
    </div>
  ),
};

export const ChromeTokens: Story = {
  render: () => (
    <TokenTable caption="Fixed chrome and the touch target" selection={{ names: CHROME_TOKENS }} />
  ),
};

/** R56/R61: component sizes list the utility each is used as — `size-icon-sm`, not `p-icon-sm`. */
export const ComponentSizes: Story = {
  render: () => (
    <TokenTable
      caption="Component sizes and measures"
      selection={{ prefix: "spacing-", tier: "component" }}
    />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "size-icon-sm" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "p-icon-sm" })).toBeNull();
  },
};

export const Radii: Story = { render: () => <RadiusScale /> };

export const BorderWidths: Story = {
  render: () => <TokenTable caption="Border widths" selection={{ prefix: "border-width-" }} />,
  // R56: the strong width's numeric chip copies `border-2`.
  play: async ({ canvas, userEvent }) => {
    const numeric = utilitiesOf("border-width-strong").at(-1);
    if (numeric === undefined) throw new Error("border-width-strong has no utility");
    await expect(numeric).toBe("border-2");
    await expectChipCopies(canvas, (element) => userEvent.click(element), numeric);
  },
};

export const Elevation: Story = { render: () => <ShadowLadder names={DEPTH_LADDER} /> };

export const Stacking: Story = {
  render: () => <TokenTable caption="Stacking order" selection={{ prefix: "z-" }} />,
};
