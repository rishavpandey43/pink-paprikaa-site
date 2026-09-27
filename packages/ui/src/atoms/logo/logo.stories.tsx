import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { Logo } from "./logo";

const meta = {
  title: "Atoms/Logo",
  component: Logo,
  args: { variant: "lockup", tone: "pink" },
  parameters: {
    docs: {
      description: {
        component:
          "The only correct way to place the brand mark — never rebuild, retype or recolour it. `lockup` is the official logo and the default almost everywhere: the tagline “India's First Desi Urban Café” is drawn artwork, never live type, and it tucks beside the “P” descender, so the lockup and the wordmark share one ~1.9:1 box. Use `wordmark` only below ~120px wide, where the tagline turns to mud; `symbol` is the square diamond mark for avatars, favicons, loaders and tight badges. Tones: `pink` on light surfaces, `white` on pink or ink, `badge` on its own pink plate. Minimum lockup width 200px (wordmark 140px). Clear space around any logo = the height of the “P”. Never apply a filter, shadow, outline, rotation or opacity to the mark, and never place the pink logo on anything darker than pink-100.",
      },
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A labelled cell, matching the card's rows: the prop that produces what sits above it. */
function Specimen({ prop, children }: { prop: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="font-mono text-mono text-text-muted">{prop}</span>
    </div>
  );
}

export const Playground: Story = {};

/** Card rows "lockup", "wordmark" and "symbol": the three marks, side by side on white. */
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-8 bg-surface-page p-6">
      <Specimen prop='variant="lockup"'>
        <Logo {...args} variant="lockup" />
      </Specimen>
      <Specimen prop='variant="wordmark"'>
        <Logo {...args} variant="wordmark" />
      </Specimen>
      <Specimen prop='variant="symbol"'>
        <Logo {...args} variant="symbol" />
      </Specimen>
    </div>
  ),
};

/** Card rows "white", "on ink" and "badge": each tone on the only ground it belongs on. */
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-8 bg-surface-page p-6">
        <Specimen prop='tone="pink"'>
          <Logo tone="pink" />
        </Specimen>
        <Specimen prop='tone="pink" variant="symbol"'>
          <Logo tone="pink" variant="symbol" />
        </Specimen>
      </div>
      <div
        data-surface="brand"
        className="flex flex-wrap items-end gap-8 rounded-lg bg-surface-brand p-6"
      >
        <Specimen prop='tone="white" (on pink)'>
          <Logo tone="white" />
        </Specimen>
        <Specimen prop='tone="white" variant="wordmark"'>
          <Logo tone="white" variant="wordmark" />
        </Specimen>
        <Specimen prop='tone="white" variant="symbol"'>
          <Logo tone="white" variant="symbol" />
        </Specimen>
      </div>
      <div
        data-surface="ink"
        className="flex flex-wrap items-end gap-8 rounded-lg bg-surface-inverse p-6"
      >
        <Specimen prop='tone="white" (on ink)'>
          <Logo tone="white" />
        </Specimen>
      </div>
      <div className="flex flex-wrap items-end gap-8 bg-surface-page p-6">
        <Specimen prop='tone="badge"'>
          <Logo tone="badge" className="w-40" />
        </Specimen>
        <Specimen prop='tone="badge" variant="wordmark"'>
          <Logo tone="badge" variant="wordmark" className="w-40" />
        </Specimen>
        <Specimen prop='tone="badge" variant="symbol"'>
          <Logo tone="badge" variant="symbol" className="w-18" />
        </Specimen>
      </div>
    </div>
  ),
};

/** Card row "min size": the default 240px lockup beside its 200px floor (`className="w-50"`). */
export const ClearSpace: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-8 bg-surface-page p-6">
      <Specimen prop="default (w-logo-lockup, 240px)">
        <Logo />
      </Specimen>
      <Specimen prop='className="w-50" — the 200px minimum'>
        <Logo className="w-50" />
      </Specimen>
    </div>
  ),
};
