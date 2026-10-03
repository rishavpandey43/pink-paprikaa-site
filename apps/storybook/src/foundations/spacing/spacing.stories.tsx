import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { AutoGrid, Card, Section, type StackProps } from "@pink-paprikaa-web/ui";

import { cssValue, stepUtilities } from "../../docs-kit/catalogue";
import { spyOnClipboard } from "../../docs-kit/clipboard";
import { requireElement } from "../../docs-kit/dom";
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

type SpaceStep = NonNullable<StackProps["space"]>;

/** Every step of the scale in order — checked against the layouts' `space` type in both directions. */
const SPACE_STEPS = [
  0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32,
] as const satisfies readonly SpaceStep[];

/** Compile-time: a step the system gains but this page does not show fails typecheck. */
const isEveryStepShown: [Exclude<SpaceStep, (typeof SPACE_STEPS)[number]>] extends [never]
  ? true
  : false = true;

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

/** R56: a chip copies exactly its class, and says so in the scope's status line. */
async function expectChipCopies(
  canvas: { getByRole: (role: "button", options: { name: string }) => HTMLElement },
  click: (element: HTMLElement) => Promise<void>,
  utility: string
) {
  await spyOnClipboard(async (write) => {
    await click(canvas.getByRole("button", { name: utility }));
    await expect(write).toHaveBeenLastCalledWith(utility);
  });
}

export const Scale: Story = {
  render: () => <SpacingScale steps={SPACE_STEPS} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // The check is the type above; referencing it keeps the constant (and so the check) alive.
    void isEveryStepShown;
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

export const Rhythm: Story = {
  render: () => (
    <Section surface="alt" space="tight">
      <AutoGrid min="xs">
        {["card 1", "card 2", "card 3", "card 4"].map((label) => (
          <Card key={label} padding="sm">
            <span className="font-mono text-mono text-text-muted">{label}</span>
          </Card>
        ))}
      </AutoGrid>
    </Section>
  ),
};

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
