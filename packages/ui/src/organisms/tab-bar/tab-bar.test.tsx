import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";

import { expectNoA11yViolations } from "#vitest.setup";

import type { LinkAsProps } from "../../lib/link-as";
import { TabBar, type TabBarItem } from "./tab-bar";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

function RouterLink({ href, className, children, ...props }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="" {...props}>
      {children}
    </a>
  );
}

describe("TabBar", () => {
  it("is a navigation landmark named Primary by default", () => {
    render(<TabBar items={ITEMS} value="home" />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("carries five destinations too", () => {
    render(
      <TabBar
        items={[...ITEMS, { value: "orders", label: "Orders", icon: Receipt }]}
        value="home"
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("marks the current destination with aria-current=page, in the brand colour", () => {
    render(<TabBar items={ITEMS} value="menu" />);
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-current", "page");
    expect(menu).toHaveClass("text-text-brand", "font-bold");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("puts a 56×30 pill behind the icon with hover/press/active state classes", () => {
    render(<TabBar items={ITEMS} value="menu" />);
    const home = screen.getByRole("button", { name: "Home" });
    expect(home).toHaveClass("group", "rounded-md", "hover:text-ink-800", "active:text-pink-600");
    expect(home).not.toHaveClass("active:press-scale");
    const menu = screen.getByRole("button", { name: "Menu" });
    const activePill = menu.querySelector(".h-7\\.5.w-14.rounded-pill");
    expect(activePill).toHaveClass(
      "group-hover:bg-state-hover",
      "group-active:bg-state-press",
      "group-active:press-scale-icon",
      "bg-state-hover"
    );
  });

  it("reports the chosen destination when a button tab is pressed — by pointer or keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TabBar items={ITEMS} value="home" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(onValueChange).toHaveBeenLastCalledWith("menu");
    screen.getByRole("button", { name: "You" }).focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("you");
    // Controlled: the bar reports the tap but only `value` moves it.
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps a long label on one line, truncated, so five tabs fit at 360px", () => {
    render(
      <TabBar items={[{ value: "orders", label: "Order history", icon: Receipt }]} value="orders" />
    );
    expect(screen.getByText("Order history")).toHaveClass("max-w-full", "truncate");
  });

  it("merges a caller className over its own", () => {
    render(<TabBar items={ITEMS} value="home" className="bg-surface-sunken" />);
    expect(screen.getByRole("navigation")).toHaveClass("bg-surface-sunken");
    expect(screen.getByRole("navigation")).not.toHaveClass("bg-surface-card");
  });

  it("announces a count with its label and hides the visual pill", () => {
    render(<TabBar items={ITEMS} value="home" />);
    const cart = screen.getByRole("button", { name: "Cart (2)" });
    const pill = cart.querySelector('[aria-hidden="true"].rounded-pill');
    expect(pill).toHaveTextContent("2");
  });

  it("renders link tabs through linkAs when items have an href", () => {
    render(
      <TabBar
        items={ITEMS.map((item) => ({ ...item, href: `#${item.value}` }))}
        value="cart"
        linkAs={RouterLink}
      />
    );
    const cart = screen.getByRole("link", { name: "Cart (2)" });
    expect(cart).toHaveAttribute("href", "#cart");
    expect(cart).toHaveAttribute("aria-current", "page");
    expect(cart).toHaveAttribute("data-router-link");
  });

  it("sits in the fixed 64px bar height", () => {
    render(<TabBar items={ITEMS} value="home" />);
    expect(screen.getByRole("navigation")).toHaveClass("h-tabbar");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<TabBar items={ITEMS} value="cart" />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <TabBar items={ITEMS} value="home" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
