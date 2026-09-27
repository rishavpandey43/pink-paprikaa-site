import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Text } from "./text";

const meta = {
  title: "Atoms/Text",
  component: Text,
  args: { children: "We roast our own masala every morning.", variant: "body" },
  parameters: {
    docs: {
      description: {
        component:
          "Every string of text goes through `Text` — it is the only place the type ramp is expressed. 12 variants: display-1/2, h1–h4, body-lg/body/body-sm, caption, overline, mono. Pass `isFluid` in any responsive layout so headings clamp instead of overflowing. Display variants get `text-wrap: balance`, body gets `pretty`. Tones are semantic and follow the surface (`data-surface`), so text on a pink or ink field needs no override. `as` picks the element; the ramp step never changes with it.",
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Display1: Story = {
  name: 'variant="display-1"',
  args: { variant: "display-1", children: "Desi at heart." },
};

export const Display2: Story = {
  name: 'variant="display-2"',
  args: { variant: "display-2", children: "Urban by nature." },
};

export const Headings: Story = {
  name: 'variant="h1" · "h2" · "h3" · "h4"',
  render: () => (
    <div className="grid gap-3">
      <Text variant="h1">Our Menu</Text>
      <Text variant="h2">Chai</Text>
      <Text variant="h3">Small Plates</Text>
      <Text variant="h4">Add-ons</Text>
    </div>
  ),
};

export const Body: Story = {
  name: 'variant="body-lg" · "body" · "body-sm"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      <Text variant="body-lg" as="span">
        Large
      </Text>
      <Text variant="body" as="span">
        Regular
      </Text>
      <Text variant="body-sm" as="span">
        Small
      </Text>
    </div>
  ),
};

export const CaptionOverlineMono: Story = {
  name: 'variant="caption" · "overline" · "mono"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      <Text variant="caption">Caption</Text>
      <Text variant="overline" tone="brand">
        Overline
      </Text>
      <Text variant="mono">PPK-4821</Text>
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(["heading", "body", "muted", "subtle", "brand", "danger"] as const).map((tone) => (
        <Text key={tone} variant="body-sm" tone={tone} as="span">
          {tone}
        </Text>
      ))}
    </div>
  ),
};

export const ToneInverse: Story = {
  name: 'tone="inverse"',
  render: () => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-3.5">
      <Text variant="body-sm" tone="inverse" as="span">
        inverse
      </Text>
    </div>
  ),
};

export const ToneOnBrand: Story = {
  name: 'tone="on-brand"',
  render: () => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-3.5">
      <Text variant="body-sm" tone="on-brand" as="span">
        on-brand
      </Text>
    </div>
  ),
};

export const LineClamp: Story = {
  name: "lineClamp={2}",
  args: {
    variant: "body-sm",
    tone: "muted",
    lineClamp: 2,
    className: "max-w-70",
    children:
      "Amritsari paneer, burnt chilli mayo, potato brioche, masala fries and a side of pickled onion that nobody asked for but everybody finishes.",
  },
};

export const Measure: Story = {
  name: 'measure="prose" · "narrow"',
  render: () => (
    <div className="grid gap-4">
      <Text measure="prose">
        We roast our own masala every morning. Before the shutters go up, the kitchen smells of
        cumin and coriander hitting a hot pan, and that is the smell the whole day is built on.
      </Text>
      <Text variant="body-sm" tone="muted" measure="narrow">
        We roast our own masala every morning, then build the rest of the day around it.
      </Text>
    </div>
  ),
};

/** Every step with a clamp() twin. Check it at the 360 viewport, the floor every layout survives. */
export const Fluid: Story = {
  name: "isFluid",
  render: () => (
    <div className="grid gap-4">
      {(["display-1", "display-2", "h1", "h2", "h3", "h4", "body"] as const).map((variant) => (
        <Text key={variant} variant={variant} isFluid>
          Desi at heart.
        </Text>
      ))}
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Text variant="h4" as="span">
        Heading
      </Text>
      <Text as="span">Body</Text>
      <Text as="span" tone="muted">
        Muted
      </Text>
      <Text as="span" variant="overline" tone="brand">
        Brand
      </Text>
    </OnSurfaces>
  ),
};
