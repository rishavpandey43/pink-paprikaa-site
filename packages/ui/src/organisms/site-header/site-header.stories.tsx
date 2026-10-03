import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Search, ShoppingBag } from "lucide-react";
import { expect, screen, waitFor } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { ringClippers } from "../../lib/story-ring";
import { AnnouncementBar } from "../../molecules/announcement-bar/announcement-bar";
import { BRAND, VIEWPORT_1024, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { type NavLink, SiteHeader } from "./site-header";

/** The handoff launch offer ends 2026-10-31; stories keep a live countdown 30 days out. */
const LAUNCH_ENDS = new Date(Date.now() + 30 * 86_400_000).toISOString();

const DS_LINKS: NavLink[] = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#about" },
  { label: "Outlets", href: "#outlets" },
  { label: "Franchise", href: "#franchise" },
  { label: "Careers", href: "#careers" },
];

const HANDOFF_LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "Catering", href: "#catering" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
];

const HANDOFF_DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "This week’s menu", href: "#this-week" },
  { label: "Catering", href: "#catering" },
  { label: "Office & PG Lunch", href: "#office-lunch" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/**
 * The stress case: the six longest labels the site's real destinations carry (the handoff drawer's
 * pages, Home and the four-letter Menu aside), in its order — the widest inline nav it can ask for.
 */
const WIDEST_LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals" },
  { label: "This week’s menu", href: "#this-week" },
  { label: "Catering", href: "#catering" },
  { label: "Office & PG Lunch", href: "#office-lunch" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const handoffButtons = (size: "sm" | "md", isFullWidth: boolean) => (
  <>
    <Button asChild variant="secondary" size={size} icon={ShoppingBag} isFullWidth={isFullWidth}>
      <a href={BRAND.orderOnlineHref}>Order online</a>
    </Button>
    <Button asChild size={size} icon={MessageCircle} isFullWidth={isFullWidth}>
      <a href={BRAND.whatsappHref}>WhatsApp us</a>
    </Button>
  </>
);

const dsActions = (cartCount: number) => (
  <>
    <IconButton icon={Search} label="Search the menu" />
    <IconButton icon={ShoppingBag} label="Your order" count={cartCount} />
    <Button variant="secondary" size="sm">
      Book a Table
    </Button>
    <Button size="sm" icon={ShoppingBag}>
      Order Now
    </Button>
  </>
);

const HANDOFF = {
  size: "compact",
  links: HANDOFF_LINKS,
  drawerLinks: HANDOFF_DRAWER_LINKS,
  announcement: (
    <AnnouncementBar href="#homely-meals" endsAt={LAUNCH_ENDS}>
      Launch price: <strong>Classic at ₹130 a meal</strong> for the first 50 subscribers · closes in
    </AnnouncementBar>
  ),
  badge: (
    <Badge tone="success">
      <DietMark size="sm" />
      Pure Veg
    </Badge>
  ),
  actions: handoffButtons("sm", false),
  drawerActions: handoffButtons("md", true),
  compactActions: (
    <IconButton asChild icon={MessageCircle} label="WhatsApp us" variant="primary">
      <a href={BRAND.whatsappHref} aria-label="WhatsApp us" />
    </IconButton>
  ),
} as const;

const meta = {
  title: "Organisms/SiteHeader",
  component: SiteHeader,
  args: { homeHref: "#home", ...HANDOFF },
  decorators: [
    (Story) => (
      <>
        <Story />
        <main id="main" className="container-page py-10">
          <div className="h-400 rounded-lg bg-surface-page-alt" />
        </main>
      </>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, height: "420px" },
      description: {
        component:
          'The website masthead — sticky, solid at rest and glass once scrolled past 24px. `size="default"` is the design system\'s 88px bar; `size="compact"` the handoff\'s 64px row under the launch AnnouncementBar. The nav never wraps or clips: from lg it shows inline, between lg and 2xl only its first three links, and the menu drawer (a focus-trapped sheet) carries every destination whenever the bar cannot. Never add a third CTA.',
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: "rest" — the design system's 88px header. */
export const Rest: Story = {
  args: {
    size: "default",
    links: DS_LINKS,
    drawerLinks: DS_LINKS,
    announcement: undefined,
    badge: undefined,
    actions: dsActions(0),
    drawerActions: undefined,
    compactActions: <IconButton icon={ShoppingBag} label="Your order" />,
  },
};

/** Card row: "scrolled + cart" — glass over the tinted page, cart count 2. */
export const ScrolledWithCart: Story = {
  args: {
    ...Rest.args,
    actions: dsActions(2),
    compactActions: <IconButton icon={ShoppingBag} label="Your order" count={2} />,
  },
  play: async ({ canvas, canvasElement }) => {
    canvasElement.ownerDocument.defaultView?.scrollTo(0, 240);
    const bar = canvas
      .getByRole("banner")
      .querySelector('[class~="data-scrolled:bg-surface-glass"]');
    await waitFor(() => expect(bar).toHaveAttribute("data-scrolled"));
  },
};

/**
 * Cart counts 0, 1 and 12 on the design-system header. A document holds one `banner` and no two
 * landmarks may share a name, so each specimen sits in its own named `section` (a `header` inside
 * a `section` is not a banner) and names its own nav.
 */
export const CartCounts: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[0, 1, 12].map((count) => (
        <section key={count} aria-label={`Cart with ${String(count)} items`}>
          <SiteHeader
            {...args}
            size="default"
            links={DS_LINKS}
            drawerLinks={DS_LINKS}
            announcement={undefined}
            badge={undefined}
            actions={dsActions(count)}
            drawerActions={undefined}
            compactActions={<IconButton icon={ShoppingBag} label="Your order" count={count} />}
            navLabel={`Main, cart with ${String(count)} items`}
          />
        </section>
      ))}
    </div>
  ),
};

/** Handoff PPHeader — launch bar, Pure Veg chip, four links, two actions. */
export const HandoffCompact: Story = {};

/** The widths either side of the nav's steps that no system breakpoint names. */
const NAV_EDGE_VIEWPORTS = {
  viewport: {
    options: {
      navEdge1279: {
        name: "1279 — one below xl",
        styles: { width: "1279px", height: "900px" },
        type: "desktop",
      },
      navEdge1536: { name: "1536", styles: { width: "1536px", height: "900px" }, type: "desktop" },
    },
  },
};

/**
 * Review Focus 2 on the real page: the first `inline` links show and the rest are `display:
 * none`, the document never scrolls sideways, and the menu button (whenever a link is hidden) and
 * the last action end inside the viewport.
 */
const fitsWith =
  (inline: number): NonNullable<Story["play"]> =>
  async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    const items = [...nav.querySelectorAll("li")];
    await expect(items.map((item) => getComputedStyle(item).display !== "none")).toEqual(
      items.map((_, index) => index < inline)
    );
    const page = document.documentElement;
    await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth);
    const menuButton = canvas.queryByRole("button", { name: "Menu" });
    if (inline < items.length) await expect(menuButton).toBeVisible();
    const lastAction = canvas.getByRole("link", { name: "WhatsApp us" });
    for (const control of [menuButton, lastAction]) {
      if (control !== null) {
        await expect(control.getBoundingClientRect().right).toBeLessThanOrEqual(innerWidth);
      }
    }
  };

