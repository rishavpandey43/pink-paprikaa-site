import type { Meta, StoryObj } from "@storybook/react-vite";

import { Gift } from "lucide-react";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Toast, ToastProvider } from "./toast";

const VIEW_CART = { label: "View Cart", altText: "View your cart", onClick: fn() };

const meta = {
  title: "Molecules/Toast",
  component: Toast,
  args: { color: "brand", duration: Infinity, action: VIEW_CART, children: "Added to your order." },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Transient pill confirmation, bottom-centre above the tab bar or dock. Mount one `ToastProvider` (at the app root, or `isContained` inside a positioned frame such as AppShell's overlay slot); every Toast inside it appears in its viewport. `isPop` is the only sanctioned overshoot in the system — reserve it for add-to-cart and reward confirmations. Copy is one short sentence, no exclamation mark. The optional action is an uppercase text button (`{ label, altText, onClick }`); there is no dismiss — use Snackbar for things the guest may want to reverse. Never show both at once.",
      },
      story: { inline: false, iframeHeight: "240px" },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "colours" — brand with its action, ink. */
export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <Toast color="brand" duration={Infinity} action={VIEW_CART}>
        Added to your order.
      </Toast>
      <Toast color="neutral" duration={Infinity}>
        Table held for 10 minutes.
      </Toast>
    </ToastProvider>
  ),
};

/** Card row "status" — success, danger. */
export const Status: Story = {
  render: () => (
    <ToastProvider>
      <Toast color="success" duration={Infinity}>
        Order confirmed.
      </Toast>
      <Toast
        color="danger"
        duration={Infinity}
        action={{ label: "Retry", altText: "Try the payment again", onClick: fn() }}
      >
        That card didn&apos;t go through.
      </Toast>
    </ToastProvider>
  ),
};

/** Card row "pop" — add-to-cart only. */
export const Pop: Story = { args: { isPop: true, children: "Chilli Paneer added." } };

/** Dev parity: `icon` overrides the colour's glyph. */
export const CustomGlyph: Story = {
  args: { icon: Gift, action: undefined, children: "You earned a free masala chai." },
};

function AddToOrderDemo() {
  const [added, setAdded] = useState(0);
  return (
    <ToastProvider>
      <Button
        onClick={() => {
          setAdded((count) => count + 1);
        }}
      >
        Add Chilli Paneer
      </Button>
      {added === 0 ? null : (
        <Toast key={added} color="brand" isPop duration={4000} action={VIEW_CART}>
          Chilli Paneer added.
        </Toast>
      )}
    </ToastProvider>
  );
}

/** The real flow: each add pops a fresh toast. */
export const AddToOrder: Story = {
  render: () => <AddToOrderDemo />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Add Chilli Paneer" });
    await userEvent.click(trigger);
    await expect(await canvas.findByText("Chilli Paneer added.")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "View Cart" }));
    await expect(VIEW_CART.onClick).toHaveBeenCalledTimes(1);
    // R91: focus goes back to the trigger, not onto the empty, outlined viewport.
    await expect(trigger).toHaveFocus();
  },
};

/** `isContained` — the App kit's toast inside the phone frame (a positioned box here). */
export const Contained: Story = {
  // The toast anchors to a positioned frame, which the centred canvas would shrink to no width.
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="relative h-60 max-w-120 overflow-hidden rounded-xl border border-border-subtle bg-surface-page-alt">
      <ToastProvider isContained>
        <Toast {...args} />
      </ToastProvider>
    </div>
  ),
};
