import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

/**
 * Contract tests for the test canvas: at the 360 floor a story has the room the Storybook canvas
 * gives it (360px less the layout's 16px a side), so a 360 play measures what a reviewer sees.
 * Hidden from the sidebar; run by storybook:test.
 */
const meta = {
  title: "Readme/Canvas geometry",
  tags: ["!dev", "!autodocs"],
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => <div data-testid="fill" className="w-full" />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const widthOfFill = (canvasElement: HTMLElement) =>
  canvasElement.querySelector("[data-testid='fill']")?.getBoundingClientRect().width;

export const PaddedLeaves328: Story = {
  parameters: { layout: "padded" },
  play: async ({ canvasElement }) => {
    await expect(widthOfFill(canvasElement)).toBe(328);
  },
};

export const CenteredLeaves328: Story = {
  parameters: { layout: "centered" },
  render: () => (
    <div data-testid="fill" className="w-screen max-w-full">
      <span className="block whitespace-nowrap">A line long enough to want the whole width</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(widthOfFill(canvasElement)).toBeLessThanOrEqual(328);
  },
};

export const FullscreenLeaves360: Story = {
  parameters: { layout: "fullscreen" },
  play: async ({ canvasElement }) => {
    await expect(widthOfFill(canvasElement)).toBe(360);
  },
};
