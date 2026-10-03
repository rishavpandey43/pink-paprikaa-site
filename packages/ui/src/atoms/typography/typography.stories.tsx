import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Typography } from "./typography";

const meta = {
  title: "Atoms/Typography",
  component: Typography,
  args: { children: "We roast our own masala every morning.", variant: "body" },
  parameters: {
    docs: {
      description: {
        component:
          "Every string of text goes through `Typography` — it is the only place the type ramp is expressed. 15 variants: display-1/2, h1–h4, body-lg/body/body-sm, caption, overline, mono and the link-sm/md/lg link styles (what `Link` renders through). Pass `isFluid` in any responsive layout so headings clamp instead of overflowing. Display variants get `text-wrap: balance`, body gets `pretty`. Colors are semantic and follow the surface (`data-surface`), so text on a pink or ink field needs no override. `as` picks the element; the ramp step never changes with it.",
      },
    },
  },
} satisfies Meta<typeof Typography>;

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
      <Typography variant="h1">Our Menu</Typography>
      <Typography variant="h2">Chai</Typography>
      <Typography variant="h3">Small Plates</Typography>
      <Typography variant="h4">Add-ons</Typography>
    </div>
  ),
};

export const Body: Story = {
  name: 'variant="body-lg" · "body" · "body-sm"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      <Typography variant="body-lg" as="span">
        Large
      </Typography>
      <Typography variant="body" as="span">
        Regular
      </Typography>
      <Typography variant="body-sm" as="span">
        Small
      </Typography>
    </div>
  ),
};

export const CaptionOverlineMono: Story = {
  name: 'variant="caption" · "overline" · "mono"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      <Typography variant="caption">Caption</Typography>
      <Typography variant="overline" color="brand">
        Overline
      </Typography>
      <Typography variant="mono">PPK-4821</Typography>
    </div>
  ),
};

/** All ten colours. `inverse` and `on-brand` need their dark grounds, so they sit on their own tiles. */
export const Colors: Story = {
  name: "color",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      {(["heading", "body", "muted", "subtle", "brand", "danger", "success", "link"] as const).map(
        (color) => (
          <Typography key={color} variant="body-sm" color={color} as="span">
            {color}
          </Typography>
        )
      )}
      <div data-surface="ink" className="rounded-lg bg-surface-inverse p-3.5">
        <Typography variant="body-sm" color="inverse" as="span">
          inverse
        </Typography>
      </div>
      <div data-surface="brand" className="rounded-lg bg-surface-brand p-3.5">
        <Typography variant="body-sm" color="on-brand" as="span">
          on-brand
        </Typography>
      </div>
    </div>
  ),
};

/** One line with an ellipsis. At 360px the text overflows its box, so the ellipsis must show. */
export const NoWrap: Story = {
  name: "noWrap",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div className="w-full max-w-full overflow-hidden">
      <Typography noWrap data-testid="long">
        Paneer Butter Masala with Garlic Naan, a side of pickled onions and a very long note that
        will never fit on one line at 360px
      </Typography>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByTestId("long");
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
  },
};

/** The link text styles, for a link-looking label that is not an `<a>`. `Link` uses these steps. */
export const LinkVariants: Story = {
  name: 'variant="link-sm" · "link-md" · "link-lg"',
  render: () => (
    <div className="flex flex-wrap items-baseline gap-4">
      {(["link-sm", "link-md", "link-lg"] as const).map((variant) => (
        <Typography key={variant} variant={variant} color="link" as="span">
          {variant}
        </Typography>
      ))}
    </div>
  ),
};

export const LineClamp: Story = {
  name: "lineClamp={2}",
  args: {
    variant: "body-sm",
    color: "muted",
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
      <Typography measure="prose">
        We roast our own masala every morning. Before the shutters go up, the kitchen smells of
        cumin and coriander hitting a hot pan, and that is the smell the whole day is built on.
      </Typography>
      <Typography variant="body-sm" color="muted" measure="narrow">
        We roast our own masala every morning, then build the rest of the day around it.
      </Typography>
    </div>
  ),
};

/** Every step with a clamp() twin. Check it at the 360 viewport, the floor every layout survives. */
export const Fluid: Story = {
  name: "isFluid",
  render: () => (
    <div className="grid gap-4">
      {(["display-1", "display-2", "h1", "h2", "h3", "h4", "body"] as const).map((variant) => (
        <Typography key={variant} variant={variant} isFluid>
          Desi at heart.
        </Typography>
      ))}
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Typography variant="h4" as="span">
        Heading
      </Typography>
      <Typography as="span">Body</Typography>
      <Typography as="span" color="muted">
        Muted
      </Typography>
      <Typography as="span" variant="overline" color="brand">
        Brand
      </Typography>
    </OnSurfaces>
  ),
};
