import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { AnnouncementBar } from "./announcement-bar";

const IN_THREE_DAYS = new Date(Date.now() + 3 * 86_400_000).toISOString();

const LAUNCH_COPY = (
  <>
    Launch price: <strong>Classic at {formatRupees(130)} a meal</strong> for the first 50
    subscribers · closes in
  </>
);

const meta = {
  title: "Molecules/AnnouncementBar",
  component: AnnouncementBar,
  args: {
    children: LAUNCH_COPY,
    href: "#homely-meals",
    endsAt: IN_THREE_DAYS,
    countdownLabel: "Launch price closes in",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The brand strip above the site header (the handoff's launch price bar). `href` makes the whole strip one link; `endsAt` adds the Countdown and — unlike the handoff — removes the bar entirely once the moment passes, re-checked on the client so a cached static page never shows an expired offer. Only the expiry gate ships JavaScript; the bar itself is server-rendered.",
      },
    },
  },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PPHeader launch strip. */
export const LaunchPrice: Story = {};

export const WithoutCountdown: Story = { args: { endsAt: undefined } };

/** After `endsAt`: nothing is rendered, and the header row moves up to the top. */
export const Expired: Story = {
  args: { endsAt: "2025-01-01T00:00:00+05:30" },
  render: (args) => (
    <div data-testid="page-top" className="grid">
      <AnnouncementBar {...args} />
      <div data-testid="header-row" className="h-header-compact border-b border-border-subtle px-4">
        Header row
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Launch price/)).toBeNull();
    const top = canvas.getByTestId("page-top").getBoundingClientRect().top;
    await expect(canvas.getByTestId("header-row").getBoundingClientRect().top).toBe(top);
  },
};
