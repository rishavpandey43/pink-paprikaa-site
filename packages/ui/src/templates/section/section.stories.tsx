import type { Meta, StoryObj } from "@storybook/react-vite";

import { Section } from "./section";

function Band({ label, tone = "ink" }: { label: string; tone?: "ink" | "light" }) {
  return (
    <p
      className={
        tone === "light"
          ? "m-0 font-display text-subtitle1 font-bold text-text-on-brand"
          : "m-0 font-display text-subtitle1 font-bold text-text-heading"
      }
    >
      {label}
    </p>
  );
}

const meta = {
  title: "Templates/Section",
  component: Section,
  args: { children: <Band label="One page band" /> },
  argTypes: { as: { control: false } },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "One page band. It owns the vertical rhythm — clamp(56px, 7vw, 96px) — and wraps its " +
          "children in a Container. The band's background is set through `className` so the " +
          "layout itself stays colour-free; keep a page to two backgrounds, white or alt plus one " +
          "flooded brand or ink band.",
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** none · tight · default · loose — four rhythms, one token scale. */
export const Rhythm: Story = {
  render: () => (
    <div>
      <Section className="bg-surface-page" padding="none">
        <Band label="padding=none — the child sets its own rhythm" />
      </Section>
      <Section className="bg-surface-page-alt" padding="tight">
        <Band label="padding=tight — clamp(36px, 4vw, 56px)" />
      </Section>
      <Section className="bg-surface-page" padding="default">
        <Band label="padding=default — clamp(56px, 7vw, 96px)" />
      </Section>
      <Section className="bg-surface-sunken" padding="loose">
        <Band label="padding=loose — clamp(72px, 9vw, 128px)" />
      </Section>
    </div>
  ),
};

/** Backgrounds arrive through `className`, from the surface tokens only. */
export const Grounds: Story = {
  render: () => (
    <div>
      <Section className="bg-surface-page" padding="tight">
        <Band label="surface-page" />
      </Section>
      <Section className="bg-surface-page-alt" padding="tight">
        <Band label="surface-page-alt" />
      </Section>
      <Section className="bg-surface-sunken" padding="tight">
        <Band label="surface-sunken" />
      </Section>
      <Section className="bg-surface-brand" padding="tight">
        <Band label="surface-brand" tone="light" />
      </Section>
      <Section className="bg-surface-inverse" padding="tight">
        <Band label="surface-inverse" tone="light" />
      </Section>
    </div>
  ),
};

/** `size` reaches the inner Container; `bare` removes it when the child scrolls past the gutter. */
export const Widths: Story = {
  render: () => (
    <div>
      <Section className="bg-surface-page" size="prose" padding="tight">
        <Band label="size=prose — 64ch measure" />
      </Section>
      <Section className="bg-surface-page-alt" size="wide" padding="tight">
        <Band label="size=wide — 1440px" />
      </Section>
      <Section bare className="bg-surface-page" padding="tight">
        <div className="border-y border-dashed border-border-brand-soft px-6 py-4 font-body text-caption text-text-muted">
          bare — no Container, the child runs the full viewport width
        </div>
      </Section>
    </div>
  ),
};

/**
 * A flooded brand band constrains its own type: white on the brand pink measures 4.04:1, which
 * clears AA for large text (3:1) but not for normal text (4.5:1). So the eyebrow rides the band at
 * `subtitle1` bold rather than the 11.5px `overline` it would use on white — on pink, small caps
 * are unreadable to anyone who needs the contrast.
 */
export const InContext: Story = {
  render: () => (
    <div>
      <Section className="bg-surface-brand">
        <p className="m-0 font-display text-subtitle1 font-bold tracking-overline text-text-on-brand uppercase">
          Sector 57, Gurgaon
        </p>
        <h2 className="mt-3 mb-0 font-display text-h1-fluid font-bold text-text-on-brand">
          Chai first, decisions later.
        </h2>
      </Section>
      <Section className="bg-surface-page" size="prose">
        <p className="m-0 font-body text-body1-fluid text-text-body">
          Pink Paprikaa runs a 100% vegetarian kitchen — North Indian, Chinese, momos and chaat,
          most plates ₹180–₹320, counter open 8am – 11:30pm.
        </p>
      </Section>
    </div>
  ),
};
