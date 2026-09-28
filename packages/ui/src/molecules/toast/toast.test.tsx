import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Toast, ToastProvider } from "./toast";

const VIEW_CART = { label: "View Cart", altText: "View your cart" } as const;

function notifications(): HTMLElement {
  return screen.getByRole("region", { name: "Notifications (F8)" });
}

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows its message in the notifications region", () => {
    render(
      <ToastProvider>
        <Toast>Added to your order.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByText("Added to your order.")).toBeInTheDocument();
  });

  it.each([
    ["brand", "brand", "bg-surface-brand", "lucide-check"],
    ["ink", "ink", "bg-surface-inverse", "lucide-info"],
    ["success", "ink", "bg-toast-success-bg", "lucide-check"],
    ["danger", "ink", "bg-status-danger", "lucide-triangle-alert"],
  ] as const)("paints the %s tone as a %s field with its glyph", (tone, surface, fill, glyph) => {
    render(
      <ToastProvider>
        <Toast tone={tone}>Order confirmed.</Toast>
      </ToastProvider>
    );
    const item = within(notifications()).getByRole("listitem");
    expect(item).toHaveAttribute("data-surface", surface);
    expect(item).toHaveClass(fill);
    expect(item.querySelector(`svg.${glyph}`)).toBeInTheDocument();
  });

  it("takes a glyph of its own", () => {
    render(
      <ToastProvider>
        <Toast icon={Heart}>Saved to favourites.</Toast>
      </ToastProvider>
    );
    expect(
      within(notifications()).getByRole("listitem").querySelector("svg.lucide-heart")
    ).toBeInTheDocument();
  });

  it.each([
    ["brand", "polite"],
    ["ink", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s toast %sly — a failure interrupts, a confirmation waits",
    (tone, politeness) => {
      render(
        <ToastProvider>
          <Toast tone={tone}>Order update.</Toast>
        </ToastProvider>
      );
      // Radix portals its announcer into the body: `type` "background" → polite, "foreground" → assertive.
      expect(
        document.body.querySelector(`[role="status"][aria-live="${politeness}"]`)
      ).toBeInTheDocument();
    }
  );

  it("merges a caller className over the pill", () => {
    render(
      <ToastProvider>
        <Toast className="rounded-lg">Added to your order.</Toast>
      </ToastProvider>
    );
    const item = within(notifications()).getByRole("listitem");
    expect(item).toHaveClass("rounded-lg");
    expect(item).not.toHaveClass("rounded-pill");
  });

  it("runs its action, then closes and reports it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast tone="brand" onOpenChange={onOpenChange} action={{ ...VIEW_CART, onClick }}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const viewCart = screen.getByRole("button", { name: "View Cart" });
    // A 44px hit height inside the pill (dev parity), its margin pulled back into the padding.
    expect(viewCart).toHaveClass("min-h-hit", "-my-3");
    await user.click(viewCart);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("plays the pop entrance only when asked", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast>Table held.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("listitem")).not.toHaveClass("animate-toast-pop");
    rerender(
      <ToastProvider>
        <Toast isPop>Chilli Paneer added.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("listitem")).toHaveClass("animate-toast-pop");
  });

  it("follows open when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ToastProvider>
        <Toast open={false} onOpenChange={onOpenChange}>
          Table held.
        </Toast>
      </ToastProvider>
    );
    expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
    rerender(
      <ToastProvider>
        <Toast open onOpenChange={onOpenChange}>
          Table held.
        </Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByText("Table held.")).toBeInTheDocument();
  });

  it("closes itself after its duration and reports it", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider duration={3000}>
        <Toast onOpenChange={onOpenChange}>Table held.</Toast>
      </ToastProvider>
    );
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast onOpenChange={onOpenChange}>Table held.</Toast>
      </ToastProvider>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("puts its viewport at the page edge by default, or inside the nearest positioned box", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast>Added.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("list")).toHaveClass("fixed", "bottom-dock-clearance");
    rerender(
      <ToastProvider isContained>
        <Toast>Added.</Toast>
      </ToastProvider>
    );
    const list = within(notifications()).getByRole("list");
    expect(list).toHaveClass("absolute", "bottom-4");
    expect(list).not.toHaveClass("fixed");
  });

  it("hydrates a server-rendered page with no mismatch, then shows the toast", async () => {
    const tree = (
      <ToastProvider>
        <Toast defaultOpen duration={Infinity}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const root = await act(() => hydrateRoot(container, tree, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(within(container).getByText("Added to your order.")).toBeInTheDocument();
    act(() => {
      root.unmount();
    });
    consoleError.mockRestore();
    container.remove();
  });

  it("has no accessibility violations with an action", async () => {
    const { container } = render(
      <ToastProvider>
        <Toast tone="brand" isPop action={{ ...VIEW_CART, onClick: vi.fn() }}>
          Chilli Paneer added.
        </Toast>
      </ToastProvider>
    );
    await expectNoA11yViolations(container);
  });
});
