import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { SectionHeader } from "./section-header";

const meta = {
  title: "Molecules/SectionHeader",
  component: SectionHeader,
  args: {
    overline: "The Menu",
    title: "Most ordered this week",
    action: (
      <Button variant="ghost" size="sm" iconAfter={ArrowRight}>
        See All
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "The standard section opener — every page section starts with one. Uppercase overline, a fluid `h2-fluid` heading (so it never overflows on mobile), an optional one-sentence lede and a trailing action (usually a ghost Button; not rendered when centred). `headingLevel` (default 2) sets the element, never the look. On a pink or ink section it follows the surface — there is no `on` prop.",
      },
    },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "with action". */
export const Playground: Story = {};

/** Card row "lede". */
export const WithLede: Story = {
  args: {
    overline: "Our Story",
    title: "A cafe that tastes like where it's from",
    lede: "We started in one Gurgaon market with a chai counter and a grinder.",
    action: undefined,
  },
};

/** Card row "centred". */
export const Centred: Story = {
  args: { align: "center", overline: "Outlets", title: "Find a Paprikaa", action: undefined },
};

/** Card row `on="brand"` — now a brand surface. */
export const OnBrand: Story = {
  args: { overline: "Franchise", title: "Bring us to your city", action: undefined },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
      <SectionHeader {...args} />
    </div>
  ),
};

export const Surfaces: Story = {
  args: { lede: "What Sector 57 ordered most." },
  render: (args) => (
    <OnSurfaces>
      <SectionHeader {...args} />
    </OnSurfaces>
  ),
};

/** Dev parity: the outline changes, the type step never does — no skipping from h1 to h3. */
export const HeadingLevels: Story = {
  render: (args) => (
    <div className="grid gap-10">
      <SectionHeader {...args} headingLevel={2} title="Rendered as an h2" />
      <SectionHeader {...args} headingLevel={3} title="Rendered as an h3" />
      <SectionHeader {...args} headingLevel={4} title="Rendered as an h4" />
    </div>
  ),
};

/** Dev parity: at 360px the action wraps under the heading rather than squeezing it. */
export const Narrow: Story = {
  args: { lede: "One kitchen, one grinder and a menu that changes with the season." },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
};
