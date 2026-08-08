import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";

import { SearchField, type SearchFieldProps } from "./search-field";

// `meta` is annotated rather than `satisfies`-inferred: under pnpm's isolated node_modules,
// declaration emit for an inferred decorator type reaches for Storybook/Radix internals it
// cannot name from here (TS2883). The annotation keeps the emitted type nameable.
const meta: Meta<typeof SearchField> = {
  title: "Molecules/SearchField",
  component: SearchField,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Menu search — the pill-shaped sibling of `Input`, which is 10px-cornered. It is always " +
          "full width in its container with a zero min-width, so it can never push a filter row " +
          "wider, and its placeholder names real dishes rather than naming the act of searching.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function LiveSearchField(props: SearchFieldProps) {
  const [query, setQuery] = useState("paneer");
  return (
    <SearchField
      {...props}
      onChange={(event) => {
        setQuery(event.target.value);
      }}
      onClear={() => {
        setQuery("");
      }}
      value={query}
    />
  );
}

/** Type into it: the clear button appears as soon as there is a query to clear. */
export const Interactive: Story = {
  render: (args) => <LiveSearchField {...args} />,
};

/** 40 / 48px — fixed heights, so the pill never wraps beside a filter chip. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <SearchField {...args} placeholder="Small — 40px" size="sm" />
      <SearchField {...args} placeholder="Medium — 48px" size="md" />
    </div>
  ),
};

/** Every status carries a sentence — a colour on its own never says what went wrong. */
export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-5">
      <SearchField {...args} hint="34 dishes match." />
      <SearchField
        {...args}
        message="Nothing matches that. Try another dish."
        readOnly
        status="warning"
        value="pizza"
      />
      <SearchField {...args} message="Showing 6 matches." readOnly status="success" value="kulfi" />
      <SearchField
        {...args}
        message="Search is down for a moment."
        readOnly
        status="error"
        value="chai"
      />
      <SearchField
        {...args}
        message="Looking through the menu."
        readOnly
        status="loading"
        value="kulfi"
      />
      <SearchField
        {...args}
        label="Search unavailable"
        message="Search opens when the kitchen does, at 8am."
        placeholder="Search unavailable"
        status="disabled"
      />
    </div>
  ),
};

/** The narrowest supported width — the pill keeps its height and the query truncates instead. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    value: "paneer butter masala with extra gravy",
    hint: "34 dishes match.",
    readOnly: true,
  },
};
