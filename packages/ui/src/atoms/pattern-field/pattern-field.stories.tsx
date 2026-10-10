import type { Meta, StoryObj } from "@storybook/react-vite";

import { PatternField } from "./pattern-field";

function Inner({ caption }: { caption: string }) {
  return (
    <div className="p-4">
      <h4 className="m-0">Flooded field</h4>
      <p className="m-0 font-body text-caption">{caption}</p>
    </div>
  );
}

const meta = {
  title: "Atoms/PatternField",
  component: PatternField,
  args: {
    surface: "brand",
    tile: 64,
    radius: "lg",
    children: <Inner caption="tile 64 · density default" />,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Flooded brand panel with the diamond symbol tiled behind it — the brand's single texture. It sets `data-surface` to its surface, so headings, copy and links inside follow the field with no colour props. `tile` is 96 on a 1080 canvas, 56–72 on screen; `density=\"faint\"` (4%) is the handoff's whisper for ink sections. The pattern is a whisper, never a graphic element: no noise, grain or gradients alongside it. `asChild` patterns your own `<section>`.",
      },
    },
  },
} satisfies Meta<typeof PatternField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Brand: Story = { name: 'surface="brand"', args: { surface: "brand" } };

export const Ink: Story = { name: 'surface="ink"', args: { surface: "ink" } };

export const Soft: Story = { name: 'surface="soft"', args: { surface: "soft" } };

export const Light: Story = {
  name: 'surface="page"',
  args: { surface: "page", className: "border border-border-subtle" },
};

export const Faint: Story = {
  name: 'density="faint"',
  args: {
    surface: "ink",
    tile: 80,
    density: "faint",
    children: <Inner caption="tile 80 · faint" />,
  },
};

export const Tiles: Story = {
  name: "tile",
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      {([56, 64, 72, 80, 86, 96] as const).map((tile) => (
        <PatternField key={tile} surface="brand" tile={tile} radius="lg" className="h-40">
          <Inner caption={`tile ${String(tile)}`} />
        </PatternField>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (section)",
  render: () => (
    <PatternField asChild surface="ink" density="faint" tile={80} radius="xl" className="p-8">
      <section aria-label="Delivery zones">
        <h2 className="m-0">Delivery zones</h2>
        <p className="m-0 font-body text-body">Free within 3 km of Sector 57.</p>
      </section>
    </PatternField>
  ),
};

/** A full-bleed section band: no radius, edge to edge. */
export const FullBleedBand: Story = {
  name: 'full-bleed band (radius="none")',
  parameters: { layout: "fullscreen" },
  render: () => (
    <PatternField surface="ink" radius="none">
      <div className="container-page section-y">
        <h2 className="m-0 text-balance">Momos, chaat and North Indian plates from ₹180–₹320</h2>
      </div>
    </PatternField>
  ),
};

export const Sx: Story = { args: { sx: { radius: "xl", mt: 4 } } };
