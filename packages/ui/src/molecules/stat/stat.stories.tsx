import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heart } from "lucide-react";
import { expect } from "storybook/test";

import { groundOf } from "../../lib/story-paint";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Stat } from "./stat";

const meta = {
  title: "Molecules/Stat",
  component: Stat,
  args: { value: "18", label: "spices ground in-house, daily" },
  parameters: {
    docs: {
      description: {
        component:
          "A single big fact — outlet counts, spices ground, years open. The number is fluid-clamped Poppins 800, so it never overflows a narrow column; `color` colours it (neutral ink, brand, or white `inverse` on a dark band) while the label and sub follow the surface. Use at most 3–4 in a row and never invent numbers.",
      },
    },
  },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "default". */
export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-10">
      <Stat value="18" label="spices ground in-house, daily" />
      <Stat value="100%" label="vegetarian kitchen" />
    </div>
  ),
};

/** Card row "icon + brand". */
export const IconBrand: Story = {
  args: { value: "4.6", label: "average guest rating", icon: Heart, color: "brand" },
};

/** Card row "inverse + center", on an ink field. */
export const InverseCentre: Story = {
  args: { value: "2025", label: "the year we started", color: "inverse", align: "center" },
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <Stat {...args} />
    </div>
  ),
};

/** Dev parity: the sub line carries the detail behind the number. */
export const WithSub: Story = {
  args: { value: "100%", label: "vegetarian kitchen", sub: "No meat, no egg, ever." },
};

/** Dev parity: three across, the most a row should carry; one column each below 480px. */
export const Row: Story = {
  render: () => (
    <div className="grid gap-8 sm:grid-cols-3">
      <Stat value="100%" label="vegetarian kitchen" />
      <Stat value="18" label="spices ground in-house, daily" />
      <Stat value="2025" label="the year we started" />
    </div>
  ),
};

/** Dev parity: at 360px the fluid number steps down rather than pushing the column open. */
export const Narrow: Story = {
  args: { value: "4.6", label: "average guest rating", sub: "Across every ordering channel" },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};

/** The neutral and brand colors on every field: the glyph turns white on pink (R89). */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  args: { value: "4.6", label: "average guest rating", icon: Heart },
  render: (args) => (
    <OnSurfaces>
      <Stat {...args} color="neutral" />
      <Stat {...args} color="brand" />
    </OnSurfaces>
  ),
  play: async ({ canvasElement }) => {
    const glyphs = [...canvasElement.querySelectorAll("svg.lucide-heart")];
    // Two colors on each of the 5 grounds.
    await expect(glyphs).toHaveLength(10);
    for (const glyph of glyphs) {
      await expect(getComputedStyle(glyph).color).not.toBe(groundOf(glyph));
    }
  },
};
