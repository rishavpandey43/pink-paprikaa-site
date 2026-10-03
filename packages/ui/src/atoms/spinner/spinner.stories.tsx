import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./spinner";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Whole-view loading state — the brand mark, pulsing. `md` (36px) by default; `lg` (52px) for a full-page load. `color="inverse"` paints the white mark on pink or ink. With reduced motion the mark stays still. For content with a known shape use Skeleton instead — it is the better default.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Loading, small" />
      <Spinner size="md" label="Loading, medium" />
      <Spinner size="lg" label="Loading, large" />
    </div>
  ),
};

export const Colors: Story = {
  name: "color",
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner color="brand" label="Loading, brand" />
      <Spinner color="neutral" label="Loading, neutral" />
    </div>
  ),
};

export const Inverse: Story = {
  name: "inverse",
  render: () => (
    <div className="flex gap-4">
      <div data-surface="brand" className="rounded-lg bg-surface-brand p-4">
        <Spinner color="inverse" label="Loading, on brand" />
      </div>
      <div data-surface="ink" className="rounded-lg bg-surface-inverse p-4">
        <Spinner color="inverse" label="Loading, on ink" />
      </div>
    </div>
  ),
};

export const Sx: Story = {
  render: () => <Spinner sx={{ display: "flex", mt: 4 }} label="Loading, spaced" />,
};
