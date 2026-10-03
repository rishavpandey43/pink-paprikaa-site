import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type NavLink, SiteHeader } from "./site-header";

const LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals", isActive: true },
  { label: "Catering", href: "#catering" },
  { label: "Menu", href: "#menu" },
];

/** The site's six widest real destinations (the stories' stress case). */
const WIDEST_LINKS: NavLink[] = [
  { label: "Homely Meals", href: "#homely-meals" },
  { label: "This week’s menu", href: "#this-week" },
  { label: "Catering", href: "#catering" },
  { label: "Office & PG Lunch", href: "#office-lunch" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const DRAWER_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  ...LINKS,
  { label: "Contact", href: "#contact" },
];

const glassBar = () =>
  screen.getByRole("banner").querySelector('[class~="data-scrolled:bg-surface-glass"]');

function RouterLink({ href, className, children, ...props }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="" {...props}>
      {children}
    </a>
  );
}

afterEach(() => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

describe("SiteHeader", () => {
  it("is the banner landmark and starts with a skip link to the main content", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    await user.tab();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveFocus();
    expect(skip).toHaveAttribute("href", "#main");
  });

  it("links the logo home and lists the nav links, the active one marked as the current page", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
    expect(within(nav).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(nav).getByRole("link", { name: "Catering" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ }).closest("a")).toHaveAttribute(
      "href",
      "#home"
    );
  });

  it("names its navigation from navLabel, so two mastheads on one page stay distinct", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} navLabel="Main, catering" />);
    expect(screen.getByRole("navigation", { name: "Main, catering" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("keeps three links inline below 2xl, never wrapping, and moves the rest into the drawer", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={WIDEST_LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    const items = within(nav).getAllByRole("listitem");
    for (const item of items.slice(0, 3)) expect(item).not.toHaveClass("hidden");
    for (const item of items.slice(3)) expect(item).toHaveClass("hidden", "2xl:block");
    for (const link of within(nav).getAllByRole("link")) {
      expect(link).toHaveClass("whitespace-nowrap");
    }
    expect(within(nav).getByRole("list")).toHaveClass("flex-nowrap");
    const menuButton = screen.getByRole("button", { name: "Menu" });
    expect(menuButton).toHaveClass("2xl:hidden");
    await user.click(menuButton);
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    for (const { label } of WIDEST_LINKS) {
      expect(within(drawer).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("hides the menu button from lg when every link fits inline", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass("lg:hidden");
  });

  it("the drawer traps focus, locks the page, closes on Escape and on any link, and returns focus", async () => {
    const user = userEvent.setup();
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        drawerLinks={DRAWER_LINKS}
        drawerActions={<a href="#order">Order online</a>}
      />
    );
    const menuButton = screen.getByRole("button", { name: "Menu" });
    await user.click(menuButton);
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    expect(within(drawer).getAllByRole("link")).toHaveLength(DRAWER_LINKS.length + 1);
    expect(document.body).toHaveAttribute("data-scroll-locked");

    const stops = DRAWER_LINKS.length + 2;
    for (let step = 0; step < stops + 2; step += 1) {
      await user.tab();
      expect(drawer.contains(document.activeElement)).toBe(true);
    }

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
    expect(document.body).not.toHaveAttribute("data-scroll-locked");

    await user.click(menuButton);
    await user.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Catering" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the drawer from the keyboard, hides the bar's own links behind it, and closes from its close button", async () => {
    const user = userEvent.setup();
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    screen.getByRole("button", { name: "Menu" }).focus();
    await user.keyboard("{Enter}");
    const drawer = screen.getByRole("dialog", { name: "Menu" });
    // Radix hides the rest of the page while the drawer is open: one "Catering" link, not two.
    expect(screen.getAllByRole("link", { name: "Catering" })).toHaveLength(1);
    await user.click(within(drawer).getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("turns the bar to glass once the page scrolls past 24px, and back at the top", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} />);
    expect(glassBar()).not.toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 120 });
    fireEvent.scroll(window);
    expect(glassBar()).toHaveAttribute("data-scrolled");
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    fireEvent.scroll(window);
    expect(glassBar()).not.toHaveAttribute("data-scrolled");
  });

  it("is 88px by default and 64px compact, sizing the default lockup to match", () => {
    const { rerender } = render(<SiteHeader homeHref="#home" links={LINKS} />);
    const row = () => glassBar()?.firstElementChild;
    expect(row()).toHaveClass("h-header");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toHaveClass("w-site-header-logo");
    rerender(<SiteHeader homeHref="#home" links={LINKS} size="compact" />);
    expect(row()).toHaveClass("h-header-compact");
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toHaveClass(
      "w-site-header-logo-compact"
    );
  });

  it("places the announcement above the bar and the badge beside the logo", () => {
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        announcement={<p>Launch price closes soon</p>}
        badge={<span>Pure Veg</span>}
      />
    );
    const announcement = screen.getByText("Launch price closes soon");
    const bar = glassBar();
    expect(bar).not.toBeNull();
    expect(bar?.contains(announcement)).toBe(false);
    expect(bar).toContainElement(screen.getByText("Pure Veg"));
  });

  it("renders no wrapper for an empty badge or action slot, and no drawer with nothing in it", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        badge=""
        actions=""
        compactActions=""
        drawerActions=""
      />
    );
    // The lockup link, the nav, the spacer and the menu button — nothing else.
    expect(glassBar()?.firstElementChild?.children).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const drawerNav = within(screen.getByRole("dialog")).getByRole("navigation");
    expect(drawerNav.parentElement?.children).toHaveLength(1);
    await user.keyboard("{Escape}");
    rerender(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        badge={false}
        actions={false}
        compactActions={false}
      />
    );
    expect(glassBar()?.firstElementChild?.children).toHaveLength(4);
    // React prints 0, so a 0 slot keeps its wrapper (a truthiness gate would drop it).
    rerender(
      <SiteHeader homeHref="#home" links={LINKS} badge={0} actions={0} compactActions={0} />
    );
    expect(glassBar()?.firstElementChild?.children).toHaveLength(7);
    expect(screen.getAllByText("0")).toHaveLength(3);
    rerender(<SiteHeader homeHref="#home" links={LINKS} drawerLinks={[]} drawerActions="" />);
    expect(screen.queryByRole("button", { name: "Menu" })).not.toBeInTheDocument();
  });

  it("falls back to the default lockup inside the home link when the logo slot is blank", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} logo="" />);
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ }).closest("a")).toHaveAttribute(
      "href",
      "#home"
    );
  });

  it("shows actions from lg and compact actions below it", () => {
    render(
      <SiteHeader
        homeHref="#home"
        links={LINKS}
        actions={<a href="#order">Order online</a>}
        compactActions={<a href="#wa">WhatsApp us</a>}
      />
    );
    expect(screen.getByRole("link", { name: "Order online" }).parentElement).toHaveClass(
      "hidden",
      "lg:flex"
    );
    expect(screen.getByRole("link", { name: "WhatsApp us" }).parentElement).toHaveClass(
      "lg:hidden"
    );
  });

  it("renders the home and nav links through linkAs", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} linkAs={RouterLink} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Catering" })).toHaveAttribute("data-router-link");
    expect(within(nav).getByRole("link", { name: "Homely Meals" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("portals the drawer into the given container", async () => {
    const user = userEvent.setup();
    const frame = document.createElement("div");
    document.body.append(frame);
    render(<SiteHeader homeHref="#home" links={LINKS} portalContainer={frame} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(frame).toContainElement(screen.getByRole("dialog", { name: "Menu" }));
    frame.remove();
  });

  it("merges a caller className over its own", () => {
    render(<SiteHeader homeHref="#home" links={LINKS} className="top-8" />);
    expect(screen.getByRole("banner")).toHaveClass("sticky", "top-8");
    expect(screen.getByRole("banner")).not.toHaveClass("top-0");
  });

  it("has no accessibility violations, closed or with the drawer open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SiteHeader homeHref="#home" links={LINKS} actions={<a href="#order">Order online</a>} />
    );
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });
});
