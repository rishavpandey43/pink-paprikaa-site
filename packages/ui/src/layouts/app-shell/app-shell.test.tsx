import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AppShell } from "./app-shell";

function statusRow(): HTMLElement | null {
  return screen.getByText("9:41").parentElement;
}

describe("AppShell", () => {
  it("frames the screen at 390×844 as a light surface that anchors its overlays", () => {
    render(<AppShell data-testid="shell" />);
    const shell = screen.getByTestId("shell");
    expect(shell).toHaveAttribute("data-surface", "light");
    expect(shell).toHaveClass(
      "relative",
      "overflow-hidden",
      "contain-layout",
      "w-app-shell-w",
      "h-app-shell-h",
      "rounded-app-shell",
      "bg-surface-page",
      "shadow-4"
    );
  });

  it("offers the 360×780 phone, the system's smallest screen", () => {
    render(<AppShell frame="phone-sm" data-testid="shell" />);
    expect(screen.getByTestId("shell")).toHaveClass("w-app-shell-sm-w", "h-app-shell-sm-h");
  });

  it("orders status bar, scrolling body, tab bar, home indicator, then the overlay", () => {
    render(
      <AppShell
        data-testid="shell"
        tabBar={<nav aria-label="Primary">Tabs</nav>}
        overlay={
          <div role="dialog" aria-label="Sheet">
            Sheet
          </div>
        }
      >
        <p>Menu</p>
      </AppShell>
    );
    const [status, body, tabBar, home, overlay] = [...screen.getByTestId("shell").children];
    expect(status).toHaveAttribute("aria-hidden", "true");
    expect(body).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(body).toContainElement(screen.getByText("Menu"));
    expect(tabBar).toBe(screen.getByRole("navigation", { name: "Primary" }));
    expect(home).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toBe(screen.getByRole("dialog", { name: "Sheet" }));
  });

  it("shows the clock as device chrome, hidden from assistive tech", () => {
    render(<AppShell time="12:30" />);
    expect(screen.getByText("12:30").closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("keeps ink status text on the frame's own surface by default", () => {
    render(<AppShell />);
    const status = statusRow();
    expect(status).not.toHaveAttribute("data-surface");
    expect(status).not.toHaveClass("bg-surface-brand");
    expect(status).toHaveClass("text-text-heading", "text-app-shell-status", "font-display");
  });

  it("floods the status row brand, with white text, when the screen opens on a pink header", () => {
    render(<AppShell statusTone="light" />);
    const status = statusRow();
    expect(status).toHaveAttribute("data-surface", "brand");
    expect(status).toHaveClass("bg-surface-brand", "text-text-heading");
  });

  it("hands its frame to a ref — the stable element a Dialog or Toast portals into", () => {
    const frame = createRef<HTMLDivElement>();
    render(<AppShell ref={frame} data-testid="shell" overlay={<p>Sheet</p>} />);
    expect(frame.current).toBe(screen.getByTestId("shell"));
    expect(frame.current).toContainElement(screen.getByText("Sheet"));
  });

  it("lets a consumer className replace the frame's radius and shadow", () => {
    render(<AppShell className="rounded-lg shadow-1" data-testid="shell" />);
    const shell = screen.getByTestId("shell");
    expect(shell).toHaveClass("rounded-lg", "shadow-1");
    expect(shell).not.toHaveClass("rounded-app-shell");
    expect(shell).not.toHaveClass("shadow-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AppShell
        tabBar={
          <nav aria-label="Primary">
            <a href="#menu">Menu</a>
          </nav>
        }
      >
        <h1>Menu</h1>
      </AppShell>
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations on the light status tone with a sheet open", async () => {
    const { container } = render(
      <AppShell
        statusTone="light"
        tabBar={
          <nav aria-label="Primary">
            <a href="#home">Home</a>
          </nav>
        }
        overlay={
          <div role="dialog" aria-label="Remove this item?">
            <button type="button">Remove</button>
          </div>
        }
      >
        <h1>Home</h1>
      </AppShell>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root", () => {
    render(
      <AppShell data-testid="root" sx={{ mt: 6, px: { md: 4 } }}>
        x
      </AppShell>
    );
    expect(screen.getByTestId("root")).toHaveClass("mt-6", "md:px-4");
  });
});
