import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { TabBar, type TabBarItem } from "./tab-bar";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

const FIVE: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag },
  { value: "orders", label: "Orders", icon: Receipt },
  { value: "you", label: "You", icon: User },
];

describe("TabBar", () => {
  it("renders one button per destination inside a named navigation", () => {
    render(<TabBar items={ITEMS} />);

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("carries five destinations too", () => {
    render(<TabBar items={FIVE} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("marks the destination in view as the current page", () => {
    render(<TabBar items={ITEMS} value="menu" />);

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("starts on the first destination when nothing is passed", () => {
    render(<TabBar items={ITEMS} />);
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("starts on defaultValue when the bar keeps its own state", () => {
    render(<TabBar defaultValue="you" items={ITEMS} />);
    expect(screen.getByRole("button", { name: "You" })).toHaveAttribute("aria-current", "page");
  });

  it("moves itself when uncontrolled", async () => {
    render(<TabBar items={ITEMS} />);

    await userEvent.click(screen.getByRole("button", { name: "Menu" }));

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-current", "page");
  });

  it("reports the destination but does not move itself when controlled", async () => {
    const handleValueChange = vi.fn();
    render(<TabBar items={ITEMS} onValueChange={handleValueChange} value="home" />);

    await userEvent.click(screen.getByRole("button", { name: "Menu" }));

    expect(handleValueChange).toHaveBeenCalledWith("menu");
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("announces a waiting count alongside the destination", () => {
    render(<TabBar items={ITEMS} />);
    expect(screen.getByRole("button", { name: "Cart, 2 items" })).toBeInTheDocument();
  });

  it("says one item in the singular", () => {
    render(<TabBar items={[{ value: "cart", label: "Cart", icon: ShoppingBag, count: 1 }]} />);
    expect(screen.getByRole("button", { name: "Cart, 1 item" })).toBeInTheDocument();
  });

  it("holds the bar at the 64px chrome height", () => {
    const { container } = render(<TabBar items={ITEMS} />);
    expect(container.querySelector("ul")).toHaveClass("h-(--layout-tabbar-h)");
  });

  it("merges a caller className", () => {
    render(<TabBar className="bg-surface-sunken" items={ITEMS} />);
    const node = screen.getByRole("navigation");
    expect(node).toHaveClass("bg-surface-sunken");
    expect(node).not.toHaveClass("bg-surface-card");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<TabBar items={ITEMS} value="cart" />);
    await expectNoA11yViolations(container);
  });
});
