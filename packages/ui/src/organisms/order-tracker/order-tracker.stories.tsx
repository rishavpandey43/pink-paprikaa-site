import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { OrderTracker } from "./order-tracker";

const meta = {
  title: "Organisms/OrderTracker",
  component: OrderTracker,
  args: { code: "PPK-4821", outlet: "SECTOR 57", payment: "UPI", total: 1239 },
  argTypes: { steps: { control: false } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The screen a guest watches while the kitchen cooks: a flooded pink `PatternField` " +
          "carrying the moment they are in, the vertical `StepTracker` under it, and what they " +
          "paid. Step copy is the brand's voice — \"Kitchen's on it.\" — never a system status.",
      },
    },
  },
} satisfies Meta<typeof OrderTracker>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A phone-width frame, so the header and the tracker are seen at the width they ship at. */
function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-90 overflow-hidden rounded-4 border border-border-subtle">
      {children}
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="p-6">
      <Phone>
        <OrderTracker {...args} />
      </Phone>
    </div>
  ),
};

/** The three live states, start to ready. The badge flips only on the last one. */
export const EveryState: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4 p-6">
      {[0, 1, 2].map((current) => (
        <Phone key={current}>
          <OrderTracker {...args} current={current} />
        </Phone>
      ))}
    </div>
  ),
};

/** With an action at the foot — the only control on the screen, so it is never `primary`. */
export const WithAction: Story = {
  args: { current: 2, onDone: () => undefined },
  render: (args) => (
    <div className="p-6">
      <Phone>
        <OrderTracker {...args} />
      </Phone>
    </div>
  ),
};

/** Delivery runs its own steps. Two is as short as the tracker is worth drawing. */
export const DeliverySteps: Story = {
  args: {
    current: 1,
    steps: [
      { label: "Order in", note: "Kitchen's on it." },
      { label: "On its way", note: "Riding out to you now." },
    ],
  },
  render: (args) => (
    <div className="p-6">
      <Phone>
        <OrderTracker {...args} />
      </Phone>
    </div>
  ),
};

/** The card frame rounds and clips it for a page that is not a full app screen. */
export const CardFrame: Story = {
  args: { current: 1, variant: "card" },
  render: (args) => (
    <div className="w-full max-w-115 p-6">
      <OrderTracker {...args} />
    </div>
  ),
};

/** The smallest supported viewport. The header copy wraps; nothing is clipped. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { current: 1, onDone: () => undefined },
};
