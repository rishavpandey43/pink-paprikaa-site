import type { Meta, StoryObj } from "@storybook/react-vite";

import { Gift } from "lucide-react";

import { Toast } from "./toast";

const meta = {
  title: "Molecules/Toast",
  component: Toast,
  args: { children: "Added to your order." },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "The transient pill confirmation, bottom-centre above the tab bar. One short sentence, " +
          "no dismiss, no exclamation mark. `isPopping` is the only sanctioned overshoot in the " +
          "system — add-to-cart and reward confirmations only.",
      },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Four tones. Danger announces assertively; the rest wait their turn. */
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Toast {...args} tone="brand">
        Added to your order.
      </Toast>
      <Toast {...args} tone="ink">
        Table held for 10 minutes.
      </Toast>
      <Toast {...args} tone="success">
        Order confirmed.
      </Toast>
      <Toast {...args} tone="danger">
        That card did not go through.
      </Toast>
    </div>
  ),
};

/** The inline action is set in caps by the component — write the label in Title Case. */
export const WithAction: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <Toast {...args} action="View Cart" onAction={() => undefined} tone="brand">
        Added to your order.
      </Toast>
      <Toast {...args} action="Retry" onAction={() => undefined} tone="danger">
        That card did not go through.
      </Toast>
    </div>
  ),
};

/** The single overshoot. Reserve it for add-to-cart and reward confirmations. */
export const Pop: Story = {
  render: (args) => (
    <Toast {...args} action="View Cart" isPopping onAction={() => undefined} tone="brand">
      Chilli Paneer added · ₹280
    </Toast>
  ),
};

/** Pass a Lucide component to override the tone's glyph. */
export const CustomGlyph: Story = {
  render: (args) => (
    <Toast {...args} icon={Gift} tone="brand">
      You earned a free masala chai.
    </Toast>
  ),
};

/** In place: bottom-centre, clear of the tab bar, on a 360px frame. */
export const InContext: Story = {
  globals: { viewport: { value: "floor360" } },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div className="relative h-100 bg-surface-page-alt">
      <div className="absolute inset-x-4 bottom-(--layout-tabbar-h) flex justify-center pb-4">
        <Toast {...args} action="View Cart" isPopping onAction={() => undefined} tone="brand">
          Added to your order.
        </Toast>
      </div>
    </div>
  ),
};
