import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect } from "storybook/test";

import { Field } from "../field/field";
import { Combobox, type ComboboxOption, type ComboboxProps } from "./combobox";

const DISHES: ComboboxOption[] = [
  { value: "paneer-tikka", label: "Paneer Tikka" },
  { value: "paneer-butter-masala", label: "Paneer Butter Masala" },
  { value: "dal-makhani", label: "Dal Makhani" },
  { value: "chole-bhature", label: "Chole Bhature" },
  { value: "masala-dosa", label: "Masala Dosa" },
  { value: "pav-bhaji", label: "Pav Bhaji" },
  { value: "veg-biryani", label: "Veg Biryani" },
  { value: "malai-kofta", label: "Malai Kofta" },
  { value: "aloo-paratha", label: "Aloo Paratha" },
  { value: "gulab-jamun", label: "Gulab Jamun" },
  { value: "rasmalai", label: "Rasmalai" },
  { value: "kulfi", label: "Kulfi" },
];

const WITH_DESCRIPTIONS: ComboboxOption[] = [
  { value: "paneer-tikka", label: "Paneer Tikka", description: "Starter · tandoor-grilled" },
  { value: "dal-makhani", label: "Dal Makhani", description: "Main · slow-cooked overnight" },
  { value: "masala-dosa", label: "Masala Dosa", description: "South Indian · crisp rice crepe" },
  { value: "gulab-jamun", label: "Gulab Jamun", description: "Dessert · warm, in syrup" },
];

const meta = {
  title: "Molecules/Combobox",
  component: Combobox,
  args: { options: DISHES, "aria-label": "Search dishes", placeholder: "Search dishes" },
  decorators: [
    (Story) => (
      <div className="max-w-90">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      story: { inline: false, height: "360px" },
      description: {
        component:
          "A searchable single-select (WAI-ARIA 1.2 combobox with a list popup). Type to narrow the options (case- and accent-insensitive), ArrowDown/ArrowUp to move, Enter or Tab to choose, Escape to close and then to clear. Focus stays in the input. Use Select for a short known list; use this when people search the list (dishes, localities). Pass `name` to submit the chosen `value` through a hidden input; pass `inputValue` / `onInputChange` to load options as the text changes.",
      },
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox", { name: "Search dishes" });
    await userEvent.type(input, "pan");
    await expect(canvas.getAllByRole("option")).toHaveLength(2);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Paneer Tikka");
    await expect(input).toHaveAttribute("aria-expanded", "false");
  },
};

export const WithDescriptions: Story = {
  args: { options: WITH_DESCRIPTIONS },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    await expect(canvas.getByText("Dessert · warm, in syrup")).toBeVisible();
  },
};

export const Loading: Story = {
  args: { options: [], isLoading: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("combobox"));
    await expect(canvas.getByText("Loading…")).toBeVisible();
  },
};

export const Empty: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox"), "momo");
    await expect(canvas.getByText("No matches")).toBeVisible();
  },
};

export const DisabledOptions: Story = {
  args: {
    options: DISHES.map((dish) =>
      dish.value === "dal-makhani" || dish.value === "kulfi" ? { ...dish, disabled: true } : dish
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox"), "dal");
    await expect(canvas.getByRole("option", { name: "Dal Makhani" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  },
};

export const Clearable: Story = {
  args: { isClearable: true, defaultValue: "kulfi" },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("combobox");
    await expect(input).toHaveValue("Kulfi");
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: "kulfi" } };

export const InFieldWithError: Story = {
  render: (args) => (
    <Field label="Dish" status="error" message="Pick a dish from the list.">
      {({ id, "aria-describedby": describedBy }) => (
        <Combobox
          {...args}
          id={id}
          aria-describedby={describedBy}
          status="error"
          aria-label={undefined}
        />
      )}
    </Field>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("combobox", { name: "Dish" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Pick a dish from the list.");
  },
};

function ControlledCombobox(args: ComboboxProps) {
  const [value, setValue] = useState<string | null>("masala-dosa");
  return (
    <div className="grid gap-3">
      <Combobox {...args} value={value} onValueChange={setValue} />
      <p className="text-body-sm text-text-muted">
        Chosen: <output>{value ?? "nothing"}</output>
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledCombobox {...args} />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("combobox")).toHaveValue("Masala Dosa");
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(canvas.getByRole("option", { name: "Pav Bhaji" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("pav-bhaji");
  },
};

export const Mobile360: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  args: { isClearable: true },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole("combobox"), "a");
    const listbox = canvas.getByRole("listbox");
    const rect = listbox.getBoundingClientRect();
    await expect(rect.left).toBeGreaterThanOrEqual(0);
    await expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
  },
};
