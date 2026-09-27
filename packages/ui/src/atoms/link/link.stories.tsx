import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { ArrowRight, MapPin } from "lucide-react";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Link } from "./link";

function DemoRouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

const meta = {
  title: "Atoms/Link",
  component: Link,
  args: { href: "/menu", children: "See the full menu", variant: "default", size: "md" },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Text links. Never leave an `<a>` unstyled — browser blue is not in the palette. `quiet` is the header/footer nav treatment (no underline). `isExternal` adds the arrow and the safe `rel`, and opens a new tab. `default`, `subtle` and `quiet` follow the surface; `inverse` is the explicit white link for pink and ink fields. `asChild` renders your router link (e.g. `next/link`) with the same styling. In running prose a bare `<a>` already carries the link style from the base layer.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'variant="default"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu">See the full menu</Link>
      <Link href="/outlets" icon={MapPin}>
        Find a Paprikaa
      </Link>
      <Link href="/about" iconAfter={ArrowRight}>
        Our story
      </Link>
    </div>
  ),
};

export const SubtleQuiet: Story = {
  name: 'variant="subtle" · "quiet"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/legal" variant="subtle">
        Privacy
      </Link>
      <Link href="/outlets" variant="quiet">
        Outlets
      </Link>
    </div>
  ),
};

export const Inverse: Story = {
  name: 'variant="inverse"',
  render: () => (
    <div className="grid gap-3">
      <div
        data-surface="brand"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-brand p-3.5"
      >
        <Link href="/legal" variant="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
      <div
        data-surface="ink"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-inverse p-3.5"
      >
        <Link href="/legal" variant="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal variant="inverse">
          Zomato listing
        </Link>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu" size="sm">
        Small
      </Link>
      <Link href="/menu" size="md">
        Medium
      </Link>
      <Link href="/menu" size="lg">
        Large
      </Link>
    </div>
  ),
};

export const External: Story = {
  name: "isExternal",
  args: { href: "https://www.zomato.com", isExternal: true, children: "Zomato listing" },
};

export const AsChild: Story = {
  name: "asChild (router link)",
  render: () => (
    <Link asChild icon={MapPin}>
      <DemoRouterLink href="/outlets">Outlets</DemoRouterLink>
    </Link>
  ),
};

/** In context: a footer column, where `quiet` keeps the nav calm until it is pointed at. */
export const InFooterNav: Story = {
  name: "in context: footer nav",
  render: () => (
    <nav aria-label="Footer" className="flex flex-col items-start gap-3">
      <Link href="/menu" variant="quiet">
        Menu
      </Link>
      <Link href="/outlets" variant="quiet">
        Outlets
      </Link>
      <Link href="/catering" variant="quiet">
        Party Orders
      </Link>
      <Link href="/contact" variant="quiet">
        Contact
      </Link>
    </nav>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Link href="/menu">Default</Link>
      <Link href="/legal" variant="subtle">
        Subtle
      </Link>
      <Link href="/outlets" variant="quiet">
        Quiet
      </Link>
    </OnSurfaces>
  ),
};
