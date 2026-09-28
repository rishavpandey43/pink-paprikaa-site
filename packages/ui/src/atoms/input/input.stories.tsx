import type { Meta, StoryObj } from "@storybook/react-vite";

import { CreditCard, Phone } from "lucide-react";
import { expect } from "storybook/test";

import { paint } from "../../lib/story-paint";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Input } from "./input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  args: { "aria-label": "Full name", placeholder: "Your full name" },
  argTypes: { icon: { control: false }, trailing: { control: false } },
  render: (args) => (
    <div className="w-full max-w-text-measure-prose">
      <Input {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Single-line or multiline text field — 48px tall (40 sm / 56 lg), 10px radius, 2px status border. States: rest, hover, focus (2px pink + ring), filled, `disabled`, `readOnly` (sunken fill + lock), `isLoading` (the pulsing mark), and `status` error / success / warning — a status raises the border to 2px, tints the leading icon and shows its glyph on the right. The label, hint and status message belong to **Field** (Molecules/Field), where the message replaces the hint; labels are sentence case and error copy says what to do next, never a code. `className` sizes the box; every other prop, `register()` included, lands on the native input.",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rest: Story = { name: "rest" };

export const FilledWithIcon: Story = {
  name: "filled + icon",
  args: { "aria-label": "Mobile number", icon: Phone, type: "tel", defaultValue: "98765 43210" },
};

export const StatusError: Story = {
  name: "error",
  args: { "aria-label": "Card", icon: CreditCard, defaultValue: "4242 4242", status: "error" },
};

export const StatusSuccess: Story = {
  name: "success",
  args: { "aria-label": "Promo code", defaultValue: "PAPRIKAA50", status: "success" },
};

export const StatusWarning: Story = {
  name: "warning",
  args: { "aria-label": "Pickup time", defaultValue: "11:25pm", status: "warning" },
};

export const Loading: Story = {
  name: "loading",
  args: { "aria-label": "Promo code", defaultValue: "CHAI20", isLoading: true },
};

export const ReadOnly: Story = {
  name: "readOnly",
  args: { "aria-label": "Outlet", defaultValue: "Sector 57", readOnly: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: {
    "aria-label": "Delivery address",
    placeholder: "Delivery starts in 2027",
    disabled: true,
  },
};

export const SuffixAndTrailing: Story = {
  name: "suffix / trailing",
  args: {
    "aria-label": "Table size",
    suffix: "guests",
    placeholder: "4",
    trailing: (
      <button
        type="button"
        className="shrink-0 rounded-pill px-3 py-1 font-display text-body-sm font-bold text-text-link hover:bg-pink-50"
      >
        Check
      </button>
    ),
  },
};

/** A disabled trailing button disables only itself: the field keeps its white box and body text. */
export const DisabledTrailing: Story = {
  name: "trailing disabled",
  args: {
    "aria-label": "Promo code",
    defaultValue: "CHAI20",
    trailing: (
      <button
        type="button"
        disabled
        className="shrink-0 rounded-pill px-3 py-1 font-display text-body-sm font-bold text-text-link disabled:text-ink-400"
      >
        Apply
      </button>
    ),
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Promo code" });
    const box = input.parentElement;
    if (box === null) throw new Error("The input renders inside its field box.");
    await expect(getComputedStyle(input).color).toBe(paint(input, "color", "--color-text-body"));
    await expect(getComputedStyle(box).backgroundColor).toBe(
      paint(input, "backgroundColor", "--color-surface-card")
    );
  },
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="grid w-full max-w-text-measure-prose gap-3">
      <Input aria-label="Small" size="sm" placeholder="sm — 40px" />
      <Input aria-label="Medium" size="md" placeholder="md — 48px" />
      <Input aria-label="Large" size="lg" placeholder="lg — 56px" />
    </div>
  ),
};

export const Multiline: Story = {
  name: "multiline",
  args: {
    "aria-label": "Any notes for the kitchen?",
    isMultiline: true,
    rows: 3,
    placeholder: "No onion, extra hot.",
  },
};

/** A field is its own light island: white, dark text and a light focus ring on every ground. */
export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Input aria-label="Mobile number" icon={Phone} placeholder="98765 43210" />
    </OnSurfaces>
  ),
};
