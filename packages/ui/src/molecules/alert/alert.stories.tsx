import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../atoms/button/button";
import { Alert } from "./alert";

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  args: { children: "Pickup is running 25 minutes today." },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The persistent inline message — a kitchen delay, a closed outlet, a card that did " +
          "not go through. Soft tint with a matching full 1px border. Reach for `Toast` or " +
          "`Snackbar` when the message should disappear on its own.",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: "Kitchen is busy" } };

/** Five tones. The glyph is the tone's own — it is not overridable, because the tone is the mark. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Alert {...args} title="Pickup only" tone="info">
        Delivery starts in 2027.
      </Alert>
      <Alert {...args} title="Order confirmed" tone="success">
        The kitchen has it. Counter 2.
      </Alert>
      <Alert {...args} title="Kitchen is busy" tone="warning">
        Pickup is running 25 minutes today.
      </Alert>
      <Alert {...args} title="That card did not go through" tone="danger">
        Try another card or pay by UPI.
      </Alert>
      <Alert {...args} title="New on the menu" tone="brand">
        Tandoori platters, ₹280 for two.
      </Alert>
    </div>
  ),
};

/** One control under the message, never two. */
export const WithAction: Story = {
  render: (args) => (
    <Alert
      {...args}
      action={
        <Button size="sm" variant="ghost">
          See the Menu
        </Button>
      }
      title="New in Sector 57"
      tone="brand"
    >
      Doors open Friday, 8am.
    </Alert>
  ),
};

/** Without a title the message sits flush against the glyph. */
export const MessageOnly: Story = {
  render: (args) => <Alert {...args}>We now take UPI at every counter.</Alert>,
};

/** The dismiss control appears only when a handler is given — a payment failure keeps none. */
export const Dismissible: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Alert {...args} onDismiss={() => undefined}>
        We now take UPI at every counter.
      </Alert>
      <Alert {...args} onDismiss={() => undefined} title="Thali hours" tone="brand">
        The full thali runs 12pm – 3:30pm, every day.
      </Alert>
    </div>
  ),
};

/** 360px is the floor every design must survive — the message wraps, the glyphs hold their size. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: (args) => (
    <div className="max-w-90">
      <Alert
        {...args}
        onDismiss={() => undefined}
        title="That card did not go through"
        tone="danger"
      >
        Try another card or pay by UPI at the counter.
      </Alert>
    </div>
  ),
};
