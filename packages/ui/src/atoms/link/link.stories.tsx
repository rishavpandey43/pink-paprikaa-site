import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight, MapPin } from "lucide-react";

import { Link } from "./link";

const meta = {
  title: "Atoms/Link",
  component: Link,
  args: { children: "See the full menu", href: "/menu" },
  argTypes: {
    icon: { control: false },
    iconAfter: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Inline and standalone text links. The underline is the brand's link signal — never " +
          "leave an `<a>` unstyled, browser blue is not in the palette. `quiet` is the header and " +
          "footer nav treatment: no underline until hover.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Link {...args} variant="default">
        See the full menu
      </Link>
      <Link {...args} href="/privacy" variant="subtle">
        Privacy
      </Link>
      <Link {...args} href="/outlets" variant="quiet">
        Outlets
      </Link>
    </div>
  ),
};

/** 14 / 16 / 18px — the link steps of the running-text ramp. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Link {...args} size="sm">
        Small
      </Link>
      <Link {...args} size="md">
        Medium
      </Link>
      <Link {...args} size="lg">
        Large
      </Link>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Link {...args} href="/outlets" icon={MapPin}>
        Find a Paprikaa
      </Link>
      <Link {...args} iconAfter={ArrowRight}>
        See the full menu
      </Link>
    </div>
  ),
};

/** External links carry the outward arrow, `target="_blank"` and the safe `rel`. */
export const External: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Link {...args} href="https://www.zomato.com" isExternal>
        Zomato listing
      </Link>
      <Link {...args} href="https://www.swiggy.com" isExternal variant="subtle">
        Swiggy listing
      </Link>
    </div>
  ),
};

/**
 * On a flooded pink panel the link goes white and the underline drops to a glass tint.
 *
 * A flooded panel is #EE2C68, where white measures 4.04:1 — enough for WCAG's large-text
 * threshold (3:1) and nothing below it. None of `Link`'s three sizes is large on its own (18px at
 * `lg`, and the face is medium rather than bold), so a link on a pink band is set at 20px bold:
 * the smallest step that qualifies. The ink panel below carries the same variant at running size,
 * which is where a body-copy `inverse` link belongs.
 */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6 rounded-4 bg-surface-brand p-8">
        <Link
          {...args}
          className="text-subtitle1 font-bold tracking-subtitle1"
          href="/licences"
          variant="inverse"
        >
          FSSAI licence
        </Link>
        <Link
          {...args}
          className="text-subtitle1 font-bold tracking-subtitle1"
          href="https://www.zomato.com"
          isExternal
          variant="inverse"
        >
          Zomato listing
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-6 rounded-4 bg-surface-inverse p-8">
        <Link {...args} href="/licences" variant="inverse">
          FSSAI licence
        </Link>
        <Link {...args} href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
    </div>
  ),
};

/** In context: a footer column, where `quiet` keeps the nav calm until it is pointed at. */
export const InFooterNav: Story = {
  parameters: { layout: "padded" },
  render: (args) => (
    <nav className="flex flex-col items-start gap-3">
      <Link {...args} href="/menu" variant="quiet">
        Menu
      </Link>
      <Link {...args} href="/outlets" variant="quiet">
        Outlets
      </Link>
      <Link {...args} href="/catering" variant="quiet">
        Party Orders
      </Link>
      <Link {...args} href="/contact" variant="quiet">
        Contact
      </Link>
    </nav>
  ),
};
