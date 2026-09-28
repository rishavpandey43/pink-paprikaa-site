import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor } from "storybook/test";

import { Countdown } from "./countdown";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
/** Computed when the stories load, so the countdown is always live in Storybook. */
const IN_FIVE_DAYS = new Date(Date.now() + 5 * DAY_MS + 7 * HOUR_MS).toISOString();
const LAST_YEAR = "2025-10-31T23:59:59+05:30";
const READING = /^\d+d \d{2}h \d{2}m \d{2}s$/;

const meta = {
  title: "Atoms/Countdown",
  component: Countdown,
  args: { endsAt: IN_FIVE_DAYS },
  parameters: {
    docs: {
      description: {
        component:
          'From the handoff\'s launch bar: the time left on an offer as `Nd HHh MMm SSs` in a mono ink pill, ticking every second. `endsAt` is ISO 8601 with an offset ("2026-10-31T23:59:59+05:30"). The server renders a stable placeholder, so there is no hydration mismatch and a static page never bakes in a stale time; once `endsAt` passes it renders `fallback` — nothing by default — so an expired offer disappears even from a cached page. `label` is read before the time by assistive tech only. Client component.',
      },
    },
  },
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { label: "Offer closes in" },
  play: async ({ canvas }) => {
    const time = canvas.getByText(READING);
    await expect(time.tagName).toBe("TIME");
    await expect(time).toHaveAttribute("datetime", IN_FIVE_DAYS);
    const first = time.textContent;
    await waitFor(() => expect(time.textContent).not.toBe(first), { timeout: 2500 });
  },
};

/** PPHeader.dc.html — the launch bar the countdown was drawn for. */
export const InLaunchBar: Story = {
  name: "in the launch bar (handoff)",
  render: (args) => (
    <p
      data-surface="brand"
      className="m-0 flex max-w-none flex-wrap items-center justify-center gap-2 bg-surface-brand px-4 py-1.5 text-center font-body text-body-sm"
    >
      <span>
        Launch price: <strong>Classic at ₹130 a meal</strong> for the first 50 subscribers · closes
        in
      </span>
      <Countdown {...args} />
    </p>
  ),
};

export const Ended: Story = {
  name: "after endsAt: fallback",
  args: {
    endsAt: LAST_YEAR,
    fallback: (
      <span className="font-body text-body-sm text-text-muted">This offer has closed.</span>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("This offer has closed.")).toBeVisible();
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};

export const EndedRendersNothing: Story = {
  name: "after endsAt: nothing by default",
  args: { endsAt: LAST_YEAR },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};
