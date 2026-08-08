import type { Meta, StoryObj } from "@storybook/react-vite";

import { Container } from "./container";

/** A ruled placeholder so the frame the Container draws is visible without it painting anything. */
function Fill({ label }: { label: string }) {
  return (
    <div className="rounded-3 border border-dashed border-border-brand-soft bg-brand-tint p-3 font-body text-caption text-text-muted">
      {label}
    </div>
  );
}

const meta = {
  title: "Templates/Container",
  component: Container,
  args: { children: <Fill label="Page content" /> },
  argTypes: { as: { control: false } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The only correct way to constrain page width: 1200px max with a clamp(20px, 4vw, 40px) " +
          "gutter, centred. It carries width and spacing only — background colour belongs to the " +
          'Section around it. Reach for `size="prose"` on long-form copy so the measure stays ' +
          "readable.",
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 1200 · 1440 · 64ch · 100% — four caps, one gutter. */
export const Sizes: Story = {
  render: () => (
    <div className="grid gap-6 py-6">
      <Container size="default">
        <Fill label="default — 1200px, the standard page band" />
      </Container>
      <Container size="wide">
        <Fill label="wide — 1440px, gallery and dashboard bands" />
      </Container>
      <Container size="prose">
        <Fill label="prose — 64ch, long-form copy" />
      </Container>
      <Container size="full">
        <Fill label="full — 100%, gutter only" />
      </Container>
    </div>
  ),
};

/** `isFullBleed` keeps the cap but drops the gutter, so a photo band can touch both edges. */
export const Bleed: Story = {
  render: () => (
    <div className="grid gap-6 py-6">
      <Container>
        <Fill label="gutter — clamp(20px, 4vw, 40px)" />
      </Container>
      <Container isFullBleed>
        <Fill label="full bleed — edge to edge" />
      </Container>
    </div>
  ),
};

/** A prose Container is what keeps an About page readable at desktop width. */
export const InContext: Story = {
  render: () => (
    <div className="bg-surface-page-alt py-12">
      <Container as="article" size="prose">
        <h2 className="m-0 font-display text-h2 font-bold text-text-heading">
          A Kitchen in Sector 57
        </h2>
        <p className="mt-4 font-body text-body1 text-text-body">
          Pink Paprikaa cooks North Indian, Chinese, momos and chaat in one 100% vegetarian kitchen.
          Most plates land between ₹180–₹320, and the counter runs 8am – 11:30pm.
        </p>
      </Container>
    </div>
  ),
};
