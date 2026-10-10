import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, MapPin } from "lucide-react";
import type { ComponentProps } from "react";
import { expect, within } from "storybook/test";

import {
  StatesRow,
  type StoryForceState,
  storyStateControlProps,
  storyStatesPseudo,
} from "../../lib/story-states";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Link } from "./link";

const LINK_STATES = [
  "rest",
  "hover",
  "press",
  "focus",
  "disabled",
] as const satisfies readonly StoryForceState[];

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
  args: {
    href: "/menu",
    children: "See the full menu",
    variant: "link-md",
    color: "link",
    underline: "always",
  },
  argTypes: { icon: { control: false }, iconAfter: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Text links, rendered through `Typography`: `variant` is its `link-sm`/`link-md`/`link-lg` step (or `inherit` to take the size of the surrounding text), and `weight`, `align`, `noWrap` and `sx` work as they do there. Never leave an `<a>` unstyled — browser blue is not in the palette. `color` is `link` (pink), `muted`, `inverse` (the explicit white link for pink and ink fields) or `quiet` (the header/footer nav treatment); `underline` is `always`, `hover` or `none`. `isExternal` adds the arrow and the safe `rel`, and opens a new tab. `link`, `muted` and `quiet` follow the surface. `asChild` renders your router link (e.g. `next/link`) with the same styling. In running prose a bare `<a>` already carries the link style from the base layer.",
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { pseudo: storyStatesPseudo(LINK_STATES) },
  render: () => (
    <StatesRow
      states={LINK_STATES}
      render={(state) => (
        <Link
          href="/menu"
          {...(state === "disabled" ? { isDisabled: true } : storyStateControlProps(state))}
        >
          See the full menu
        </Link>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const hover = canvasElement.querySelector("#cell-hover a");
    if (!(hover instanceof HTMLElement)) {
      throw new Error("Link States: #cell-hover link missing");
    }
    await expect(hover).toHaveClass("hover:text-text-link-hover");
  },
};

export const Default: Story = {
  name: 'color="link"',
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

export const Colors: Story = {
  name: 'color="muted" · "quiet" · "inverse"',
  render: () => (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/menu">link</Link>
        <Link href="/legal" color="muted" underline="hover">
          muted
        </Link>
        <Link href="/outlets" color="quiet" underline="hover">
          quiet
        </Link>
        <Link href="/about" color="brand">
          brand
        </Link>
      </div>
      <div
        data-surface="brand"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-brand p-3.5"
      >
        <Link href="/legal" color="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal color="inverse">
          Zomato listing
        </Link>
      </div>
      <div
        data-surface="ink"
        className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-inverse p-3.5"
      >
        <Link href="/legal" color="inverse">
          FSSAI licence
        </Link>
        <Link href="https://www.zomato.com" isExternal color="inverse">
          Zomato listing
        </Link>
      </div>
    </div>
  ),
};

export const Underline: Story = {
  name: 'underline="always" · "hover" · "none"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu" underline="always">
        always
      </Link>
      <Link href="/menu" underline="hover">
        hover
      </Link>
      <Link href="/menu" underline="none">
        none
      </Link>
    </div>
  ),
};

export const Variants: Story = {
  name: 'variant="link-sm" · "link-md" · "link-lg"',
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/menu" variant="link-sm">
        Small
      </Link>
      <Link href="/menu" variant="link-md">
        Medium
      </Link>
      <Link href="/menu" variant="link-lg">
        Large
      </Link>
    </div>
  ),
};

/** `variant="inherit"` takes the size of the surrounding text: in a `body-sm` paragraph it is body-sm. */
export const InheritsParagraph: Story = {
  name: 'variant="inherit" (inside a body-sm paragraph)',
  render: () => (
    <p className="m-0 font-body text-body-sm text-text-body" data-testid="para">
      Every thali is cooked fresh. Read the{" "}
      <Link href="/legal" variant="inherit" data-testid="inline-link">
        allergen guide
      </Link>{" "}
      before you order.
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paragraph = getComputedStyle(canvas.getByTestId("para"));
    const link = getComputedStyle(canvas.getByTestId("inline-link"));
    await expect(link.fontSize).toBe(paragraph.fontSize);
  },
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
      <Link href="/menu" color="quiet" underline="hover">
        Menu
      </Link>
      <Link href="/outlets" color="quiet" underline="hover">
        Outlets
      </Link>
      <Link href="/catering" color="quiet" underline="hover">
        Party Orders
      </Link>
      <Link href="/contact" color="quiet" underline="hover">
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
      <Link href="/legal" color="muted" underline="hover">
        Subtle
      </Link>
      <Link href="/outlets" color="quiet" underline="hover">
        Quiet
      </Link>
    </OnSurfaces>
  ),
};
