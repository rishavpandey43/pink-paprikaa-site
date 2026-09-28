import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OfferSeal } from "./offer-seal";

const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

const meta = {
  title: "Molecules/OfferSeal",
  component: OfferSeal,
  args: { value: "50%", label: "Off", size: "sm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Offer badge for posts, stories and banners — a rotated brand diamond, never a circular starburst. One per artboard. Use `bleed` (with `corner`) to hang it off the canvas edge: the only offsets are 1/12 and 1/6 of the side, because the number reaches ~0.32 × side from the centre and must never be clipped. Text counter-rotates so it stays upright. The container needs `relative` (and `overflow-hidden` for a canvas).",
      },
    },
  },
} satisfies Meta<typeof OfferSeal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone". */
export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-7.5 py-4.5">
      <OfferSeal {...args} tone="light" />
      <OfferSeal {...args} tone="brand" />
      <OfferSeal {...args} tone="turmeric" />
    </div>
  ),
};

/** Card row "value". */
export const Values: Story = {
  render: (args) => (
    <div className="flex items-center gap-7.5 py-4.5">
      <OfferSeal {...args} value={formatRupees(99)} label="Only" />
      <OfferSeal {...args} value="1+1" label="Free" />
      <OfferSeal {...args} value="50%" label="Off" note="till 11:30pm" />
    </div>
  ),
};

/** The handoff hero seal (Home): 156px, brand, launch price. */
export const HandoffHero: Story = {
  args: { size: "md", tone: "brand", value: formatRupees(130), label: "Launch" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-16 p-10">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <OfferSeal key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** Every corner bled the maximum on a 400px board: the value must stay fully on the board. */
export const BleedOffCorner: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-6">
      {CORNERS.map((corner) => (
        <div
          key={corner}
          data-testid={`board-${corner}`}
          data-surface="brand"
          className="relative size-100 overflow-hidden rounded-lg bg-surface-brand"
        >
          <OfferSeal {...args} size="lg" corner={corner} bleed="md" />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const corner of CORNERS) {
      const board = canvas.getByTestId(`board-${corner}`).getBoundingClientRect();
      const [valueNode] = canvas
        .getAllByText("50%")
        .filter((node) => canvas.getByTestId(`board-${corner}`).contains(node));
      const value = valueNode?.getBoundingClientRect();
      await expect(value).toBeDefined();
      if (value === undefined) return;
      await expect(value.top).toBeGreaterThanOrEqual(board.top);
      await expect(value.left).toBeGreaterThanOrEqual(board.left);
      await expect(value.right).toBeLessThanOrEqual(board.right);
      await expect(value.bottom).toBeLessThanOrEqual(board.bottom);
    }
  },
};
