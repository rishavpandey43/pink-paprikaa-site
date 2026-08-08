import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "./text";

const RAMP = [
  ["display1", "72 / 1.02 / -0.03em", "Poppins ExtraBold"],
  ["display2", "56 / 1.05 / -0.025em", "Poppins ExtraBold"],
  ["h1", "40 / 1.1 / -0.02em", "Poppins Bold"],
  ["h2", "32 / 1.15 / -0.015em", "Poppins Bold"],
  ["h3", "25 / 1.2 / -0.01em", "Poppins Bold"],
  ["subtitle1", "20 / 1.3 / -0.005em", "Poppins Bold"],
  ["subtitle2", "18 / 1.6", "DM Sans"],
  ["body1", "16 / 1.6", "DM Sans"],
  ["body2", "14 / 1.55", "DM Sans"],
  ["caption", "12.5 / 1.45", "DM Sans"],
  ["overline", "11.5 / 1.2 / +0.14em", "Poppins Bold, uppercase"],
  ["mono", "13 / 1.5 / +0.02em", "Space Mono"],
] as const;

const meta = {
  title: "Atoms/Text",
  component: Text,
  args: { children: "Desi at heart. Urban by nature." },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Every piece of text in the system goes through `Text`, which locks the ramp so nothing " +
          "is ad-hoc. Each step picks its own element and tone; override either when the document " +
          "outline and the visual level need to differ.",
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The whole ramp, top to bottom, with the values each step locks in. */
export const Ramp: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {RAMP.map(([variant, metrics, family]) => (
        <div className="flex flex-col gap-1" key={variant}>
          <div className="flex items-baseline gap-3">
            <Text tone="brand" variant="overline">
              {variant}
            </Text>
            <Text tone="subtle" variant="caption">
              {metrics} · {family}
            </Text>
          </div>
          <Text variant={variant}>Desi at heart. Urban by nature.</Text>
        </div>
      ))}
    </div>
  ),
};

/** Semantic colours only — never a literal. `onBrand` and `inverse` need a dark ground. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["heading", "body", "muted", "subtle", "brand", "danger"] as const).map((tone) => (
        <Text key={tone} tone={tone} variant="subtitle1">
          {tone} — Amritsari paneer, burnt chilli mayo.
        </Text>
      ))}
      <div className="flex flex-col gap-4 rounded-4 bg-surface-inverse p-6">
        <Text tone="inverse" variant="subtitle1">
          inverse — on an ink panel
        </Text>
      </div>
      <div className="flex flex-col gap-4 rounded-4 bg-surface-brand p-6">
        <Text tone="onBrand" variant="subtitle1">
          onBrand — on a flooded pink panel
        </Text>
      </div>
    </div>
  ),
};

/**
 * Seven steps carry a `clamp()` twin. Set `isFluid` in any responsive layout, and check this story
 * at the 360 viewport — that width is the floor every design has to survive.
 */
export const Fluid: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["display1", "display2", "h1", "h2", "h3", "subtitle1", "body1"] as const).map(
        (variant) => (
          <div className="flex flex-col gap-1" key={variant}>
            <Text tone="brand" variant="overline">
              {variant} · fluid
            </Text>
            <Text isFluid variant={variant}>
              Desi at heart. Urban by nature.
            </Text>
          </div>
        )
      )}
    </div>
  ),
};

/** Long-form prose is capped so a line never runs the full width of a wide container. */
export const Measure: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Text measure="prose">
        We roast our own masala. Every morning, before the shutters go up, the kitchen smells of
        cumin and coriander hitting a hot pan — and that is the smell the whole day is built on.
      </Text>
      <Text measure="narrow" tone="muted">
        Narrow measure, 44 characters. Use it for pull quotes and captions beside an image.
      </Text>
    </div>
  ),
};

/** Menu descriptions truncate rather than pushing a card taller than its neighbours. */
export const Truncated: Story = {
  render: () => (
    <div className="w-72 rounded-4 border border-border-subtle p-4">
      <Text variant="subtitle1">Paprikaa Chilli Paneer</Text>
      <Text lineClamp={2} tone="muted" variant="body2">
        Amritsari paneer, burnt chilli mayo, potato brioche, house pickle, and a handful of crisp
        curry leaves that never quite fit on one line.
      </Text>
    </div>
  ),
};
