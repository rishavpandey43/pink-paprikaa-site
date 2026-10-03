import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Box, Cluster, type Sx, Typography } from "@pink-paprikaa-web/ui";

/** Live visuals for the System (sx) page. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Foundations/System specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface ExampleProps {
  label: string;
  sx: Sx;
  testId?: string;
  children: ReactNode;
}

/** A labelled live Box with the exact `sx` object that styles it printed beside it. */
function Example({ label, sx, testId, children }: ExampleProps) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-2">
      <Box sx={sx} data-testid={testId}>
        {children}
      </Box>
      <div className="flex min-w-0 flex-col gap-1">
        <Typography variant="overline" color="muted" as="span">
          {label}
        </Typography>
        <Typography variant="mono">{`sx={${JSON.stringify(sx)}}`}</Typography>
      </div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <Box
      as="span"
      sx={{ px: 3, py: 1.5, radius: "pill", bg: "card", border: true }}
      data-testid="chip"
    >
      {children}
    </Box>
  );
}

export const Spacing: Story = {
  render: () => (
    <Example label="Spacing · m p gap" sx={{ p: 6, mb: 2, radius: "lg", bg: "soft" }}>
      <Typography>
        Padding 6 → 24px of the spacing scale; margin and gap take the same steps.
      </Typography>
    </Example>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector("div.p-6");
    await expect(box).not.toBeNull();
    await expect(box).toHaveClass("mb-2");
  },
};

export const Display: Story = {
  render: () => (
    <Example label="Display · flex + gap" sx={{ display: "flex", gap: 3, p: 4, bg: "sunken" }}>
      <Chip>Paneer</Chip>
      <Chip>Dal</Chip>
      <Chip>Naan</Chip>
    </Example>
  ),
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector("div.flex");
    await expect(row).not.toBeNull();
    await expect(row === null ? "" : getComputedStyle(row).display).toBe("flex");
  },
};

export const Size: Story = {
  render: () => (
    <Example
      label="Size · w, maxW"
      sx={{ w: "fit", maxW: "full", p: 4, border: true, radius: "md" }}
    >
      <Typography>Shrink-wrapped to its content.</Typography>
    </Example>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector("div.w-fit");
    await expect(box).not.toBeNull();
    await expect(box).toHaveClass("max-w-full");
  },
};

export const FlexChild: Story = {
  render: () => (
    <Example
      label="Flex child · grow, alignSelf"
      sx={{ display: "flex", gap: 3, p: 4, bg: "sunken" }}
    >
      <Chip>Fixed</Chip>
      <Box as="span" sx={{ grow: true, alignSelf: "center", textAlign: "end" }}>
        <Typography variant="caption" as="span">
          Grows to fill the row
        </Typography>
      </Box>
    </Example>
  ),
  play: async ({ canvasElement }) => {
    const grower = canvasElement.querySelector("span.grow");
    await expect(grower).not.toBeNull();
    await expect(grower).toHaveClass("self-center");
  },
};

export const Look: Story = {
  render: () => (
    <Example
      label="Look · radius, shadow, border"
      sx={{ p: 6, radius: "xl", shadow: 2, border: true, bg: "card" }}
    >
      <Typography>Radius, elevation and hairline come from the token scales.</Typography>
    </Example>
  ),
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector("div.rounded-xl");
    await expect(box).not.toBeNull();
    await expect(box).toHaveClass("shadow-2");
  },
};

export const Colour: Story = {
  render: () => (
    <Cluster space={4}>
      <Example
        label="Colour · bg soft, color brand"
        sx={{ p: 4, radius: "md", bg: "soft", color: "brand" }}
      >
        <Typography variant="inherit">Brand text on the soft ground.</Typography>
      </Example>
      <Example
        label="Colour · bg page-alt, color muted"
        sx={{ p: 4, radius: "md", bg: "page-alt", color: "muted" }}
      >
        <Typography variant="inherit">Muted text on the alt ground.</Typography>
      </Example>
    </Cluster>
  ),
  play: async ({ canvasElement }) => {
    const soft = canvasElement.querySelector("div.bg-surface-brand-soft");
    await expect(soft).not.toBeNull();
    await expect(soft).toHaveClass("text-text-brand");
  },
};

/** 8px of margin on a phone, 32px from md up. The play runs at the 360px floor, so it asserts the base value. */
export const Responsive: Story = {
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Example
      label="Responsive · { base, md }"
      sx={{ m: { base: 2, md: 8 }, p: 4, border: true, radius: "md" }}
      testId="responsive"
    >
      <Typography>Margin 2 below md, 8 from md up.</Typography>
    </Example>
  ),
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByTestId("responsive");
    await expect(getComputedStyle(box).marginTop).toBe("8px");
    await expect(box).toHaveClass("m-2", "md:m-8");
  },
};
