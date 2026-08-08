import type { Meta, StoryObj } from "@storybook/react-vite";

import { Snackbar } from "./snackbar";

const meta = {
  title: "Molecules/Snackbar",
  component: Snackbar,
  args: { children: "Code copied. Paste it at checkout.", duration: 0 },
  argTypes: { icon: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The anchored confirmation bar for something already done that may need an escape " +
          "hatch — a code copied, an item removed, a payment to retry. Squared, with a text " +
          "action and a dismiss, against `Toast`'s pill with neither. Never show both at once. " +
          "It positions itself `absolute`, so give the wrapper `relative`.",
      },
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A stage with a positioned ancestor, so the bar has something to anchor to. */
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="relative h-32 rounded-4 bg-surface-page-alt">{children}</div>;
}

export const Default: Story = {
  render: (args) => (
    <Stage>
      <Snackbar {...args} />
    </Stage>
  ),
};

/** Four tones. Danger announces assertively; the rest wait their turn. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Stage>
        <Snackbar {...args} tone="ink">
          Table held for 10 minutes.
        </Snackbar>
      </Stage>
      <Stage>
        <Snackbar {...args} tone="brand">
          Added to your order.
        </Snackbar>
      </Stage>
      <Stage>
        <Snackbar {...args} tone="success">
          Code copied. Paste it at checkout.
        </Snackbar>
      </Stage>
      <Stage>
        <Snackbar {...args} action="Retry" onAction={() => undefined} tone="danger">
          That card did not go through.
        </Snackbar>
      </Stage>
    </div>
  ),
};

/** The reversal case: a text action plus a dismiss. */
export const UndoAndDismiss: Story = {
  render: (args) => (
    <Stage>
      <Snackbar {...args} action="Undo" onAction={() => undefined} onClose={() => undefined}>
        Chilli Paneer removed.
      </Snackbar>
    </Stage>
  ),
};

/** Five anchors. All five keep a 24px gutter, so the bar never touches the frame. */
export const Positions: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Stage>
        <Snackbar {...args} position="top-center">
          Anchored top-centre.
        </Snackbar>
      </Stage>
      <Stage>
        <Snackbar {...args} position="top-right">
          Anchored top-right.
        </Snackbar>
      </Stage>
      <Stage>
        <Snackbar {...args} position="bottom-left">
          Anchored bottom-left.
        </Snackbar>
      </Stage>
      <Stage>
        <Snackbar {...args} position="bottom-right">
          Anchored bottom-right.
        </Snackbar>
      </Stage>
    </div>
  ),
};

/** 360px is the floor: the bar caps at 420px and shrinks with the gutter below that. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <Stage>
      <Snackbar {...args} action="Undo" onAction={() => undefined} onClose={() => undefined}>
        Chilli Paneer removed from your order.
      </Snackbar>
    </Stage>
  ),
};
