import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Atoms/ProgressBar",
  component: ProgressBar,
  args: { label: "3 more visits and chai's on us", value: 3 },
  render: (args) => (
    <div className="w-full max-w-text-measure-prose">
      <ProgressBar {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Loyalty stamps and order progress. Segmented is the loyalty pattern (`segments` + `value` = stamps earned); continuous is for checkout steps and uploads. `pink-200` track, `pink-500` fill; `color="inverse"` on pink or ink panels, `color="success"` for a finished-feeling task. `label` always names the bar; `isLabelHidden` keeps it off screen.',
      },
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { segments: 6 } };

export const Segments: Story = { name: "segments", args: { segments: 6 } };

export const Continuous: Story = {
  name: "continuous",
  args: { label: "Checkout", value: 70, isLabelHidden: true },
};

export const ColorSuccess: Story = {
  name: "color",
  args: { label: "Upload", value: 45, color: "success", isLabelHidden: true },
};

export const Inverse: Story = {
  name: "inverse",
  render: () => (
    <div
      data-surface="brand"
      className="grid w-full max-w-text-measure-prose gap-4 rounded-lg bg-surface-brand p-4"
    >
      <ProgressBar label="4 of 6 visits" segments={6} value={4} color="inverse" isLabelHidden />
      <ProgressBar label="Uploading your photo" value={70} color="inverse" />
    </div>
  ),
};

/** The 360px phone floor: six stamps still fit the column without wrapping. */
export const Narrow: Story = {
  name: "six stamps at 360px",
  render: () => (
    <div className="w-90">
      <ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="grid w-full max-w-text-measure-prose gap-4">
      <ProgressBar label="Loyalty card, sm" segments={6} value={3} size="sm" />
      <ProgressBar label="Loyalty card, md" segments={6} value={3} size="md" />
    </div>
  ),
};

/** The label is `text-text-muted`, which follows `data-surface`. The pink panel takes `color="inverse"`. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      {(ground) => (
        <div className="min-w-0 flex-1">
          <ProgressBar
            label="3 more visits and chai's on us"
            segments={6}
            value={3}
            color={ground === "brand" ? "inverse" : undefined}
          />
        </div>
      )}
    </OnSurfaces>
  ),
};

export const Sx: Story = {
  args: { label: "Upload", value: 45, sx: { mt: 4, gap: 4 } },
};
