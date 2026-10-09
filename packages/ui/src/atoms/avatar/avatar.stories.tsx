import type { Meta, StoryObj } from "@storybook/react-vite";
import { User } from "lucide-react";

import symbolPink from "../../assets/brand/symbol-pink.svg";
import { Avatar } from "./avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  args: { name: "Aditi Rao", size: "md" },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Circular avatar for guest accounts, reviews and staff credits. No photo → initials in Poppins 700 on pink-100. Never square, never a coloured random-hash background. `hasRing` marks the signed-in guest. With a `name` it is an image named by that name; without one it is decorative.",
      },
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Avatar key={size} name="Aditi Rao" size={size} />
      ))}
    </div>
  ),
};

export const Initials: Story = {
  name: "name (initials)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aditi Rao" />
      <Avatar name="Kabir" />
      <Avatar name="Meera S Iyer" />
    </div>
  ),
};

export const IconFallback: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar icon={User} />
      <Avatar icon={User} size="lg" />
    </div>
  ),
};

export const Ring: Story = {
  name: "hasRing",
  args: { name: "Aditi Rao", size: "lg", hasRing: true },
};

/**
 * With `src` the photo covers the initials once it decodes. The second path is deliberately
 * unresolvable: it is the failed-photo case, where the initials hold the space.
 */
export const Photo: Story = {
  name: "src (and a failed photo)",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Avatar name="Aditi Rao" src={symbolPink} size="lg" />
      <Avatar name="Kabir" src="/missing/guest-photo.jpg" size="lg" hasRing />
    </div>
  ),
};

/** In context: a signed-in guest row. */
export const InAGuestRow: Story = {
  name: "in context: a signed-in guest row",
  render: () => (
    <div className="flex max-w-96 items-center gap-3 rounded-lg bg-surface-card p-4 shadow-1">
      <Avatar name="Aditi Rao" size="lg" hasRing />
      <div className="min-w-0">
        <p className="m-0 font-display text-body font-bold text-text-heading">Aditi Rao</p>
        <p className="m-0 font-body text-caption text-text-muted">Signed in · 3 orders</p>
      </div>
    </div>
  ),
};
