import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Bell,
  Clock,
  Coffee,
  Flame,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
  Star,
  Store,
  User,
  Utensils,
} from "lucide-react";

import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "./brand-glyphs";
import { Icon } from "./icon";

/** The card's common set, plus the WhatsApp / store glyphs and the three brand glyphs. */
const GLYPHS = {
  Utensils,
  Coffee,
  ShoppingBag,
  MapPin,
  Clock,
  Heart,
  Flame,
  Leaf,
  Star,
  User,
  Bell,
  Search,
  MessageCircle,
  Store,
  InstagramGlyph,
  YoutubeGlyph,
  LinkedinGlyph,
};

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  args: { icon: MessageCircle, size: "md" },
  argTypes: {
    icon: { options: Object.keys(GLYPHS), mapping: GLYPHS, control: "select" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Lucide glyphs on a 24px grid, stroke 1.75 at 20–24px and 2 at 16px, painted with currentColor. Sizes: 16 inline with body, 20 buttons and list rows, 24 nav and tab bar, 32 empty states. Never emoji, never a second colour.",
      },
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "size": xs 14 · sm 16 · md 20 · lg 24 · xl 32. */
export const Sizes: Story = {
  args: { icon: Utensils },
  render: (args) => (
    <div className="flex items-end gap-6 text-ink-700">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon {...args} size={size} />
          <span className="font-mono text-mono text-text-muted">size=&quot;{size}&quot;</span>
        </div>
      ))}
    </div>
  ),
};

/** Card row "currentColor": the icon takes its colour from the text around it. */
export const CurrentColor: Story = {
  args: { icon: Flame, size: "lg" },
  render: (args) => (
    <div className="flex gap-4">
      {["text-pink-500", "text-ink-900", "text-mint", "text-turmeric", "text-tandoor"].map(
        (colour) => (
          <span key={colour} className={colour}>
            <Icon {...args} />
          </span>
        )
      )}
    </div>
  ),
};

/** Card row "common set", with the three brand glyphs at the end. */
export const Glyphs: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 text-ink-600">
      {Object.entries(GLYPHS).map(([name, glyph]) => (
        <Icon key={name} icon={glyph} size="lg" />
      ))}
    </div>
  ),
};

/** A labelled icon is announced as an image (`role="img"`); a decorative one is skipped. */
export const Labelled: Story = {
  args: { icon: MessageCircle, label: "Chat on WhatsApp", size: "lg" },
};

/** Card row "on dark": on an ink panel the surface's text colour carries the icon to white. */
export const OnInk: Story = {
  render: () => (
    <div data-surface="ink" className="flex gap-4 rounded-lg bg-surface-inverse p-6">
      {(["Utensils", "Coffee", "MapPin", "Heart"] as const).map((name) => (
        <Icon key={name} icon={GLYPHS[name]} size="lg" />
      ))}
    </div>
  ),
};
