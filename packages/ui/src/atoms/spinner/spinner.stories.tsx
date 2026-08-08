import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./spinner";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          "The brand's loading state: the diamond symbol pulsing at 1.2s. Never a gradient " +
          "spinner, never a borrowed ring. It is a standalone indicator, so its scale is larger " +
          "than `Icon`'s — `md` is 32px. For block-level loading reach for `Skeleton` instead.",
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * 16 / 20 / 32 / 48 / 64. `md` is the default and the one to reach for. `xs` and `sm` exist for the
 * places a spinner sits inside another control — a `Button` mid-action, a loading `Field`.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <span className="flex flex-col items-center gap-3" key={size}>
          <Spinner size={size} />
          <span className="text-caption text-text-muted">{size}</span>
        </span>
      ))}
    </div>
  ),
};

/**
 * Semantic tones. `current` opts out and inherits whatever colour the parent already set.
 *
 * Every swatch names itself on the page ground rather than inside its panel. A 12.5px caption is
 * white-on-#EE2C68 at 4.04:1 if it sits on the pink panel, and the panel here is a *swatch* — the
 * spinner is what has to be on it, not the word underneath.
 */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-8">
        {(["brand", "muted", "subtle"] as const).map((tone) => (
          <span className="flex flex-col items-center gap-3" key={tone}>
            <Spinner tone={tone} />
            <span className="text-caption text-text-muted">{tone}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-8">
        <span className="flex flex-col items-center gap-3">
          <span className="rounded-4 bg-surface-brand p-6">
            <Spinner tone="onBrand" />
          </span>
          <span className="text-caption text-text-muted">onBrand</span>
        </span>
        <span className="flex flex-col items-center gap-3">
          <span className="rounded-4 bg-surface-inverse p-6">
            <Spinner tone="inverse" />
          </span>
          <span className="text-caption text-text-muted">inverse</span>
        </span>
      </div>
    </div>
  ),
};

/** `tone="current"` inherits the parent's colour — how `Button` keeps the spinner on its label. */
export const InheritingColour: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <span className="rounded-3 bg-surface-card p-6 text-text-brand">
        <Spinner size="lg" tone="current" />
      </span>
      <span className="rounded-3 bg-surface-brand p-6 text-text-on-brand">
        <Spinner size="lg" tone="current" />
      </span>
      <span className="rounded-3 bg-surface-inverse p-6 text-text-on-inverse">
        <Spinner size="lg" tone="current" />
      </span>
    </div>
  ),
};

/** Labelled, it announces itself politely. Leave the label off inside a control that already says so. */
export const Labelled: Story = {
  args: { label: "Adding to cart", size: "lg" },
};
