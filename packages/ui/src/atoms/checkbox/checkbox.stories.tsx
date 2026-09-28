import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  args: { label: "Extra burnt chilli mayo" },
  parameters: {
    docs: {
      description: {
        component:
          "Multi-select choice — menu add-ons, dietary preferences, consent. Pass `price` for add-ons; it right-aligns as `+₹40` in Poppins 700 and is part of the accessible name. `description` is announced as the description. `isInvalid` paints the box red and sets `aria-invalid`; the message that says what to do next belongs to Field. Disabled is a real fill, never opacity. Use Radio when exactly one option must be chosen. There is no on-brand skin: keep it off the brand (pink) ground.",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { price: 40 } };

export const CheckedAndUnchecked: Story = {
  name: "checked / not",
  render: () => (
    <div className="grid gap-3">
      <Checkbox label="Extra burnt chilli mayo" defaultChecked />
      <Checkbox label="Masala fries on the side" />
    </div>
  ),
};

export const Price: Story = { name: "price", args: { price: 40, defaultChecked: true } };

export const Description: Story = {
  name: "description",
  args: {
    label: "Make it a meal",
    description: "Adds fries and a kulhad chai.",
    price: 120,
  },
};

export const Invalid: Story = {
  name: "error",
  args: { label: "I agree to the terms", isInvalid: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: { label: "Truffle oil", description: "Sold out today.", disabled: true },
};

/** The real shape: an add-on list in an item sheet (a plain fieldset — an atom story composes no atom). */
export const AddOnList: Story = {
  name: "add-on list",
  render: () => (
    <fieldset className="grid gap-3 rounded-lg border border-border-subtle p-5">
      <legend className="px-1 font-display text-h4 font-bold text-text-heading">
        Add to your order
      </legend>
      <Checkbox label="Extra burnt chilli mayo" price={40} defaultChecked />
      <Checkbox label="Masala fries on the side" price={90} />
      <Checkbox
        label="Make it a meal"
        description="Adds masala fries and a kulhad chai."
        price={120}
      />
      <Checkbox label="Truffle oil" description="Sold out today." price={60} disabled />
    </fieldset>
  ),
};

/** The brand ground is left out on purpose (no on-brand skin). */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces grounds={["page", "alt", "ink", "soft"]}>
      <Checkbox
        label="Make it a meal"
        description="Adds fries and a kulhad chai."
        price={120}
        defaultChecked
      />
    </OnSurfaces>
  ),
};
