import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import type { SurfaceProp } from "../../lib/common-props";

import { Typography } from "../../atoms/typography/typography";
import { Stack } from "../stack/stack";
import { Section } from "./section";

const SURFACES: { surface: SurfaceProp; label: string }[] = [
  { surface: "page", label: 'surface="page"' },
  { surface: "alt", label: 'surface="alt" · pink-50' },
  { surface: "sunken", label: 'surface="sunken"' },
  { surface: "soft", label: 'surface="soft" · pink-100' },
  { surface: "brand", label: 'surface="brand"' },
  { surface: "ink", label: 'surface="ink"' },
];

const RHYTHM = [
  { space: "none", surface: "page", label: 'space="none" · 0' },
  { space: "tight", surface: "alt", label: 'space="tight" · clamp(36px, 4vw, 56px)' },
  { space: "default", surface: "page", label: 'space="default" · clamp(48px, 8vw, 96px)' },
  { space: "loose", surface: "alt", label: 'space="loose" · clamp(72px, 9vw, 128px)' },
] as const;

const PATTERNS = [
  { surface: "brand", pattern: "default", label: 'surface="brand" pattern="default"' },
  {
    surface: "ink",
    pattern: "faint",
    label: 'surface="ink" pattern="faint" · the handoff ink band',
  },
  { surface: "soft", pattern: "default", label: 'surface="soft" pattern="default"' },
  { surface: "alt", pattern: "default", label: 'surface="alt" pattern="default"' },
] as const;

const meta = {
  title: "Layouts/Section",
  component: Section,
  args: {
    surface: "page",
    pattern: "none",
    size: "content",
    space: "default",
    isBare: false,
    children: (
      <Typography variant="h4" as="div">
        One page band
      </Typography>
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "One page band. Owns the background colour and the vertical rhythm, and sets `data-surface` so text inside follows the band — no inverse tone needed on brand or ink. Light surfaces set the light surface explicitly, so a light band nested in a dark one restores dark text. Maximum two background colours per page: white/alt plus one flooded brand or ink band. `pattern` lays the diamond tile behind the band (`faint` on ink, as the handoff pages do). Content sits in a Container (`size`) unless `isBare`. Sections are what RevealObserver reveals.",
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card rows: every surface at `space="tight"`; the label's colour comes from the surface. */
export const Surfaces: Story = {
  name: "surface (text follows the surface)",
  render: () => (
    <div>
      {SURFACES.map(({ surface, label }) => (
        <Section key={surface} surface={surface} space="tight">
          <Typography variant="h4" as="div">
            {label}
          </Typography>
        </Section>
      ))}
    </div>
  ),
};

export const SurfacesAt360: Story = {
  ...Surfaces,
  name: "360px — surfaces at the floor (tight = 36px)",
  globals: { viewport: { value: "floor360", isRotated: false } },
};

export const Rhythm: Story = {
  name: "space (vertical rhythm)",
  render: () => (
    <div>
      {RHYTHM.map(({ space, surface, label }) => (
        <Section key={space} space={space} surface={surface}>
          <Typography variant="body" as="div">
            {label}
          </Typography>
        </Section>
      ))}
    </div>
  ),
};

export const Patterns: Story = {
  name: "pattern",
  render: () => (
    <div>
      {PATTERNS.map(({ surface, pattern, label }) => (
        <Section key={surface} surface={surface} pattern={pattern}>
          <Typography variant="h4" as="div">
            {label}
          </Typography>
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
        <Typography as="div">{'size="prose" · 64ch measure'}</Typography>
      </Section>
      <Section size="wide" space="tight" surface="alt">
        <Typography as="div">{'size="wide" · 1440px'}</Typography>
      </Section>
      <Section isBare space="tight">
        <div className="border-y border-dashed border-border-default px-6 py-4">
          <Typography as="div" variant="caption" color="muted">
            isBare · no Container, the child runs the full width
          </Typography>
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
      <Section surface="brand" pattern="default">
        <Stack space={3}>
          <Typography variant="overline" as="p">
            Sector 57, Gurgaon
          </Typography>
          <Typography variant="h1" as="h2">
            Chai first, decisions later.
          </Typography>
        </Stack>
      </Section>
      <Section size="prose">
        <Typography>
          Pink Paprikaa runs a 100% vegetarian kitchen: North Indian, Chinese, momos and chaat.
        </Typography>
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
      <Section surface="page" space="tight" data-testid="page">
        <Typography data-testid="page-text">A top-level page band</Typography>
      </Section>
      <Section surface="ink" space="tight">
        <Stack space={6}>
          <Typography data-testid="ink-text">An ink band</Typography>
          <Section surface="page" space="tight" data-testid="island">
            <Typography data-testid="island-text">A light island inside it</Typography>
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
