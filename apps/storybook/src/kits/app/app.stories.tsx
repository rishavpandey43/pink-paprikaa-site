import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, waitFor, within } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { FEATURED_DISH, SAMPLE_CART } from "../fixtures";
import { KIT_NOTICE } from "../kit-notice";
import { OrderingApp } from "./ordering-app";

const meta = {
  title: "App/Ordering app",
  component: OrderingApp,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The design system's ordering-app kit (ui_kits/app) at 390×844 inside AppShell, composed only from @pink-paprikaa-web/ui. Flow: Home → customise a dish in the sheet → Add to Order (pop toast) → Cart → Pay → tracking advances Order in → On the tandoor → Ready → Back to Home. The item sheet and the pop toast render inside the phone frame, through AppShell's overlay slot. Reference kit — not production copy.",
      },
    },
  },
} satisfies Meta<typeof OrderingApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: { initialScreen: "home" },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `Customise ${FEATURED_DISH.name}` }));
    const sheet = await screen.findByRole("dialog", { name: FEATURED_DISH.name });
    await userEvent.click(within(sheet).getByRole("button", { name: /^Add to Order/ }));
    // Toast pop-in starts at opacity 0 — wait for the message to land (duration-base).
    await waitFor(async () =>
      expect(await screen.findByText(`${FEATURED_DISH.name} added to your order.`)).toBeVisible()
    );
  },
};

export const Menu: Story = { args: { initialScreen: "menu" } };

export const ItemSheetOpen: Story = {
  name: "Item sheet",
  args: { initialScreen: "menu", initialItem: FEATURED_DISH },
};

export const Cart: Story = { args: { initialScreen: "cart", initialLines: SAMPLE_CART } };

export const Tracking: Story = { args: { initialScreen: "tracking", initialLines: SAMPLE_CART } };

export const Account: Story = { args: { initialScreen: "you" } };

export const Home360: Story = {
  name: "Home at 360px",
  args: { initialScreen: "home", size: "phone-sm" },
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
