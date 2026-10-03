import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Text } from "../../atoms/text/text";
import { GAP_CLASS } from "../../lib/space";
import { VIEWPORT_360 } from "../../organisms/story-fixtures";
import { Box } from "./box";

const STEPS = Object.keys(GAP_CLASS).map(Number);

const meta = {
  title: "Layouts/Box",
  component: Box,
  args: {
    padding: 6,
    surface: "soft",
    radius: "lg",
    children: <Text>Pure veg, since day one — no egg, ever.</Text>,
  },
  argTypes: {
    padding: { control: "select", options: STEPS },
    paddingX: { control: "select", options: STEPS },
    paddingY: { control: "select", options: STEPS },
    shadow: { control: "select", options: [undefined, 1, 2, 3, 4] },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A wrapper with token-only props: `padding`/`paddingX`/`paddingY` steps (N × 4px), a `surface` (sets `data-surface` and its ground — Section's mapping), a `radius`, a `hasBorder` hairline and a `shadow` step. Not a style escape hatch: no `sx`, no arbitrary values. Spacing between children belongs to Stack, Cluster or Grid.",
      },
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** All four surfaces: each sets `data-surface`, so the text inside follows it. */
export const Surfaces: Story = {
  render: () => (
    <div className="grid gap-3">
      {(["light", "soft", "brand", "ink"] as const).map((surface) => (
        <Box
          key={surface}
          surface={surface}
          padding={6}
          radius="lg"
          hasBorder={surface === "light"}
        >
          <Text>{`surface="${surface}" — Paneer Tikka, Dal Makhani, Masala Chaas`}</Text>
        </Box>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const boxes = canvasElement.querySelectorAll("[data-surface]");
    await expect([...boxes].map((box) => box.getAttribute("data-surface"))).toEqual([
      "light",
      "soft",
      "brand",
      "ink",
    ]);
  },
};

/** The padding scale: the step IS the multiple of 4px. */
export const PaddingScale: Story = {
  render: () => (
    <div className="grid gap-3">
      {([2, 4, 6, 8, 12] as const).map((padding) => (
        <Box key={padding} padding={padding} surface="soft" radius="md">
          <Text>{`padding={${String(padding)}} · ${String(padding * 4)}px`}</Text>
        </Box>
      ))}
    </div>
  ),
};

/** `as` changes the element, never the look: a landmark section and a real list. */
export const AsElement: Story = {
  render: () => (
    <div className="grid gap-3">
      <Box as="section" aria-label="Today's special" padding={6} hasBorder radius="lg" shadow={1}>
        <Text>Shahi Paneer with butter naan.</Text>
      </Box>
      <Box as="ul" role="list" padding={4} surface="soft" radius="md">
        <Box as="li">Jain thali</Box>
        <Box as="li">No onion-garlic dal</Box>
      </Box>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Today's special" })).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(2);
  },
};

/** The floor: padding never pushes the box past a 360px viewport. */
export const Mobile360: Story = {
  globals: VIEWPORT_360,
  args: { padding: 8 },
  render: (args) => <Box {...args} data-testid="box" />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByTestId("box");
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
  },
};
