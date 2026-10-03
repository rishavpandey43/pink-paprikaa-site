import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Typography } from "../../atoms/typography/typography";
import { VIEWPORT_360 } from "../../organisms/story-fixtures";
import { Box } from "./box";

const SURFACES = ["page", "alt", "sunken", "soft", "brand", "ink"] as const;

const meta = {
  title: "Layouts/Box",
  component: Box,
  args: {
    surface: "soft",
    sx: { p: 6, radius: "lg", border: true },
    children: <Typography>Pure veg, since day one — no egg, ever.</Typography>,
  },
  argTypes: {
    surface: { control: "select", options: [undefined, ...SURFACES] },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A polymorphic wrapper: `as`, `surface` and `sx`. MUI's Box, token-only. `surface` sets `data-surface` and its ground, so text inside follows it; everything else (padding, radius, border, shadow, display) is a token-typed `sx` key, responsive with `{ base, sm, md, lg, xl }`. Spacing between children belongs to Stack, Cluster or Grid.",
      },
    },
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** All six surfaces: each sets `data-surface`, so the text inside follows it. */
export const Surfaces: Story = {
  render: () => (
    <div className="grid gap-3">
      {SURFACES.map((surface) => (
        <Box key={surface} surface={surface} sx={{ p: 6, radius: "lg" }}>
          <Typography variant="h4" as="h3">{`surface="${surface}"`}</Typography>
          <Typography>Paneer Tikka, Dal Makhani, Masala Chaas.</Typography>
        </Box>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const boxes = canvasElement.querySelectorAll("[data-surface]");
    await expect([...boxes].map((box) => box.getAttribute("data-surface"))).toEqual([
      "light",
      "light",
      "light",
      "soft",
      "brand",
      "ink",
    ]);
  },
};

/** `as` changes the element, never the look: a landmark section and a real list. */
export const AsElement: Story = {
  render: () => (
    <div className="grid gap-3">
      <Box as="section" aria-label="Today's special" sx={{ p: 6, border: true, radius: "lg" }}>
        <Typography>Shahi Paneer with butter naan.</Typography>
      </Box>
      <Box as="ul" role="list" surface="soft" sx={{ p: 4, radius: "md" }}>
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

/** Responsive `sx`: 16px padding and a block layout below md, 32px and a row from md up. */
export const Responsive: Story = {
  globals: VIEWPORT_360,
  args: { sx: { p: { base: 4, md: 8 }, display: { base: "block", md: "flex" } } },
  render: (args) => <Box {...args} data-testid="box" />,
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByTestId("box");
    await expect(getComputedStyle(box).padding).toBe("16px");
    await expect(getComputedStyle(box).display).toBe("block");
    await expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth);
  },
};
