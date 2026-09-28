import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Text } from "../../atoms/text/text";
import { GAP_CLASS } from "../../lib/space";
import { Stack } from "./stack";

/** The card's demo chip. */
function Chip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm bg-pink-100 px-3 py-2 font-body text-caption text-pink-800">
      {children}
    </div>
  );
}

const LONG_WORD = "Paprikaa".repeat(8);

const meta = {
  title: "Layouts/Stack",
  component: Stack,
  args: {
    space: 4,
    isDivided: false,
    children: [
      <Chip key="plates">Small Plates</Chip>,
      <Chip key="day">All Day</Chip>,
      <Chip key="sweets">Sweets</Chip>,
    ],
  },
  argTypes: { space: { control: "select", options: Object.keys(GAP_CLASS).map(Number) } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Vertical spacing. Use this instead of margins so edits survive. `space` is the step number and the step IS the multiple of 4px — `space={6}` is 24px; half steps 0.5 and 1.5 exist. `isDivided` adds the hairline rules used between menu rows and list items (as `ul`/`ol` the rules are hidden list items, so the list stays valid).",
      },
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Space2: Story = {
  name: "space={2} · 8px",
  args: {
    space: 2,
    children: [<Chip key="a">8px</Chip>, <Chip key="b">8px</Chip>, <Chip key="c">8px</Chip>],
  },
};

export const Space6: Story = {
  name: "space={6} · 24px",
  args: { space: 6, children: [<Chip key="a">24px</Chip>, <Chip key="b">24px</Chip>] },
};

export const Divided: Story = {
  name: "isDivided",
  args: {
    space: 3,
    isDivided: true,
    children: [
      <Chip key="a">hairline between</Chip>,
      <Chip key="b">hairline between</Chip>,
      <Chip key="c">hairline between</Chip>,
    ],
  },
};

/** The step scale at work, half step included: 2px · 8px · 24px · 48px (dev parity). */
export const Steps: Story = {
  name: "space — 0.5 · 2 · 6 · 12",
  render: () => (
    <Stack space={8}>
      {([0.5, 2, 6, 12] as const).map((space) => (
        <Stack key={space} space={space}>
          <Chip>{`space={${String(space)}} · ${String(space * 4)}px`}</Chip>
          <Chip>{`space={${String(space)}} · ${String(space * 4)}px`}</Chip>
        </Stack>
      ))}
    </Stack>
  ),
};

/** `align` is each row's inline alignment; `stretch` (the default) fills the width (dev parity). */
export const Align: Story = {
  name: "align",
  render: () => (
    <Stack space={6}>
      {(["start", "center", "end", "stretch"] as const).map((align) => (
        <Stack key={align} align={align} space={2}>
          <Chip>{`align="${align}"`}</Chip>
          <Chip>{`align="${align}"`}</Chip>
        </Stack>
      ))}
    </Stack>
  ),
};

/** A divided real list: the rules are hidden list items, so the list stays valid (dev parity). */
export const DividedList: Story = {
  name: 'isDivided as="ul"',
  render: () => (
    <Stack as="ul" space={3} isDivided>
      {["Paprikaa Chilli Paneer", "Masala Cold Brew", "Small Plates"].map((item) => (
        <li key={item} className="font-body text-body-sm text-text-body">
          {item}
        </li>
      ))}
    </Stack>
  ),
};

/** The rule is `border-subtle`, which each surface remaps — white at 22% on brand and ink. */
export const DividedOnSurfaces: Story = {
  name: "isDivided on brand and ink",
  render: () => (
    <div className="grid gap-4">
      <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
        <Stack space={3} isDivided>
          <Text>Paprikaa Chilli Paneer</Text>
          <Text>Masala Cold Brew</Text>
          <Text>Small Plates</Text>
        </Stack>
      </div>
      <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
        <Stack space={3} isDivided>
          <Text>Paprikaa Chilli Paneer</Text>
          <Text>Masala Cold Brew</Text>
          <Text>Small Plates</Text>
        </Stack>
      </div>
    </div>
  ),
};

/** Readme §3.10 at the floor: a long word overflows its row; it never widens the stack. */
export const LongWordAt360: Story = {
  name: "360px — a long word never widens the stack",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Stack data-testid="stack">
      <Chip>Small Plates</Chip>
      <div data-testid="row">{LONG_WORD}</div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stackWidth = canvas.getByTestId("stack").getBoundingClientRect().width;
    await expect(canvas.getByTestId("row").getBoundingClientRect().width).toBeLessThanOrEqual(
      stackWidth + 0.5
    );
  },
};
