import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Container, type ContainerSize } from "./container";

/** The card's demo box: a dashed pink block showing where the frame's content box sits. */
function Box({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-pink-300 bg-pink-100 p-3 font-body text-caption text-pink-800">
      {children}
    </div>
  );
}

const SIZES: { size: ContainerSize; note: string }[] = [
  { size: "content", note: "1200px (design system size=default)" },
  { size: "prose", note: "64ch — long-form copy" },
  { size: "wide", note: "1440px" },
  { size: "narrow", note: "960px (handoff)" },
  { size: "article", note: "760px (handoff)" },
  { size: "full", note: "no cap" },
];

const meta = {
  title: "Layouts/Container",
  component: Container,
  args: {
    size: "content",
    isBleed: false,
    children: <Box>max-width 1200 · gutter clamp(20px, 4vw, 40px)</Box>,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The only correct way to constrain page width. `content` caps at 1200px with the fluid gutter clamp(20px, 4vw, 40px). Use `size="prose"` for long-form copy so the measure stays readable; `narrow` (960) and `article` (760) come from the handoff; `full` removes the cap. `isBleed` drops the gutters for a child that must run edge to edge.',
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card rows: each size with `isBleed`, so the box shows the cap itself. */
export const Sizes: Story = {
  name: "size (isBleed, as on the card)",
  render: () => (
    <div className="grid gap-4 py-6">
      {SIZES.map(({ size, note }) => (
        <Container key={size} size={size} isBleed>
          <Box>{`size="${size}" · ${note}`}</Box>
        </Container>
      ))}
    </div>
  ),
};

/** The gutter at work: the dashed box sits one fluid gutter in from each edge of the tinted band. */
export const Gutter: Story = {
  name: "gutter (default)",
  render: () => (
    <div className="bg-surface-page-alt py-6">
      <Container>
        <Box>gutter clamp(20px, 4vw, 40px) either side</Box>
      </Container>
    </div>
  ),
};

/** Review Focus 4: at the 360px floor the gutter is exactly 20px and nothing scrolls sideways. */
export const AtTheFloor: Story = {
  name: "360px — 20px gutter",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Container data-testid="frame">
      <Box>Every design survives 360px.</Box>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByTestId("frame"));
    await expect(style.paddingLeft).toBe("20px");
    await expect(style.paddingRight).toBe("20px");
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** At 1280px the gutter has grown to its 40px ceiling (4vw would be 51.2px). */
export const AtDesktop: Story = {
  name: "1280px — 40px gutter",
  globals: { viewport: { value: "xl", isRotated: false } },
  render: () => (
    <Container data-testid="frame">
      <Box>max-width 1200 · gutter 40px</Box>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    await expect(window.innerWidth).toBe(1280);
    const style = getComputedStyle(within(canvasElement).getByTestId("frame"));
    await expect(style.paddingLeft).toBe("40px");
    await expect(style.paddingRight).toBe("40px");
  },
};

/** In context: a prose Container keeps an About page readable at desktop width (dev parity). */
export const InContext: Story = {
  name: 'in context — size="prose" as="article"',
  render: () => (
    <div className="bg-surface-page-alt py-12">
      <Container as="article" size="prose">
        <h2 className="font-display text-h2 text-text-heading">A kitchen in Sector 57</h2>
        <p className="mt-4 font-body text-body text-text-body">
          Pink Paprikaa cooks North Indian, Chinese, momos and chaat in one 100% vegetarian kitchen.
        </p>
      </Container>
    </div>
  ),
};
