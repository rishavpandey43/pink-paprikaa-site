import type { Meta, StoryObj } from "@storybook/react-vite";

import { User } from "lucide-react";

import { Avatar } from "./avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { name: "Aditi Rao" },
  argTypes: {
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Circular mark for guest accounts, reviews and staff credits. With no photo it falls " +
          "back to initials in Poppins Bold on soft pink — never a square, never a hashed colour " +
          "block.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 24 / 32 / 40 / 56 / 80px — fixed diameters, so a row of avatars never jitters. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar {...args} size="xs" />
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
      <Avatar {...args} size="xl" />
    </div>
  ),
};

/** Two letters at most: the first letter of the first two words. */
export const Initials: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar {...args} name="Aditi Rao" />
      <Avatar {...args} name="Kabir" />
      <Avatar {...args} name="Meera S Iyer" />
    </div>
  ),
};

/** The signed-out placeholder. A glyph wins over initials, so pass one or the other. */
export const GlyphFallback: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar icon={User} size="sm" />
      <Avatar icon={User} />
      <Avatar icon={User} size="lg" />
    </div>
  ),
};

/** The pink halo marks the signed-in guest, and nothing else. */
export const Ring: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar {...args} hasRing size="sm" />
      <Avatar {...args} hasRing />
      <Avatar {...args} hasRing size="lg" />
    </div>
  ),
};

/**
 * With a `src` the photo replaces the initials the moment it decodes. The path below is
 * deliberately unresolvable in Storybook, so this story doubles as the failed-photo case: the
 * initials hold the space instead of the layout collapsing.
 */
export const Photo: Story = {
  args: { src: "/images/guests/aditi-rao.jpg" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Avatar {...args} size="sm" />
      <Avatar {...args} />
      <Avatar {...args} hasRing size="lg" />
    </div>
  ),
};

/** How it lands in a review row — avatar, name, then the note. */
export const InAReviewRow: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="flex max-w-96 items-center gap-3 rounded-4 bg-surface-card p-4 shadow-elevation1">
      <Avatar {...args} size="lg" />
      <div className="min-w-0">
        <p className="m-0 font-display text-subtitle2 font-bold text-text-heading">Aditi Rao</p>
        <p className="m-0 font-body text-caption text-text-muted">
          Ordered the paneer tikka thali · ₹280
        </p>
      </div>
    </div>
  ),
};
