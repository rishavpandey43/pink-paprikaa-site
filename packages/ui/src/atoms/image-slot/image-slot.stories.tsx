import type { Meta, StoryObj } from "@storybook/react-vite";

import symbolPink from "../../assets/brand/symbol-pink.svg";
import { ImageSlot } from "./image-slot";

const meta = {
  title: "Atoms/ImageSlot",
  component: ImageSlot,
  args: { label: "Hero 4:5 — warm, close-cropped", ratio: "4:5", className: "w-60" },
  parameters: {
    docs: {
      description: {
        component:
          'Every image in the system. Until real photography lands, it renders a labelled pink placeholder that names the crop needed — always give a specific `label` ("Dish photo" says nothing; "Kitchen portrait 3:4" is what a photographer can act on). With `src` it renders a lazy `<img>` with its intrinsic `width`/`height` inside the same aspect box, so a missing photo never collapses a layout. `isFill` for full-bleed panels; pass a `<picture>` as children for the image pipeline.',
      },
    },
  },
} satisfies Meta<typeof ImageSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Ratios: Story = {
  name: "ratio",
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <ImageSlot ratio="square" label="1:1" className="w-24" />
      <ImageSlot ratio="4:3" label="4:3" className="w-30" />
      <ImageSlot ratio="3:4" label="3:4" className="w-20" />
      <ImageSlot ratio="4:5" label="4:5" className="w-20" />
      <ImageSlot ratio="16:9" label="16:9" className="w-37.5" />
      <ImageSlot ratio="16:10" label="16:10" className="w-37.5" />
      <ImageSlot ratio="wide" label="21:9" className="w-37.5" />
    </div>
  ),
};

export const Variants: Story = {
  name: 'variant="soft" · "strong" · "neutral"',
  render: () => (
    <div className="flex items-start gap-3">
      <ImageSlot variant="soft" label="soft" className="w-30" />
      <ImageSlot variant="strong" label="strong" className="w-30" />
      <ImageSlot variant="neutral" label="neutral" className="w-30" />
    </div>
  ),
};

export const Label: Story = {
  name: "label (name the real crop)",
  render: () => (
    <ImageSlot
      ratio="16:9"
      label="Hero 16:9 — warm, close-cropped, steam visible"
      className="max-w-75"
    />
  ),
};

export const Photo: Story = {
  name: "src (a real image)",
  render: () => (
    <ImageSlot
      src={symbolPink}
      alt="The Pink Paprikaa diamond symbol"
      width={358}
      height={358}
      ratio="square"
      variant="neutral"
      className="w-40"
    />
  ),
};

export const Fill: Story = {
  name: "isFill",
  render: () => (
    <div className="h-40 w-72">
      <ImageSlot isFill radius="xl" label="Full-bleed panel — fills its parent" />
    </div>
  ),
};

export const Radii: Story = {
  name: "radius",
  render: () => (
    <div className="flex items-start gap-3">
      {(["none", "md", "lg", "xl"] as const).map((radius) => (
        <ImageSlot key={radius} radius={radius} label={radius} className="w-30" />
      ))}
    </div>
  ),
};

export const Sx: Story = {
  render: () => <ImageSlot label="Dish 4:3" sx={{ radius: "xl", mt: 4 }} className="w-40" />,
};
