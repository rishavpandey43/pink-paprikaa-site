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

/** Card row "color". */
export const Colors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-7.5 py-4.5">
      <OfferSeal {...args} color="neutral" />
      <OfferSeal {...args} color="brand" />
      <OfferSeal {...args} color="accent" />
    </div>
  ),
};

/** Card row "value", at `md`: the note is dropped at `sm`, where it would print at ~7px. */
export const Values: Story = {
  args: { size: "md" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-7.5 py-4.5">
      <OfferSeal {...args} value={formatRupees(99)} label="Only" />
      <OfferSeal {...args} value="1+1" label="Free" />
      <OfferSeal {...args} value="50%" label="Off" note="till 11:30pm" />
    </div>
  ),
};

/** The handoff hero seal (Home): 156px, brand, launch price. */
export const HandoffHero: Story = {
  args: { size: "md", color: "brand", value: formatRupees(130), label: "Launch" },
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

/**
 * `md` in flow on a 360px phone: the rotated tips stay inside the frame (the seal reserves
 * 0.15 × side around itself) and the page never scrolls sideways.
 */
export const Floor360: Story = {
  args: { size: "md", color: "brand", value: formatRupees(130), label: "Launch" },
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: (args) => (
    <div data-testid="frame" className="flex">
      <OfferSeal {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame");
    const seal = frame.firstElementChild;
    await expect(seal).toBeInstanceOf(HTMLElement);
    if (seal === null) return;
    // getBoundingClientRect is the rotated square's box, sharp corners included; the painted tip
    // is the rounded corner, r × (√2 − 1) further in.
    const rect = seal.getBoundingClientRect();
    const cut = Number.parseFloat(getComputedStyle(seal).borderTopLeftRadius) * (Math.SQRT2 - 1);
    const box = frame.getBoundingClientRect();
    await expect(rect.top + cut).toBeGreaterThanOrEqual(box.top);
    await expect(rect.left + cut).toBeGreaterThanOrEqual(box.left);
    await expect(rect.right - cut).toBeLessThanOrEqual(box.right);
    await expect(rect.bottom - cut).toBeLessThanOrEqual(box.bottom);
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
  },
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
