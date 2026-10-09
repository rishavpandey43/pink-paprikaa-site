import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageCircle, Phone } from "lucide-react";
import { expect } from "storybook/test";

import { SiteFooter } from "../site-footer/site-footer";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { ActionDock } from "./action-dock";

const meta = {
  title: "Organisms/ActionDock",
  component: ActionDock,
  args: {
    primary: { label: "WhatsApp us", href: BRAND.whatsappHref, icon: MessageCircle },
    secondary: { label: "Call", href: BRAND.phoneHref, icon: Phone },
  },
  decorators: [
    (Story) => (
      <>
        <div className="container-page h-200 py-10">
          <div className="h-full rounded-lg bg-surface-page-alt" />
        </div>
        <SiteFooter
          surface="ink"
          hasDockClearance
          columns={[
            {
              heading: "Eat with us",
              items: [
                { label: "Homely Meals", href: "#homely-meals" },
                { label: "Catering & Bulk Orders", href: "#catering" },
              ],
            },
          ]}
          legal={<span>{BRAND.copyright}</span>}
          policies={[
            { label: "Privacy Policy", href: "#privacy" },
            { label: "Refund & Cancellation", href: "#refunds" },
          ]}
        />
        <Story />
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "560px" },
      description: {
        component:
          "The handoff's always-there WhatsApp action. Below md: a white bar fixed to the bottom — Call icon + WhatsApp pill — padded for the iOS home indicator. From md: the WhatsApp pill alone, floating bottom-right. Scroll to the bottom: with `SiteFooter hasDockClearance` the dock never covers the legal links.",
      },
    },
  },
} satisfies Meta<typeof ActionDock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Scrolled to the very bottom, the dock sits below the footer's last legal link. */
const proveFooterClear: Story["play"] = async ({ canvas, canvasElement }) => {
  const page = canvasElement.ownerDocument;
  page.defaultView?.scrollTo({ top: page.documentElement.scrollHeight, behavior: "instant" });
  const dock = canvas.getByRole("link", { name: "WhatsApp us" }).closest('[data-surface="light"]');
  const lastLink = canvas.getByRole("link", { name: "Refund & Cancellation" });
  await expect(dock).not.toBeNull();
  await expect(lastLink.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    dock?.getBoundingClientRect().top ?? 0
  );
};

export const Playground: Story = {};

/** Handoff mobile bar. */
export const Mobile: Story = { globals: VIEWPORT_360, play: proveFooterClear };

export const Tablet: Story = { globals: VIEWPORT_768, play: proveFooterClear };

/** Handoff desktop floating pill. */
export const Desktop: Story = { globals: VIEWPORT_1280, play: proveFooterClear };

export const PrimaryOnly: Story = { args: { secondary: undefined }, globals: VIEWPORT_360 };
