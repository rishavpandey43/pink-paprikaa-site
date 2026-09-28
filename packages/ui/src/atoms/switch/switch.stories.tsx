import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Switch } from "./switch";

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  args: { label: "Order updates" },
  render: (args) => (
    <div className="w-full max-w-text-measure-prose">
      <Switch {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Toggle for settings that take effect immediately — never inside a save-on-submit form. The label sits left and the control right, so a column of switches aligns. 46×28 track, 22px knob, 220ms slide. `isLabelHidden` keeps the label as the accessible name when the row around it already shows one. There is no on-brand skin: keep it off the brand (pink) ground.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OnAndOff: Story = {
  name: "on / off",
  render: () => (
    <div className="grid w-full max-w-text-measure-prose gap-4">
      <Switch label="Order updates" defaultChecked />
      <Switch label="Marketing texts" />
    </div>
  ),
};

export const Description: Story = {
  name: "description",
  args: { label: "Jain preferences", description: "Hides onion and garlic.", defaultChecked: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: { label: "Delivery updates", description: "Delivery starts in 2027.", disabled: true },
};

export const LabelHidden: Story = {
  name: "isLabelHidden",
  args: { label: "Order updates", isLabelHidden: true, defaultChecked: true },
};

/** The real shape: a preferences panel where every row takes effect immediately. */
export const PreferencesPanel: Story = {
  name: "preferences panel",
  render: () => (
    <div className="grid w-full max-w-text-measure-prose gap-5 rounded-lg border border-border-subtle p-5">
      <Switch
        label="Order updates"
        description="Order confirmations and pickup times."
        defaultChecked
      />
      <Switch label="Marketing texts" description="Offers and new dishes, at most once a week." />
      <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
      <Switch label="Delivery updates" description="Delivery starts in 2027." disabled />
    </div>
  ),
};

/** The brand ground is left out on purpose (no on-brand skin). */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces grounds={["page", "alt", "ink", "soft"]}>
      <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
    </OnSurfaces>
  ),
};
