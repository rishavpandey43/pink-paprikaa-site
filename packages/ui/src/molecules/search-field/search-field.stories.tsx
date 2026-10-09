import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";

import { SearchField } from "./search-field";

const meta = {
  title: "Molecules/SearchField",
  component: SearchField,
  args: {
    label: "Search the menu",
    placeholder: "Search chai, paneer, kulfi…",
    onValueChange: fn(),
    onClear: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Menu search — pill-shaped, unlike the 10px-radius Input, on the same field box (status border, focus ring, loading mark). Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`); the clear button appears whenever there is text, empties the box, calls `onClear` and returns focus to the input. Always full-width in its container with `min-width: 0`, so it never pushes a flex row wider. The placeholder names real dishes, not "Search…". `hint` sits under the field; with a `status` it becomes the status message with its glyph.',
      },
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "empty". */
export const Playground: Story = {};

/** Card row "with value" — type, then clear. */
export const WithValue: Story = {
  args: { defaultValue: "paneer" },
  play: async ({ args, canvas, userEvent }) => {
    const box = canvas.getByRole("searchbox", { name: "Search the menu" });
    await userEvent.type(box, " tikka");
    await expect(box).toHaveValue("paneer tikka");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(box).toHaveValue("");
    await expect(box).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  },
};

/** `clearLabel` names the clear button after what it clears, e.g. on the outlet finder. */
export const ClearLabel: Story = {
  args: {
    label: "Search outlets",
    placeholder: "Search Sector 57, MKM Market…",
    defaultValue: "Sector 57",
    clearLabel: "Clear outlet search",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Clear outlet search" })).toBeVisible();
  },
};

/** Card row "loading" — `isLoading`. */
export const Loading: Story = { args: { defaultValue: "kulfi", isLoading: true } };

/** Card row "no results" — `status="warning"` + `hint`. */
export const NoResults: Story = {
  args: {
    defaultValue: "pizza",
    status: "warning",
    hint: "Nothing matches that. Try another dish.",
  },
};

/** Card row "disabled". */
export const Disabled: Story = { args: { disabled: true, placeholder: "Search unavailable" } };

/** Card row `size="sm"`. */
export const Small: Story = {
  args: { size: "sm", label: "Search outlets", placeholder: "Search outlets" },
};

/** Dev parity: every status carries a sentence — success, error and read-only beside the card's warning. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex max-w-120 flex-col gap-5">
      <SearchField {...args} defaultValue="kulfi" status="success" hint="Showing 6 matches." />
      <SearchField
        {...args}
        defaultValue="chai"
        status="error"
        hint="Search is down for a moment."
      />
      <SearchField
        {...args}
        defaultValue="paneer"
        readOnly
        hint="Filtered by the outlet you picked."
      />
    </div>
  ),
};

/** Dev parity: the narrowest supported width — the pill keeps its height and a long query scrolls inside it. */
export const Narrow: Story = {
  args: { defaultValue: "paneer butter masala with extra gravy", hint: "34 dishes match." },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};
