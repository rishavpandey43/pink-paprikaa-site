import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Snackbar } from "./snackbar";

describe("Snackbar", () => {
  it("announces its message politely", () => {
    render(<Snackbar duration={0}>Table held for 10 minutes.</Snackbar>);
    expect(screen.getByRole("status")).toHaveTextContent("Table held for 10 minutes.");
  });

  it("renders nothing while closed", () => {
    render(<Snackbar isOpen={false}>Table held for 10 minutes.</Snackbar>);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("interrupts for a failure instead of waiting its turn", () => {
    render(
      <Snackbar duration={0} tone="danger">
        That card did not go through.
      </Snackbar>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([
    ["ink", "bg-surface-inverse"],
    ["brand", "bg-brand-primary"],
    ["success", "bg-status-success"],
  ] as const)("fills the %s tone", (tone, expected) => {
    render(
      <Snackbar duration={0} tone={tone}>
        Code copied. Paste it at checkout.
      </Snackbar>
    );
    expect(screen.getByRole("status")).toHaveClass(expected);
  });

  it.each([
    ["bottom-center", "justify-center"],
    ["bottom-left", "justify-start"],
    ["top-right", "justify-end"],
  ] as const)("anchors itself %s", (position, expected) => {
    const { container } = render(
      <Snackbar duration={0} position={position}>
        Code copied. Paste it at checkout.
      </Snackbar>
    );
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("calls onAction when the text action is pressed", async () => {
    const handleAction = vi.fn();
    render(
      <Snackbar action="Undo" duration={0} onAction={handleAction}>
        Chilli Paneer removed.
      </Snackbar>
    );

    await userEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("inks the brand tone white on the pink flood", () => {
    render(
      <Snackbar duration={0} tone="brand">
        Added to your order.
      </Snackbar>
    );
    const node = screen.getByRole("status");

    expect(node).toHaveClass("bg-brand-primary");
    expect(node).toHaveClass("text-text-on-brand");
  });

  it("shows no dismiss control without a close handler", () => {
    render(<Snackbar duration={0}>Chilli Paneer removed.</Snackbar>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("calls onClose when the dismiss control is pressed", async () => {
    const handleClose = vi.fn();
    render(
      <Snackbar duration={0} onClose={handleClose}>
        Chilli Paneer removed.
      </Snackbar>
    );

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("auto-hides once the duration is up", () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    try {
      render(<Snackbar onClose={handleClose}>Code copied. Paste it at checkout.</Snackbar>);

      expect(handleClose).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(3200);
      });
      expect(handleClose).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays up when the duration is disabled", () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    try {
      render(
        <Snackbar duration={0} onClose={handleClose}>
          Code copied. Paste it at checkout.
        </Snackbar>
      );

      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(handleClose).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("merges a caller className", () => {
    const { container } = render(
      <Snackbar className="fixed" duration={0}>
        Code copied. Paste it at checkout.
      </Snackbar>
    );
    const node = container.firstElementChild;
    expect(node).toHaveClass("fixed");
    expect(node).not.toHaveClass("absolute");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Snackbar action="Undo" duration={0} onAction={vi.fn()} onClose={vi.fn()}>
        Chilli Paneer removed.
      </Snackbar>
    );
    await expectNoA11yViolations(container);
  });
});
