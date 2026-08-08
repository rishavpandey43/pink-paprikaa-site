import type { Meta, StoryObj } from "@storybook/react-vite";

import { LogoLockup } from "./logo-lockup";

const meta = {
  title: "Molecules/LogoLockup",
  component: LogoLockup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The signature block for marketing artwork — wordmark plus tagline, correctly " +
          "proportioned. The tagline steps with the mark, so the lockup stays in proportion at " +
          "every size, and the clear space around it is the height of the “P”. Never " +
          "re-set the tagline by hand next to a bare Logo.",
      },
    },
  },
} satisfies Meta<typeof LogoLockup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Mark heights 80 / 96 / 128px. Even the smallest clears the 140px minimum wordmark width. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      <LogoLockup {...args} hasClearSpace={false} size="sm" />
      <LogoLockup {...args} hasClearSpace={false} size="md" />
      <LogoLockup {...args} hasClearSpace={false} size="lg" />
    </div>
  ),
};

/** `white` on a pink artboard — the signature pairing. */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: { tone: "white" },
  render: (args) => (
    <div className="rounded-5 bg-surface-brand">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Centred on ink, the shape a story artboard uses. */
export const CentredOnInk: Story = {
  globals: { backgrounds: { value: "inverse" } },
  args: { align: "center", tone: "white" },
  render: (args) => (
    <div className="rounded-5 bg-surface-inverse">
      <LogoLockup {...args} />
    </div>
  ),
};

/** The bare wordmark, for an artboard that carries the tagline somewhere else. */
export const WithoutTagline: Story = {
  args: { hasTagline: false },
};

/** The other brand line. Both are set copy — nothing else goes under the mark. */
export const AlternateTagline: Story = {
  args: { tagline: "Desi at heart. Urban by nature." },
};

/**
 * The exclusion zone made visible. Turn it off only when the parent already reserves the space,
 * as an artboard with `--canvas-pad` does.
 */
export const ClearSpace: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="rounded-4 bg-surface-page-alt">
        <LogoLockup {...args} size="sm" />
      </div>
      <div className="rounded-4 bg-surface-page-alt">
        <LogoLockup {...args} hasClearSpace={false} size="sm" />
      </div>
    </div>
  ),
};
