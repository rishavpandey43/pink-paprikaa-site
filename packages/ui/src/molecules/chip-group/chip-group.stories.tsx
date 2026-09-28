import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { ChipGroup } from "./chip-group";

/** PlanCalculator "6. Standing add-ons" (`rates.js` → homely.addons). */
const ADD_ONS = [
  ["paneer", "Upgrade sabji to paneer gravy", 40],
  ["makhani", "Upgrade dal to Dal Makhani", 30],
  ["sabji", "Extra sabji (150–180g)", 35],
  ["dal", "Extra dal (150–180ml)", 25],
  ["raita", "Boondi or Kheera Raita", 25],
  ["lassi", "Sweet Lassi (250ml)", 49],
  ["kheer", "Rice Kheer", 39],
  ["gj", "Gulab Jamun (1pc)", 15],
  ["chaas", "Masala Chaas (200ml)", 39],
  ["papad", "Roasted Papad", 20],
  ["roti", "2 extra Tawa Roti", 30],
] as const;

/** DawatCalculator "3. Starters" — the Veg Starter Combo, pick any 3. */
const VEG_STARTERS = [
  "Chilli Potato",
  "Honey Chilli Potato",
  "Veg Manchurian",
  "Veg Hakka Noodles",
  "Veg Chowmein",
  "Veg Spring Roll",
  "Hara Bhara Kebab",
].map((item) => ({ value: item, label: item }));

const MEALS = [
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "both", label: "Lunch + Dinner" },
];

const meta = {
  title: "Molecules/ChipGroup",
  component: ChipGroup,
  args: {
    type: "single",
    label: "Which meals",
    defaultValue: "lunch",
    options: MEALS,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Tag-based selection from the handoff calculators on Radix ToggleGroup (never a Tag button nested in an item). `type="single"` is a required choice (it never clears); `type="multiple"` toggles, and `maxSelected` makes the rest unavailable — still focusable, with a live status line saying why. `variant="segmented"` is the pill-track value switch (Lunch / Both) without panels; use Tabs when panels change. For react-hook-form use `<Controller>` with `value`, `onValueChange`, `onBlur` and `name`.',
      },
    },
  },
} satisfies Meta<typeof ChipGroup>;

export default meta;
// Plain `StoryObj`, not `StoryObj<typeof meta>`: Storybook intersects ChipGroup's union of props
// (single | multiple) with the meta's args and collapses every story to `never`. So the renders
// below pass their props explicitly instead of spreading untyped args.
type Story = StoryObj;

export const Playground: Story = {};

/** PlanCalculator "2. Which meals". */
export const WhichMeals: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Dinner" }));
    await expect(canvas.getByRole("radio", { name: "Dinner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowRight} ");
    await expect(canvas.getByRole("radio", { name: "Lunch + Dinner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** PlanCalculator "5. Make it yours" — bread and spice. */
export const MakeItYours: Story = {
  render: () => (
    <div className="grid gap-3">
      <ChipGroup
        type="single"
        label="Rice and roti"
        defaultValue="both"
        options={[
          { value: "both", label: "Rice + roti" },
          { value: "rice", label: "Rice only (300g)" },
          { value: "roti", label: "Roti only (+2 roti)" },
        ]}
      />
      <ChipGroup
        type="single"
        label="Spice"
        defaultValue="regular"
        options={[
          { value: "regular", label: "Regular spice" },
          { value: "less", label: "Less spicy" },
          { value: "none", label: "No chilli" },
        ]}
      />
    </div>
  ),
};

/** PlanCalculator "6. Standing add-ons" — multiple. */
export const StandingAddOns: Story = {
  args: {
    type: "multiple",
    label: "Standing add-ons",
    defaultValue: ["lassi"],
    options: ADD_ONS.map(([value, name, price]) => ({
      value,
      label: `${name} +${formatRupees(price)}`,
    })),
  },
};

/** DawatCalculator starter picks — any 3, the rest unavailable once 3 are chosen. */
export const StarterPicks: Story = {
  args: {
    type: "multiple",
    label: "Veg starters",
    // Replaces the meta's single-choice "lunch", which a multiple group would read as a list.
    defaultValue: [],
    maxSelected: 3,
    options: VEG_STARTERS,
    getLimitMessage: (selected: number, max: number) =>
      `Pick ${String(max)} · ${String(selected)} picked`,
  },
  play: async ({ canvas, userEvent }) => {
    for (const name of ["Chilli Potato", "Veg Manchurian", "Veg Spring Roll"]) {
      await userEvent.click(canvas.getByRole("button", { name }));
    }
    const blocked = canvas.getByRole("button", { name: "Hara Bhara Kebab" });
    await expect(blocked).toHaveAttribute("aria-disabled", "true");
    // Blocked chips take no pointer events (controlStates); the keyboard is the path to prove.
    blocked.focus();
    await userEvent.keyboard(" ");
    await expect(blocked).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByText("Pick 3 · 3 picked")).toBeInTheDocument();
  },
};

/** HomelyMeals price list switch — segmented. */
export const Segmented: Story = {
  args: {
    type: "single",
    variant: "segmented",
    label: "Meals per day",
    defaultValue: "one",
    options: [
      { value: "one", label: "Lunch or dinner" },
      { value: "both", label: "Lunch + dinner" },
    ],
  },
};

/** R101: an error is said in words (announced), and every chip's border reddens. */
export const WithError: Story = {
  args: {
    defaultValue: undefined,
    status: "error",
    message: "Choose the meals you want.",
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole("radiogroup", { name: "Which meals" });
    await expect(group).toHaveAttribute("aria-invalid", "true");
    await expect(group).toHaveAccessibleDescription("Choose the meals you want.");
    await expect(canvas.getByRole("alert")).toHaveTextContent("Choose the meals you want.");
  },
};

/** OfficeLunch "Plate" — chips on the ink section. */
export const OnInk: Story = {
  render: () => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <ChipGroup
        type="single"
        label="Plate"
        defaultValue="everyday"
        options={[
          { value: "everyday", label: `Everyday · ${formatRupees(99)}` },
          { value: "classic", label: `Classic · ${formatRupees(119)}` },
        ]}
      />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <div className="grid min-w-0 flex-1 gap-3">
        <ChipGroup type="single" label="Which meals" defaultValue="lunch" options={MEALS} />
        <ChipGroup
          type="single"
          variant="segmented"
          label="Meals per day"
          defaultValue="lunch"
          options={MEALS}
        />
      </div>
    </OnSurfaces>
  ),
};
