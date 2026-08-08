import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renders the screen body inside a positioned frame", () => {
    const { container } = render(
      <AppShell>
        <h1>Menu</h1>
      </AppShell>
    );
    const root = container.firstElementChild;

    expect(screen.getByRole("heading", { name: "Menu" })).toBeInTheDocument();
    expect(root).toHaveClass("relative", "overflow-hidden");
  });

  it("renders the tab bar and the overlay alongside the body", () => {
    render(
      <AppShell
        overlay={<div role="dialog">Remove this item?</div>}
        tabBar={<nav aria-label="Primary">Menu</nav>}
      >
        <h1>Menu</h1>
      </AppShell>
    );

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("stacks the overlay after the tab bar so a sheet covers it", () => {
    const { container } = render(
      <AppShell overlay={<div data-slot="sheet" />} tabBar={<nav aria-label="Primary" />}>
        <h1>Menu</h1>
      </AppShell>
    );
    const children = [...(container.firstElementChild?.children ?? [])];
    const tabBarIndex = children.findIndex((child) => child.tagName === "NAV");
    const overlayIndex = children.findIndex((child) => child.getAttribute("data-slot") === "sheet");

    expect(overlayIndex).toBeGreaterThan(tabBarIndex);
  });

  it.each([
    ["sm", "w-[375px]"],
    ["md", "w-[390px]"],
    ["lg", "w-[430px]"],
    ["fluid", "w-full"],
  ] as const)("renders the %s artboard", (size, expected) => {
    const { container } = render(
      <AppShell size={size}>
        <h1>Menu</h1>
      </AppShell>
    );
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("renders the clock on the simulated status bar", () => {
    const { container } = render(
      <AppShell time="9:41">
        <h1>Menu</h1>
      </AppShell>
    );
    expect(container.textContent).toContain("9:41");
  });

  it("hides the simulated device chrome from assistive tech", () => {
    const { container } = render(
      <AppShell>
        <h1>Menu</h1>
      </AppShell>
    );
    const chrome = container.querySelectorAll('[aria-hidden="true"]');

    expect(chrome).toHaveLength(2);
  });

  it("flips the chrome ink for a screen that opens on a flooded header", () => {
    const { container } = render(
      <AppShell tone="light">
        <h1>Menu</h1>
      </AppShell>
    );
    const chrome = container.querySelector('[aria-hidden="true"]');

    expect(chrome).toHaveClass("text-text-on-inverse");
    expect(chrome).not.toHaveClass("text-text-heading");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <AppShell className="rounded-4 shadow-elevation1">
        <h1>Menu</h1>
      </AppShell>
    );
    const root = container.firstElementChild;

    expect(root).toHaveClass("rounded-4", "shadow-elevation1");
    expect(root).not.toHaveClass("rounded-[44px]");
    expect(root).not.toHaveClass("shadow-elevation4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AppShell tone="light" tabBar={<nav aria-label="Primary">Menu</nav>}>
        <h1>Menu</h1>
        <p>100% vegetarian kitchen.</p>
      </AppShell>
    );
    await expectNoA11yViolations(container);
  });
});
