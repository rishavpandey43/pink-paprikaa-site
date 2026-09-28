import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Radio, RadioGroup } from "./radio";

const meta = {
  title: "Atoms/Radio",
  component: Radio,
  subcomponents: { RadioGroup },
  args: { name: "playground", value: "regular", label: "Regular", price: 280 },
  parameters: {
    docs: {
      description: {
        component:
          "Exactly-one choice — portion size, spice level, payment method. Put radios in a **RadioGroup** (a `fieldset` + `legend`, 12px apart) and always give them a shared `name`. The dot is drawn as a 6px pink ring — do not swap in a filled circle. `price` is the option's absolute price. A group `status` marks every ring and reads its `message` as the group's description; a disabled group disables every option.",
      },
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Group: Story = {
  name: "group",
  render: () => (
    <RadioGroup legend="Portion" isLegendHidden>
      <Radio name="size" value="regular" label="Regular" price={280} defaultChecked />
      <Radio name="size" value="sharing" label="Sharing" price={440} description="Feeds two." />
    </RadioGroup>
  ),
};

export const NoPrice: Story = {
  name: "no price",
  render: () => (
    <RadioGroup legend="Spice" isLegendHidden>
      <Radio name="heat" value="hot" label="Hot" defaultChecked />
      <Radio name="heat" value="extra-hot" label="Extra Hot" />
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <Radio
      name="platter"
      value="family"
      label="Family platter"
      description="Weekends only."
      disabled
    />
  ),
};

export const GroupError: Story = {
  name: "group status + message",
  render: () => (
    <RadioGroup legend="Portion" status="error" message="Pick a portion to continue.">
      <Radio name="portion" value="regular" label="Regular" price={280} />
      <Radio name="portion" value="sharing" label="Sharing" price={440} />
    </RadioGroup>
  ),
  // The group error reddens every ring — a chosen one too, whose pink ring would otherwise win.
  play: async ({ canvas, userEvent }) => {
    const regular = canvas.getByRole("radio", { name: "Regular ₹280" });
    await userEvent.click(regular);
    const ring = regular.nextElementSibling?.firstElementChild as HTMLElement;
    // Read the settled ring, not a frame of its transition.
    await Promise.all(ring.getAnimations().map((animation) => animation.finished));
    const probe = document.createElement("span");
    probe.style.borderColor = "var(--color-status-danger)";
    ring.append(probe);
    const danger = getComputedStyle(probe).borderColor;
    probe.remove();
    await expect(regular).toBeChecked();
    await expect(getComputedStyle(ring).borderTopWidth).toBe("6px");
    await expect(getComputedStyle(ring).borderColor).toBe(danger);
  },
};

/** An option invalid on its own and chosen: the red ring must beat the checked pink. */
export const InvalidChecked: Story = {
  name: "invalid + checked",
  render: () => (
    <Radio name="portion-invalid" value="regular" label="Regular" isInvalid defaultChecked />
  ),
  play: async ({ canvas }) => {
    const radio = canvas.getByRole("radio", { name: "Regular" });
    const ring = radio.nextElementSibling?.firstElementChild as HTMLElement;
    await Promise.all(ring.getAnimations().map((animation) => animation.finished));
    const probe = document.createElement("span");
    probe.style.borderColor = "var(--color-status-danger)";
    ring.append(probe);
    const danger = getComputedStyle(probe).borderColor;
    probe.remove();
    await expect(radio).toBeChecked();
    await expect(getComputedStyle(ring).borderTopWidth).toBe("6px");
    await expect(getComputedStyle(ring).borderColor).toBe(danger);
  },
};

export const Horizontal: Story = {
  name: "orientation horizontal",
  render: () => (
    <RadioGroup legend="Spice" orientation="horizontal">
      <Radio name="spice-row" value="mild" label="Mild" defaultChecked />
      <Radio name="spice-row" value="medium" label="Medium" />
      <Radio name="spice-row" value="hot" label="Hot" />
    </RadioGroup>
  ),
};

/** Every option state in one group: chosen, not chosen, invalid, disabled. */
export const States: Story = {
  name: "states",
  render: () => (
    <RadioGroup legend="States" isLegendHidden>
      <Radio name="states" value="chosen" label="Chosen" defaultChecked />
      <Radio name="states" value="not-chosen" label="Not chosen" />
      <Radio name="states" value="invalid" label="Group unanswered" isInvalid />
      <Radio
        name="states"
        value="family"
        label="Family platter"
        description="Weekends only."
        disabled
      />
    </RadioGroup>
  ),
};

/** The real shape: the portion step of an item sheet — a visible legend, priced and described. */
export const PortionPicker: Story = {
  name: "portion picker",
  render: () => (
    <RadioGroup legend="Choose a portion">
      <Radio
        name="portion-pick"
        value="regular"
        label="Regular"
        price={280}
        description="One plate."
        defaultChecked
      />
      <Radio
        name="portion-pick"
        value="sharing"
        label="Sharing"
        price={440}
        description="Feeds two."
      />
      <Radio
        name="portion-pick"
        value="family"
        label="Family platter"
        price={720}
        description="Weekends only."
        disabled
      />
    </RadioGroup>
  ),
};

/** Unnamed radios, so each ground keeps its own checked option; the errored group shows its message. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Radio value="regular" label="Regular" price={280} defaultChecked />
      <Radio value="sharing" label="Sharing" price={440} />
      <RadioGroup legend="Portion" isLegendHidden status="error" message="Pick a portion.">
        <Radio value="half" label="Half" />
      </RadioGroup>
    </OnSurfaces>
  ),
};
