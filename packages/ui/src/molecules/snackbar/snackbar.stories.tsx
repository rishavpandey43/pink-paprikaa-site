import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Snackbar } from "./snackbar";

const meta = {
  title: "Molecules/Snackbar",
  component: Snackbar,
  args: { duration: Infinity, children: "Table held for 10 minutes.", onOpenChange: fn() },
  render: (args) => (
    <div className="relative h-28 rounded-lg border border-border-subtle bg-surface-page-alt">
      <Snackbar {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Anchored confirmation bar for a completed action that may need an escape hatch — copying a code, undoing a removal, retrying a failure. **Snackbar vs Toast:** Snackbar is a squared bar with a text action and a dismiss, for things the guest may want to reverse or act on; Toast is a pill with no dismiss, for pure confirmations like add-to-cart. Never show both at once. By default it anchors to the nearest positioned ancestor — inside AppShell that is the phone frame; on a web page give the wrapper `position: relative`, or pass `isContained={false}` to pin it to the window. Auto-hides after 3.2s (`duration={Infinity}` keeps it).",
      },
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "tones" — ink. */
export const Playground: Story = {};

/** Card row "tones" — success. */
export const Success: Story = {
  args: { tone: "success", children: "Code copied. Paste it at checkout." },
};

/** Card row "tones" — danger with Retry. */
export const DangerWithRetry: Story = {
  args: {
    tone: "danger",
    children: "That card didn't go through.",
    action: { label: "Retry", altText: "Retry the payment", onClick: fn() },
  },
};

/** Card row "undo + dismiss". */
export const UndoAndDismiss: Story = {
  args: {
    children: "Chilli Paneer removed.",
    action: { label: "Undo", altText: "Undo removing Chilli Paneer", onClick: fn() },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(canvas.queryByText("Chilli Paneer removed.")).not.toBeInTheDocument();
  },
};

function LiveCopyDemo() {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="relative grid h-40 place-items-start rounded-lg border border-border-subtle p-4">
      <Button
        variant="secondary"
        onClick={() => {
          setIsCopied(true);
        }}
      >
        Copy PAPRIKAA50
      </Button>
      <Snackbar tone="success" position="bottom-left" open={isCopied} onOpenChange={setIsCopied}>
        Code copied. Paste it at checkout.
      </Snackbar>
    </div>
  );
}

/** Card row "live copy" — the code-copied flow (a Button stands in for the coupon stub). */
export const LiveCopy: Story = {
  render: () => <LiveCopyDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy PAPRIKAA50" }));
    await expect(await canvas.findByText("Code copied. Paste it at checkout.")).toBeInTheDocument();
    // R82: dismissing from the keyboard hands focus back to the button that opened the bar.
    canvas.getByRole("button", { name: "Dismiss" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("button", { name: "Copy PAPRIKAA50" })).toHaveFocus();
  },
};

/** `position="top-right"`. */
export const TopRight: Story = { args: { position: "top-right", children: "Order updated." } };

/** Dev parity: the other anchors, one open bar per story. */
export const TopCenter: Story = { args: { position: "top-center", children: "Order updated." } };

export const BottomRight: Story = {
  args: { position: "bottom-right", children: "Order updated." },
};

/** Dev parity: the brand tone. */
export const Brand: Story = { args: { tone: "brand", children: "Added to your order." } };

/** Dev parity: 360px is the floor — the bar caps at 420px and shrinks with the 24px gutter. */
export const Narrow: Story = {
  args: {
    children: "Chilli Paneer removed from your order.",
    action: { label: "Undo", altText: "Undo removing Chilli Paneer", onClick: fn() },
  },
  render: (args) => (
    <div className="relative h-28 max-w-90 rounded-lg border border-border-subtle bg-surface-page-alt">
      <Snackbar {...args} />
    </div>
  ),
};
