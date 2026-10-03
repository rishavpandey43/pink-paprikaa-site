import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, screen, within } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { FEATURED_DISH } from "../fixtures";
import { KIT_NOTICE } from "../kit-notice";
import { WebsiteKit } from "./website-kit";

const meta = {
  title: "Website/Homepage",
  component: WebsiteKit,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The design system's website kit (ui_kits/website), composed only from @pink-paprikaa-web/ui. Layouts and sample copy are the design system's; every fact is from @pink-paprikaa-web/content, and the reviews are the four verified Google reviews. Interactions: add a dish (header count + pop toast), book a table (two-step dialog), the header turns to glass on scroll. Reference kit — not production copy.",
      },
    },
  },
} satisfies Meta<typeof WebsiteKit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Homepage: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: `Add ${FEATURED_DISH.name}` }));
    await expect(
      await screen.findByText(`${FEATURED_DISH.name} added to your order.`)
    ).toBeInTheDocument();

    await userEvent.click(
      within(canvas.getByRole("banner")).getByRole("link", { name: "Book a Table" })
    );
    const booking = await screen.findByRole("dialog", { name: "Book a table" });
    await userEvent.click(within(booking).getByRole("button", { name: "Hold My Table" }));
    await expect(
      await screen.findByRole("dialog", { name: "Table held for 10 minutes" })
    ).toBeVisible();
  },
};

export const Homepage360: Story = {
  name: "Homepage at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
    const menuButton = canvas.getByRole("button", { name: "Menu" });
    await expect(menuButton).toBeVisible();

    await userEvent.click(menuButton);
    const drawer = await screen.findByRole("dialog", { name: "Menu" });
    await userEvent.click(within(drawer).getByRole("link", { name: "Book a Table" }));

    await expect(await screen.findByRole("dialog", { name: "Book a table" })).toBeVisible();
    await expect(screen.queryByRole("dialog", { name: "Menu" })).not.toBeInTheDocument();
  },
};
