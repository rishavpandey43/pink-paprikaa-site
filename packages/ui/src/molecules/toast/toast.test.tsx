import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gift } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Toast } from "./toast";

describe("Toast", () => {
  it("announces a confirmation politely", () => {
    render(<Toast>Table held for 10 minutes.</Toast>);
    expect(screen.getByRole("status")).toHaveTextContent("Table held for 10 minutes.");
  });

  it("interrupts for a failure instead of waiting its turn", () => {
    render(<Toast tone="danger">That card did not go through.</Toast>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-brand-primary"],
    ["ink", "bg-surface-inverse"],
    ["success", "bg-status-success"],
  ] as const)("fills the %s tone", (tone, expected) => {
    render(<Toast tone={tone}>Added to your order.</Toast>);
    expect(screen.getByRole("status")).toHaveClass(expected);
  });

  it("inks the brand tone white on the pink flood", () => {
    render(<Toast tone="brand">Added to your order.</Toast>);
    const node = screen.getByRole("status");

    expect(node).toHaveClass("bg-brand-primary");
    expect(node).toHaveClass("text-text-on-brand");
  });

  it("is a pill that rises rather than blinking into place", () => {
    render(<Toast>Added to your order.</Toast>);
    const node = screen.getByRole("status");
    expect(node).toHaveClass("rounded-6");
    expect(node).toHaveClass("animate-pp-rise");
  });

  it("swaps the entrance curve for the single overshoot when popping", () => {
    render(
      <Toast isPopping tone="brand">
        Chilli Paneer added.
      </Toast>
    );
    const node = screen.getByRole("status");
    expect(node).toHaveClass("[animation-timing-function:var(--ease-pop)]");
    expect(node).toHaveClass("animate-pp-rise");
  });

  it("calls onAction when the inline action is pressed", async () => {
    const handleAction = vi.fn();
    render(
      <Toast action="View Cart" onAction={handleAction} tone="brand">
        Added to your order.
      </Toast>
    );

    await userEvent.click(screen.getByRole("button", { name: "View Cart" }));

    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("renders no action without a handler", () => {
    render(<Toast action="View Cart">Added to your order.</Toast>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders one glyph, and the caller's when given", () => {
    const { container } = render(<Toast icon={Gift}>You earned a free masala chai.</Toast>);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("merges a caller className", () => {
    render(<Toast className="rounded-1">Added to your order.</Toast>);
    const node = screen.getByRole("status");
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Toast action="View Cart" onAction={vi.fn()} tone="brand">
        Added to your order.
      </Toast>
    );
    await expectNoA11yViolations(container);
  });
});
