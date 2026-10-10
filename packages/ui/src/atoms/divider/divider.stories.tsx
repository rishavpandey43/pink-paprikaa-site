import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Divider } from "./divider";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  args: { variant: "line" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Hairline separator; the `diamond` variant is the brand's section break. Menu rows are separated by `Divider`, not by cards. The rule, the label and the mark follow the surface, so on a pink field they turn white with no prop. A `label` is also the separator's accessible name.",
      },
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Line: Story = { name: 'variant="line"' };

export const Label: Story = { name: "label", args: { label: "Also Try" } };

export const Diamond: Story = { name: 'variant="diamond"', args: { variant: "diamond" } };

export const OnBrand: Story = {
  name: "on a brand surface",
  render: () => (
    <div data-surface="brand" className="grid gap-2.5 rounded-lg bg-surface-brand p-3.5">
      <Divider />
      <Divider label="Company" />
      <Divider variant="diamond" />
    </div>
  ),
};

/** How it reads: menu rows separated by a rule, not by cards, closed by the diamond. */
export const BetweenMenuRows: Story = {
  name: "in context: between menu rows",
  render: () => (
    <div className="w-80 font-body text-body">
      {[
        { name: "Paneer Tikka Masala", price: "₹280" },
        { name: "Veg Steamed Momos", price: "₹180" },
        { name: "Masala Cold Brew", price: "₹200" },
      ].map((dish, index) => (
        <div key={dish.name}>
          {index > 0 ? <Divider /> : null}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <span className="min-w-0">{dish.name}</span>
            <span className="text-text-brand">{dish.price}</span>
          </div>
        </div>
      ))}
      <Divider variant="diamond" className="my-8" />
    </div>
  ),
};

export const Vertical: Story = {
  name: 'orientation="vertical"',
  render: () => (
    <div className="flex h-10 items-center gap-3 font-body text-body-sm">
      <span>Sector 57</span>
      <Divider orientation="vertical" />
      <span>8am – 11:30pm</span>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <div className="grid w-full gap-2.5">
        <Divider label="Also Try" />
        <Divider variant="diamond" />
      </div>
    </OnSurfaces>
  ),
};
