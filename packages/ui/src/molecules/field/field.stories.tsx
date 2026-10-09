import type { Meta, StoryObj } from "@storybook/react-vite";
import { Phone } from "lucide-react";
import { expect } from "storybook/test";

import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { paint } from "../../lib/story-paint";
import { Field } from "./field";

const HEAT_LEVELS = [
  { value: "1", label: "Mild" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hot" },
  { value: "4", label: "Extra Hot" },
];

/** The label text's computed colour — the label is the `<label>` around it. */
function labelColour(label: HTMLElement): string {
  const element = label.closest("label");
  if (element === null) throw new Error("the text sits in a <label>");
  return getComputedStyle(element).color;
}

const meta = {
  title: "Molecules/Field",
  component: Field,
  args: {
    label: "Mobile number",
    children: (control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Label, bare control and hint or status message. Wrap any control that does not carry its own label — Input, Select, a custom widget. The control is wired by render prop: `children` receives `{ id, aria-describedby, aria-invalid, aria-required }` (each only when it applies) to spread onto it, so Field works in server components and with react-hook-form's `register()` spread after it. A status (`error`, `success`, `warning`) shows its glyph and replaces the hint with `message` — never a status colour without words; pass the same `status` to the control for its border. Mark the *optional* fields rather than starring the required ones. Group controls (SlotPicker, RadioGroup) carry their own legend and message; do not wrap them. A lone Checkbox (consent) takes its error message from Field: Field's label asks the question, the Checkbox's label answers it.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "stack + hint". */
export const StackWithHint: Story = {
  args: {
    label: "How spicy?",
    hint: "You can change this later.",
    children: (control) => <Select {...control} options={HEAT_LEVELS} defaultValue="3" />,
  },
};

/** Card row "required" — `isRequired`. */
export const Required: Story = {
  args: {
    label: "Mobile number",
    isRequired: true,
    children: (control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />,
  },
};

/** Card row "error" — `status="error"` + `message`. */
export const WithError: Story = {
  args: {
    label: "How spicy?",
    status: "error",
    message: "Pick a heat level.",
    children: (control) => (
      <Select
        {...control}
        options={HEAT_LEVELS}
        placeholder="Pick one"
        status="error"
        defaultValue=""
      />
    ),
  },
  // The Select's disabled placeholder <option> must not mute the label (fold item 5): the label
  // keeps the resting label colour, which a probe with the same class reads.
  play: async ({ canvas, canvasElement }) => {
    const probe = document.createElement("span");
    probe.className = "text-text-body";
    canvasElement.append(probe);
    const resting = getComputedStyle(probe).color;
    probe.remove();
    await expect(labelColour(canvas.getByText("How spicy?"))).toBe(resting);
  },
};

/** Card row "success" — `status="success"` + `message`. */
export const WithSuccess: Story = {
  args: {
    label: "Promo code",
    status: "success",
    message: "PAPRIKAA50 applied.",
    children: (control) => <Input {...control} defaultValue="PAPRIKAA50" status="success" />,
  },
};

/** Warning — the handoff Dawat calculator's guest rule. */
export const WithWarning: Story = {
  args: {
    label: "Guests",
    status: "warning",
    message: "Full setup and service starts at 50 guests.",
    children: (control) => <Input {...control} type="number" defaultValue="30" status="warning" />,
  },
};

/** `isOptional` — the design system's preferred marker. */
export const Optional: Story = {
  args: {
    label: "Promo code",
    isOptional: true,
    children: (control) => <Input {...control} placeholder="PAPRIKAA50" />,
  },
};

/** Card row `layout="side"` — `orientation="side"`: a 160px label column from 480px up; it stacks below. */
export const Side: Story = {
  args: {
    label: "Outlet",
    orientation: "side",
    hint: "Pickup only for now.",
    children: (control) => <Input {...control} defaultValue="Sector 57" />,
  },
};

/** Dev parity: the control's own modes inside a Field — read-only, loading, disabled (label mutes). */
export const ControlModes: Story = {
  render: () => (
    <div className="flex max-w-120 flex-col gap-6">
      <Field label="Outlet" hint="Pickup only for now.">
        {(control) => <Input {...control} defaultValue="Sector 57" readOnly />}
      </Field>
      <Field label="Promo code" hint="Checking that code.">
        {(control) => <Input {...control} defaultValue="PAPRIKAA50" isLoading />}
      </Field>
      <Field label="Table size" hint="Table booking opens at 11am.">
        {(control) => <Input {...control} disabled placeholder="Choose a table size" />}
      </Field>
      <Field label="Notes for the kitchen" isOptional>
        {(control) => <Input {...control} isMultiline rows={3} placeholder="Less oil, no onion" />}
      </Field>
    </div>
  ),
  // Only the disabled control mutes its label, to text-subtle; read-only and loading keep theirs.
  play: async ({ canvas }) => {
    const resting = labelColour(canvas.getByText("Outlet"));
    await expect(labelColour(canvas.getByText("Promo code"))).toBe(resting);
    const muted = canvas.getByText("Table size");
    await expect(labelColour(muted)).not.toBe(resting);
    await expect(labelColour(muted)).toBe(paint(muted, "color", "--color-text-subtle"));
  },
};
