import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Typography } from "../../atoms/typography/typography";
import { GAP_CLASS } from "../../lib/space";
import { VIEWPORT_360 } from "../../organisms/story-fixtures";
import { Box } from "../box/box";
import { Stack } from "../stack/stack";
import { Grid, GridItem } from "./grid";

/** A labelled, tinted cell so the column an item lands in is visible. */
function Cell({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm bg-pink-100 px-3 py-2 text-center font-body text-caption text-pink-800">
      {children}
    </div>
  );
}

/** A full row of `parts` columns summing to 12, one labelled cell each. */
function Row({ parts }: { parts: readonly (1 | 2 | 3 | 4 | 6 | 8 | 12)[] }) {
  return (
    <Grid>
      {parts.map((span, index) => (
        <GridItem key={`${String(span)}-${String(index)}`} span={span}>
          <Cell>{`span ${String(span)}`}</Cell>
        </GridItem>
      ))}
    </Grid>
  );
}

const meta = {
  title: "Layouts/Grid",
  component: Grid,
  args: {
    gap: undefined,
    children: Array.from({ length: 6 }, (_, index) => (
      <GridItem key={index} span={{ base: 12, sm: 6, lg: 4 }}>
        <Cell>{`Item ${String(index + 1)}`}</Cell>
      </GridItem>
    )),
  },
  argTypes: {
    columns: { control: "inline-radio", options: [12, 6, 4] },
    gap: { control: "select", options: [undefined, ...Object.keys(GAP_CLASS).map(Number)] },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A fixed-column page grid: 12 columns by default (`columns` also takes 6 and 4). Place children with `GridItem`, whose `span` and `start` take a column number or one per breakpoint (`{ base: 12, md: 6, lg: 4 }`, mobile first — an item with no `span` takes the whole row). `gap` is a spacing step; unset it is the fluid grid gap, 16–24px. For a grid of cards that drops columns by itself, use AutoGrid.",
      },
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Rows of 12, 6 + 6, 4 + 4 + 4 and 3 × 4: spans add up to the column count. */
export const TwelveColumn: Story = {
  render: () => (
    <Stack space={3}>
      <Row parts={[12]} />
      <Row parts={[6, 6]} />
      <Row parts={[4, 4, 4]} />
      <Row parts={[3, 3, 3, 3]} />
    </Stack>
  ),
};

/** One column on a phone, two from sm, three from lg. */
export const Responsive: Story = {
  render: () => (
    <Grid>
      {Array.from({ length: 6 }, (_, index) => (
        <GridItem key={index} span={{ base: 12, sm: 6, lg: 4 }}>
          <Cell>{`Dish ${String(index + 1)}`}</Cell>
        </GridItem>
      ))}
    </Grid>
  ),
};

/** The 8 + 4 page layout: the menu list beside a cart summary. */
export const Asymmetric: Story = {
  render: () => (
    <Grid>
      <GridItem span={{ base: 12, lg: 8 }}>
        <Stack as="ul" role="list" space={2}>
          <li>Paneer Tikka</li>
          <li>Dal Makhani</li>
          <li>Masala Chaas</li>
        </Stack>
      </GridItem>
      <GridItem as="section" aria-label="Your cart" span={{ base: 12, lg: 4 }}>
        <Box surface="soft" sx={{ p: 6, radius: "lg" }}>
          <Typography variant="h4" as="h3">
            Your cart
          </Typography>
          <Typography>3 items · ₹820</Typography>
        </Box>
      </GridItem>
    </Grid>
  ),
};

/** `start` offsets an item: from md it is eight columns wide, starting at column 3. */
export const Offset: Story = {
  render: () => (
    <Grid>
      <GridItem span={{ md: 8 }} start={{ md: 3 }}>
        <Cell>{"start md:3 · span md:8"}</Cell>
      </GridItem>
    </Grid>
  ),
};

/** A Grid inside a GridItem counts its own columns. */
export const Nested: Story = {
  render: () => (
    <Grid>
      <GridItem span={{ base: 12, md: 8 }}>
        <Grid>
          <GridItem span={6}>
            <Cell>nested 6</Cell>
          </GridItem>
          <GridItem span={6}>
            <Cell>nested 6</Cell>
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem span={{ base: 12, md: 4 }}>
        <Cell>outer 4</Cell>
      </GridItem>
    </Grid>
  ),
};

/** The floor: at 360px every item takes the full row and nothing scrolls sideways. */
export const At360: Story = {
  globals: VIEWPORT_360,
  render: () => (
    <Grid>
      {Array.from({ length: 6 }, (_, index) => (
        <GridItem key={index} span={{ base: 12, sm: 6, lg: 4 }}>
          <Cell>{`Item ${String(index + 1)}`}</Cell>
        </GridItem>
      ))}
    </Grid>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/^Item 2$/)).toBeVisible();
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
