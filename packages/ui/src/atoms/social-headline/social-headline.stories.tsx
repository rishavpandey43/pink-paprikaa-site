import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { SocialHeadline } from "./social-headline";

const meta = {
  title: "Atoms/SocialHeadline",
  component: SocialHeadline,
  args: { children: "Chai first, decisions later.", size: "hero", measure: "default" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Type for marketing canvases — sized in canvas pixels, wrapped with `text-wrap: balance`. Never use screen `text-*` sizes on a 1080 canvas — they render as fine print. Keep headlines ≤ 6 words so `balance` can do its job. Colour follows the artboard's surface (PatternField and PostFrame set it); `measure` caps the line: tight 12ch · default 18ch · wide 30ch.",
      },
    },
  },
} satisfies Meta<typeof SocialHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Overline: Story = {
  name: 'size="overline"',
  args: { size: "overline", className: "text-text-brand", children: "Tonight Only" },
};

export const Hero: Story = {
  name: 'size="hero"',
  args: { size: "hero", children: "Chai first, decisions later." },
};

export const H1H2: Story = {
  name: 'size="h1" · "h2"',
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="h1">Masala Cold Brew</SocialHeadline>
      <SocialHeadline size="h2" as="h3">
        One kitchen. One grinder.
      </SocialHeadline>
    </div>
  ),
};

export const BodyCaption: Story = {
  name: 'size="body" · "caption"',
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="body" measure="wide">
        Cold brew, jaggery, cardamom.
      </SocialHeadline>
      <SocialHeadline size="caption" measure="wide">
        Sector 57, Gurgaon · 8am – 11:30pm
      </SocialHeadline>
    </div>
  ),
};

export const Alignment: Story = {
  name: "align",
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="h2" align="start">
        Start
      </SocialHeadline>
      <SocialHeadline size="h2" align="center">
        Center
      </SocialHeadline>
      <SocialHeadline size="h2" align="end">
        End
      </SocialHeadline>
    </div>
  ),
};

/** A whole post as the ramp is really used, at true canvas pixels (72px canvas padding). */
export const OnACanvas: Story = {
  name: "on a canvas (a whole post)",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div data-surface="brand" className="grid gap-8 bg-surface-brand p-18">
      <SocialHeadline size="overline">Tonight Only</SocialHeadline>
      <SocialHeadline size="hero" measure="tight">
        Chai first, decisions later.
      </SocialHeadline>
      <SocialHeadline size="body" measure="wide">
        Kadak chai and hot momos · ₹180–₹320
      </SocialHeadline>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <SocialHeadline size="overline">Tonight Only</SocialHeadline>
      <SocialHeadline size="body">Cold brew, jaggery, cardamom.</SocialHeadline>
    </OnSurfaces>
  ),
};
