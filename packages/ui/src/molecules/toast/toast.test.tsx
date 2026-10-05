import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";
import { createRef, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Toast, type ToastProps, ToastProvider } from "./toast";

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
    ["neutral", "ink", "bg-surface-inverse", "lucide-info"],
    ["success", "ink", "bg-toast-success-bg", "lucide-check"],
    ["danger", "ink", "bg-status-danger", "lucide-triangle-alert"],
  ] as const)(
    "paints the %s colour as a %s field with its glyph",
    (color, surface, fill, glyph) => {
      render(
        <ToastProvider>
          <Toast color={color}>Order confirmed.</Toast>
        </ToastProvider>
      );
      const item = within(notifications()).getByRole("listitem");
      expect(item).toHaveAttribute("data-surface", surface);
      expect(item).toHaveClass(fill);
      expect(item.querySelector(`svg.${glyph}`)).toBeInTheDocument();
    }
  );

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
    ["neutral", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s toast %sly — a failure interrupts, a confirmation waits",
    (color, politeness) => {
      render(
        <ToastProvider>
          <Toast color={color}>Order update.</Toast>
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
        <Toast color="brand" onOpenChange={onOpenChange} action={{ ...VIEW_CART, onClick }}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const viewCart = screen.getByRole("button", { name: "View Cart" });
    // Design: TextButton caps sm with -mr-2 (Toast.jsx).
    expect(viewCart).toHaveClass("uppercase", "text-overline", "-my-3", "-mr-2");
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
    // Spy first: a server-render warning counts too.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const onRecoverableError = vi.fn();

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

  describe("hands focus back to what opened it (R91)", () => {
    function Opener({ action, duration }: Pick<ToastProps, "action" | "duration">) {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <ToastProvider>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Add Chilli Paneer
          </button>
          <Toast open={isOpen} onOpenChange={setIsOpen} action={action} duration={duration}>
            Chilli Paneer added.
          </Toast>
          <input aria-label="Note" />
        </ToastProvider>
      );
    }

    async function openAndFocusAction(duration?: number) {
      // `delay: null`: user-event never waits on a timer, so the same helper runs under fake timers.
      const user = userEvent.setup({ delay: null });
      render(<Opener action={{ ...VIEW_CART, onClick: vi.fn() }} duration={duration} />);
      const trigger = screen.getByRole("button", { name: "Add Chilli Paneer" });
      await user.click(trigger);
      act(() => {
        within(notifications()).getByRole("button", { name: "View Cart" }).focus();
      });
      return { user, trigger };
    }

    it("after its action", async () => {
      const { user, trigger } = await openAndFocusAction();
      await user.keyboard("{Enter}");
      expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("after Escape", async () => {
      const { user, trigger } = await openAndFocusAction();
      await user.keyboard("{Escape}");
      expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("never lets the timer close it under focus, then restores focus once it does close", async () => {
      // `shouldAdvanceTime`: the clicks and focus moves above still settle in real time.
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const { user, trigger } = await openAndFocusAction(1000);
      // Radix pauses the timer while focus is inside the region: the toast waits for the guest.
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      const viewCart = within(notifications()).getByRole("button", { name: "View Cart" });
      expect(viewCart).toHaveFocus();
      await user.keyboard("{Escape}");
      expect(trigger).toHaveFocus();
    });

    it("when the parent closes it while focus is inside", () => {
      function renderWith(isOpen: boolean) {
        return (
          <ToastProvider>
            <button type="button">Add Chilli Paneer</button>
            <Toast open={isOpen} action={{ ...VIEW_CART, onClick: vi.fn() }}>
              Chilli Paneer added.
            </Toast>
          </ToastProvider>
        );
      }
      const { rerender } = render(renderWith(false));
      const trigger = screen.getByRole("button", { name: "Add Chilli Paneer" });
      trigger.focus();
      rerender(renderWith(true));
      act(() => {
        within(notifications()).getByRole("button", { name: "View Cart" }).focus();
      });
      // No Radix close path: the parent flips `open` itself.
      rerender(renderWith(false));
      expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it("leaves focus alone when it was never inside the toast", async () => {
      const user = userEvent.setup();
      render(<Opener duration={20} />);
      await user.click(screen.getByRole("button", { name: "Add Chilli Paneer" }));
      const note = screen.getByRole("textbox", { name: "Note" });
      note.focus();
      await waitFor(() => {
        expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
      });
      expect(note).toHaveFocus();
    });
  });

  it("has no accessibility violations with an action", async () => {
    const { container } = render(
      <ToastProvider>
        <Toast color="brand" isPop action={{ ...VIEW_CART, onClick: vi.fn() }}>
          Chilli Paneer added.
        </Toast>
      </ToastProvider>
    );
    await expectNoA11yViolations(container);
  });

  it("forwards id, data-*, aria-* and ref to its root, and takes sx", () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <ToastProvider>
        <Toast
          ref={ref}
          id="added"
          data-section="cart"
          aria-describedby="hint"
          sx={{ mt: 4 }}
          className="italic"
        >
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    expect(ref.current).toBeInstanceOf(HTMLLIElement);
    expect(ref.current).toHaveAttribute("id", "added");
    expect(ref.current).toHaveAttribute("data-section", "cart");
    expect(ref.current).toHaveAttribute("aria-describedby", "hint");
    expect(ref.current).toHaveClass("mt-4", "italic");
  });

  it("calls a caller's onFocus and onBlur alongside its own focus tracking", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <ToastProvider>
        <Toast onFocus={onFocus} onBlur={onBlur} action={{ ...VIEW_CART, onClick: vi.fn() }}>
          Added to your order.
        </Toast>
        <button type="button">Elsewhere</button>
      </ToastProvider>
    );
    await user.click(screen.getByRole("button", { name: "View Cart" }));
    expect(onFocus).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(onBlur).toHaveBeenCalled();
  });
});
