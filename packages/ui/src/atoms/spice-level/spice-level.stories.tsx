import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { SpiceLevel } from "./spice-level";

const LEVELS = [1, 2, 3, 4] as const;

const meta = {
  title: "Atoms/SpiceLevel",
  component: SpiceLevel,
  args: { level: 3 },
  parameters: {
    docs: {
      description: {
        component:
          'Heat indicator built from the brand\'s diamond motif — never a chilli emoji. Filled diamonds take the heat colour of the level (mint → turmeric → tandoor → pink); the rest sit in ink-200, each carrying the brand mark. `hasLabel` adds the plain name: Mild, Medium, Hot, Extra Hot. `sm` (12px) is the menu size, `md` (14px) the default. One image, named "Spice level 3 of 4".',
      },
    },
  },
} satisfies Meta<typeof SpiceLevel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Levels: Story = {
  name: "level",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      {LEVELS.map((level) => (
        <SpiceLevel key={level} level={level} />
      ))}
    </div>
  ),
};

export const WithLabel: Story = {
  name: "hasLabel",
  render: () => (
    <div className="grid gap-3">
      {LEVELS.map((level) => (
        <SpiceLevel key={level} level={level} hasLabel />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <SpiceLevel level={3} size="sm" />
      <SpiceLevel level={3} size="md" />
      <SpiceLevel level={3} size="lg" />
    </div>
  ),
};

/** How it appears: under the dish name in a menu row (plain elements — an atom story composes no atom). */
export const InContext: Story = {
  name: "in a menu row",
  render: () => (
    <div className="grid max-w-text-measure-prose gap-1">
      <p className="m-0 font-display text-h4 font-bold text-text-heading">Paprikaa Chilli Paneer</p>
      <p className="m-0 font-body text-body-sm text-text-muted">
        Wok-tossed cottage cheese, capsicum, spring onion.
      </p>
      <SpiceLevel level={3} size="sm" hasLabel />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <SpiceLevel level={3} hasLabel />
    </OnSurfaces>
  ),
};
