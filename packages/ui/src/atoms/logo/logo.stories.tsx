import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo } from "./logo";

const meta = {
  title: "Atoms/Logo",
  component: Logo,
  parameters: {
    docs: {
      description: {
        component:
          "The only sanctioned way to place the lockup or the diamond symbol. Size it with " +
          "`size`, colour it with `tone` — never recolour, rotate, outline or add an effect to " +
          "the mark itself.",
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 28 / 40 / 56px tall. The lockup is about 1.9:1, so width follows the height. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      <Logo {...args} size="sm" />
      <Logo {...args} size="md" />
      <Logo {...args} size="lg" />
    </div>
  ),
};

export const SymbolMark: Story = {
  name: "Symbol",
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      <Logo {...args} size="sm" variant="symbol" />
      <Logo {...args} size="md" variant="symbol" />
      <Logo {...args} size="lg" variant="symbol" />
    </div>
  ),
};

/** On pink, ink or photography the mark flips to white. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-8 rounded-4 bg-surface-brand p-8">
      <Logo {...args} tone="white" />
      <Logo {...args} tone="white" variant="symbol" />
    </div>
  ),
};

/** The white mark on a pink plate — app icon, favicon, profile picture. */
export const Badge: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Logo {...args} tone="badge" variant="symbol" />
      <Logo {...args} tone="badge" />
    </div>
  ),
};

/** Inside a 72px header bar, beside the navigation. */
export const InAHeader: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <header className="flex h-(--layout-header-h) w-full items-center justify-between border-b border-border-subtle bg-surface-page px-6">
      <Logo {...args} size="sm" />
      <span className="font-body text-body2 text-text-muted">Sector 57, Gurgaon</span>
    </header>
  ),
};
