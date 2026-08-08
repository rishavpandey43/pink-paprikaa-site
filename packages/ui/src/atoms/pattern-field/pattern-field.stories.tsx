import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "../text/text";
import { PatternField } from "./pattern-field";

const meta = {
  title: "Atoms/PatternField",
  component: PatternField,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A flooded panel with the diamond symbol tiled behind it — the brand's only texture. " +
          "Opacity is fixed per tone at 8–9% so the pattern stays a whisper. Never pair it with " +
          "noise, grain or a gradient.",
      },
    },
  },
} satisfies Meta<typeof PatternField>;

export default meta;

type Story = StoryObj<typeof meta>;

function Panel({ tone }: { tone: "brand" | "ink" | "soft" | "light" }) {
  const isDark = tone === "brand" || tone === "ink";
  return (
    <div className="p-8">
      <Text tone={isDark ? "inverse" : "heading"} variant="h3">
        100% vegetarian kitchen
      </Text>
      <Text className="mt-1-5" tone={isDark ? "inverse" : "muted"} variant="body2">
        Sector 57, Gurgaon · 8am – 11:30pm
      </Text>
    </div>
  );
}

export const Default: Story = {
  args: { radius: "lg", tone: "brand" },
  render: (args) => (
    <PatternField {...args}>
      <Panel tone="brand" />
    </PatternField>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <PatternField {...args} radius="lg" tone="brand">
        <Panel tone="brand" />
      </PatternField>
      <PatternField {...args} radius="lg" tone="ink">
        <Panel tone="ink" />
      </PatternField>
      <PatternField {...args} radius="lg" tone="soft">
        <Panel tone="soft" />
      </PatternField>
      <PatternField {...args} radius="lg" tone="light">
        <Panel tone="light" />
      </PatternField>
    </div>
  ),
};

/** 56–72px on screen; 96px once the panel is a 1080px marketing canvas. */
export const TileSizes: Story = {
  render: (args) => (
    <div className="grid gap-4">
      <PatternField {...args} radius="md" tile={56}>
        <Panel tone="brand" />
      </PatternField>
      <PatternField {...args} radius="md" tile={72}>
        <Panel tone="brand" />
      </PatternField>
      <PatternField {...args} radius="md" tile={96}>
        <Panel tone="brand" />
      </PatternField>
    </div>
  ),
};

/** A full-bleed section band — no radius, edge to edge. */
export const FullBleedBand: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <PatternField {...args} tone="ink">
      <div className="mx-auto max-w-(--layout-container-max) px-6 py-16">
        <Text isBalanced isFluid tone="inverse" variant="h2">
          Momos, chaat and North Indian plates from ₹180–₹320
        </Text>
      </div>
    </PatternField>
  ),
};
