import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button/button";
import { Tooltip, TooltipProvider } from "./tooltip";

/**
 * Every story is wrapped in `TooltipProvider` because the component requires one — see the
 * component description. Apps mount it once in the root layout, not per tooltip.
 */
// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof Tooltip> = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  args: { label: "Contains dairy", children: <Button size="sm">Paneer Tikka</Button> },
  argTypes: { children: { control: false } },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Names an icon-only control or explains a mark. An ink pill, no arrow, five words at " +
          "most and no full stop — it never holds copy the guest actually needs. **It requires a " +
          "`TooltipProvider` above it in the tree**: mount one in the root layout, and every " +
          "tooltip below it shares one hover delay so sweeping across a row of controls does not " +
          "re-wait at every stop.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The pill flips itself when the chosen side has no room. */
export const Sides: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex flex-wrap items-center justify-center gap-16 p-16">
      <Tooltip {...args} isDefaultOpen label="Contains dairy" side="top">
        <Button size="sm" variant="secondary">
          Top
        </Button>
      </Tooltip>
      <Tooltip {...args} isDefaultOpen label="Save for later" side="bottom">
        <Button size="sm" variant="secondary">
          Bottom
        </Button>
      </Tooltip>
      <Tooltip {...args} isDefaultOpen label="Share this outlet" side="left">
        <Button size="sm" variant="secondary">
          Left
        </Button>
      </Tooltip>
      <Tooltip {...args} isDefaultOpen label="Ground this morning" side="right">
        <Button size="sm" variant="secondary">
          Right
        </Button>
      </Tooltip>
    </div>
  ),
};

/** On a button, where the hint explains why the action behaves the way it does. */
export const OnAButton: Story = {
  render: (args) => (
    <Tooltip {...args} label="Pickup only for now">
      <Button size="sm" variant="secondary">
        Delivery
      </Button>
    </Tooltip>
  ),
};

/** Long hints wrap at a fixed cap rather than running off the viewport at 360px. */
export const LongHint: Story = {
  args: { label: "Cooked to order, so it takes about twelve minutes", isDefaultOpen: true },
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="p-16">
      <Tooltip {...args}>
        <Button size="sm" variant="ghost">
          Prep Time
        </Button>
      </Tooltip>
    </div>
  ),
};
