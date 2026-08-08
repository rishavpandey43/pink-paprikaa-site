import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stack } from "./stack";

function Slab({ label }: { label: string }) {
  return (
    <div className="rounded-2 bg-brand-tint px-3 py-2 font-body text-caption text-text-body">
      {label}
    </div>
  );
}

const meta = {
  title: "Templates/Stack",
  component: Stack,
  args: {
    children: (
      <>
        <Slab label="Paprikaa Chilli Paneer" />
        <Slab label="Tandoori Momos" />
        <Slab label="Masala Cold Brew" />
      </>
    ),
  },
  argTypes: { as: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Vertical rhythm as a gap, never as margins — which is what lets a child be reordered or " +
          "removed without leaving a hole. The step number is the multiple of 4px, so `space={6}` " +
          "is 24px, and `hasDivider` adds the hairline rules used between menu rows.",
      },
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every step on the 4px scale the Stack accepts, half steps included. */
export const Spacing: Story = {
  render: () => (
    <Stack space={8}>
      <Stack space={0.5}>
        <Slab label="space=0.5 — 2px" />
        <Slab label="space=0.5 — 2px" />
      </Stack>
      <Stack space={2}>
        <Slab label="space=2 — 8px" />
        <Slab label="space=2 — 8px" />
      </Stack>
      <Stack space={6}>
        <Slab label="space=6 — 24px" />
        <Slab label="space=6 — 24px" />
      </Stack>
      <Stack space={12}>
        <Slab label="space=12 — 48px" />
        <Slab label="space=12 — 48px" />
      </Stack>
    </Stack>
  ),
};

/** `align` runs across the inline axis; `stretch` is the default and fills the width. */
export const Align: Story = {
  render: () => (
    <Stack space={6}>
      <Stack align="start" space={2}>
        <Slab label="align=start" />
        <Slab label="align=start" />
      </Stack>
      <Stack align="center" space={2}>
        <Slab label="align=center" />
        <Slab label="align=center" />
      </Stack>
      <Stack align="end" space={2}>
        <Slab label="align=end" />
        <Slab label="align=end" />
      </Stack>
      <Stack align="stretch" space={2}>
        <Slab label="align=stretch — the default" />
        <Slab label="align=stretch — the default" />
      </Stack>
    </Stack>
  ),
};

/** The hairline list — menu rows, order lines, an outlet list. */
export const WithDividers: Story = {
  render: () => (
    <Stack as="ul" hasDivider space={3}>
      <li className="font-body text-body2 text-text-body">Paprikaa Chilli Paneer · ₹280</li>
      <li className="font-body text-body2 text-text-body">Tandoori Momos · ₹220</li>
      <li className="font-body text-body2 text-text-body">Masala Cold Brew · ₹180</li>
    </Stack>
  ),
};

/** At 360px the stack never wraps or clips — it is one column by construction. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  render: () => (
    <div className="w-80">
      <Stack space={3}>
        <Slab label="Small Plates" />
        <Slab label="A category label long enough to wrap onto two lines" />
        <Slab label="Sweets" />
      </Stack>
    </div>
  ),
};