const SIX_LINKS = { links: WIDEST_LINKS, drawerLinks: WIDEST_LINKS };

/** Six links at 1024px: three inline, the menu button carries the rest. */
export const SixLinksAt1024: Story = {
  args: SIX_LINKS,
  globals: VIEWPORT_1024,
  play: fitsWith(3),
};

/** Six links one pixel below xl: three inline. */
export const SixLinksAt1279: Story = {
  args: SIX_LINKS,
  parameters: NAV_EDGE_VIEWPORTS,
  globals: { viewport: { value: "navEdge1279", isRotated: false } },
  play: fitsWith(3),
};

/** Six links at xl: still three inline — all six run 23px past a 1280px page. */
export const SixLinksAt1280: Story = {
  args: SIX_LINKS,
  globals: VIEWPORT_1280,
  play: fitsWith(3),
};

/** Six links at 2xl, the narrowest page that shows them all. */
export const SixLinksAt1440: Story = {
  args: SIX_LINKS,
  globals: { viewport: { value: "xxl", isRotated: false } },
  play: fitsWith(6),
};

/** Six links at 1536px: all inline. */
export const SixLinksAt1536: Story = {
  args: SIX_LINKS,
  parameters: NAV_EDGE_VIEWPORTS,
  globals: { viewport: { value: "navEdge1536", isRotated: false } },
  play: fitsWith(6),
};

/**
 * Radix hides the page behind the open drawer while trapping focus; `aria-hidden-focus` misreads
 * it. A story's `rules` replace the preview's list, so `color-contrast` (owned by the token
 * contrast policy) is switched off again here.
 */
const OPEN_DRAWER_A11Y = {
  a11y: {
    config: {
      rules: [
        { id: "color-contrast", enabled: false },
        { id: "aria-hidden-focus", enabled: false },
      ],
    },
  },
};

/** The drawer slides in (`animate-sheet-in`): wait for it to land before measuring. */
async function openDrawer(menuButton: HTMLElement, click: (element: HTMLElement) => Promise<void>) {
  await click(menuButton);
  const drawer = await screen.findByRole("dialog", { name: "Menu" });
  await Promise.all(drawer.getAnimations().map((animation) => animation.finished));
  return drawer;
}

/** The drawer by keyboard: open, Escape, focus back on the menu button. */
export const DrawerKeyboard: Story = {
  globals: VIEWPORT_360,
  play: async ({ canvas, userEvent }) => {
    const menuButton = canvas.getByRole("button", { name: "Menu" });
    const drawer = await openDrawer(menuButton, (element) => userEvent.click(element));
    await expect(drawer).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(menuButton).toHaveFocus();
  },
};

/**
 * The open drawer at 360px. It scrolls (`overflow-y-auto`), so its padding must hold every focus
 * ring whole: tab round the trapped focus — close button, eight links, two actions — and prove
 * nothing cuts any of them.
 */
export const DrawerOpen: Story = {
  globals: VIEWPORT_360,
  parameters: OPEN_DRAWER_A11Y,
  play: async ({ canvas, userEvent }) => {
    const drawer = await openDrawer(canvas.getByRole("button", { name: "Menu" }), (element) =>
      userEvent.click(element)
    );
    const stops = HANDOFF_DRAWER_LINKS.length + 3;
    const seen = new Set<Element>();
    for (let step = 0; step <= stops; step += 1) {
      await userEvent.tab();
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || seen.has(active)) break;
      seen.add(active);
      await expect(drawer).toContainElement(active);
      await expect(ringClippers(active)).toEqual([]);
    }
    await expect(seen.size).toBe(stops);
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
