import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Text } from "../../atoms/text/text";
import { Stack } from "../stack/stack";
import { Section, type SectionTone } from "./section";

const TONES: { tone: SectionTone; label: string }[] = [
  { tone: "page", label: 'tone="page"' },
  { tone: "alt", label: 'tone="alt" · pink-50' },
  { tone: "sunken", label: 'tone="sunken"' },
  { tone: "soft", label: 'tone="soft" · pink-100' },
  { tone: "brand", label: 'tone="brand"' },
  { tone: "ink", label: 'tone="ink"' },
];

const RHYTHM = [
  { space: "none", tone: "page", label: 'space="none" · 0' },
  { space: "tight", tone: "alt", label: 'space="tight" · clamp(36px, 4vw, 56px)' },
  { space: "default", tone: "page", label: 'space="default" · clamp(48px, 8vw, 96px)' },
  { space: "loose", tone: "alt", label: 'space="loose" · clamp(72px, 9vw, 128px)' },
] as const;

const PATTERNS = [
  { tone: "brand", pattern: "default", label: 'tone="brand" pattern="default"' },
  { tone: "ink", pattern: "faint", label: 'tone="ink" pattern="faint" · the handoff ink band' },
  { tone: "soft", pattern: "default", label: 'tone="soft" pattern="default"' },
  { tone: "alt", pattern: "default", label: 'tone="alt" pattern="default"' },
] as const;

const meta = {
  title: "Layouts/Section",
  component: Section,
  args: {
    tone: "page",
    pattern: "none",
    size: "content",
    space: "default",
    isBare: false,
    children: (
      <Text variant="h4" as="div">
        One page band
      </Text>
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'One page band. Owns the background colour and the vertical rhythm, and sets `data-surface` so text inside follows the band — no `tone="inverse"` needed on brand or ink. Light tones set the light surface explicitly, so a light band nested in a dark one restores dark text. Maximum two background colours per page: white/alt plus one flooded brand or ink band. `pattern` lays the diamond tile behind the band (`faint` on ink, as the handoff pages do). Content sits in a Container (`size`) unless `isBare`. Sections are what RevealObserver reveals.',
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card rows: every tone at `space="tight"`; the label's colour comes from the surface. */
export const Tones: Story = {
  name: "tone (text follows the surface)",
  render: () => (
    <div>
      {TONES.map(({ tone, label }) => (
        <Section key={tone} tone={tone} space="tight">
          <Text variant="h4" as="div">
            {label}
          </Text>
        </Section>
      ))}
    </div>
  ),
};

export const TonesAt360: Story = {
  ...Tones,
  name: "360px — tones at the floor (tight = 36px)",
  globals: { viewport: { value: "floor360", isRotated: false } },
};

export const Rhythm: Story = {
  name: "space (vertical rhythm)",
  render: () => (
    <div>
      {RHYTHM.map(({ space, tone, label }) => (
        <Section key={space} space={space} tone={tone}>
          <Text variant="body" as="div">
            {label}
          </Text>
        </Section>
      ))}
    </div>
  ),
};

export const Patterns: Story = {
  name: "pattern",
  render: () => (
    <div>
      {PATTERNS.map(({ tone, pattern, label }) => (
        <Section key={tone} tone={tone} pattern={pattern}>
          <Text variant="h4" as="div">
            {label}
          </Text>
        </Section>
      ))}
    </div>
  ),
};

/** `size` reaches the inner Container; `isBare` removes it so the child runs full width (dev parity). */
export const Widths: Story = {
  name: "size and isBare",
  render: () => (
    <div>
      <Section size="prose" space="tight">
        <Text as="div">{'size="prose" · 64ch measure'}</Text>
      </Section>
      <Section size="wide" space="tight" tone="alt">
        <Text as="div">{'size="wide" · 1440px'}</Text>
      </Section>
      <Section isBare space="tight">
        <div className="border-y border-dashed border-border-default px-6 py-4">
          <Text as="div" variant="caption" tone="muted">
            isBare · no Container, the child runs the full width
          </Text>
        </div>
      </Section>
    </div>
  ),
};

/** In context: one flooded brand band, then a prose page band — the two-background maximum (dev parity). */
export const InContext: Story = {
  name: "in context — brand band, then prose",
  render: () => (
    <div>
      <Section tone="brand" pattern="default">
        <Stack space={3}>
          <Text variant="overline" as="p">
            Sector 57, Gurgaon
          </Text>
          <Text variant="h1" as="h2">
            Chai first, decisions later.
          </Text>
        </Stack>
      </Section>
      <Section size="prose">
        <Text>
          Pink Paprikaa runs a 100% vegetarian kitchen: North Indian, Chinese, momos and chaat.
        </Text>
      </Section>
    </div>
  ),
};

/**
 * Review Focus 2: a page band inside an ink band is a light island — its text is exactly the
 * top-level page band's colour, and its background is the page surface again, not ink.
 */
export const NestedSurfaces: Story = {
  name: "nested — a light band inside an ink band",
  render: () => (
    <div>
      <Section tone="page" space="tight" data-testid="page">
        <Text data-testid="page-text">A top-level page band</Text>
      </Section>
      <Section tone="ink" space="tight">
        <Stack space={6}>
          <Text data-testid="ink-text">An ink band</Text>
          <Section tone="page" space="tight" data-testid="island">
            <Text data-testid="island-text">A light island inside it</Text>
          </Section>
        </Stack>
      </Section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = (id: string) => getComputedStyle(canvas.getByTestId(id));
    await expect(style("island-text").color).toBe(style("page-text").color);
    await expect(style("ink-text").color).not.toBe(style("page-text").color);
    await expect(style("island").backgroundColor).toBe(style("page").backgroundColor);
  },
};
