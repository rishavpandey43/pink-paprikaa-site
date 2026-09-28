import type { Meta, StoryObj } from "@storybook/react-vite";

import { LogoLockup } from "./logo-lockup";

const meta = {
  title: "Molecules/LogoLockup",
  component: LogoLockup,
  args: { tone: "pink", size: "sm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The signature that closes a piece of marketing artwork — a post, a story, an ad. The tagline is part of the supplied logo artwork, so it scales with the mark and can never drift out of sync. Keep the lockup at 200px or wider; below that pass `hasTagline={false}` for the wordmark. On a coloured field use `tone="white"`; on light artwork `tone="pink"`. The padding is the brand\'s clear space (the height of the "P"); pass `className="p-0"` only where the parent already reserves it (a PostFrame\'s canvas pad). `isDecorative` hides the logo from assistive tech when the artwork names the brand in text nearby.',
      },
    },
  },
} satisfies Meta<typeof LogoLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "pink". */
export const Pink: Story = {};

/** Card row "white", on the brand field. */
export const White: Story = {
  args: { tone: "white" },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Card row "centred", on ink (the card's 180px snaps to the 200px minimum). */
export const Centred: Story = {
  args: { tone: "white", align: "center" },
  render: (args) => (
    <div data-surface="ink" className="w-full rounded-lg bg-surface-inverse">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Card row `hasTagline={false}` — the wordmark. */
export const Wordmark: Story = { args: { hasTagline: false } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="grid justify-items-start gap-2">
          <LogoLockup
            {...args}
            size={size}
            className="border border-dashed border-border-default"
          />
          <span className="font-mono text-mono text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** The clear space made visible, then dropped with `className="p-0"` where the parent reserves it. */
export const ClearSpace: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="rounded-lg bg-surface-page-alt">
        <LogoLockup {...args} />
      </div>
      <div className="rounded-lg bg-surface-page-alt">
        <LogoLockup {...args} className="p-0" />
      </div>
    </div>
  ),
};
