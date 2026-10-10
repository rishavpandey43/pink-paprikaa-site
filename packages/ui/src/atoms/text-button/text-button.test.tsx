import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil } from "lucide-react";

import { expectNoA11yViolations } from "#vitest.setup";

import { TextButton } from "./text-button";

describe("TextButton", () => {
  it("is a type=button control with the brand tone by default", () => {
    render(<TextButton>Undo</TextButton>);
    const button = screen.getByRole("button", { name: "Undo" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("text-text-link", "hover:bg-state-hover", "active:press-scale");
  });

  it.each([
    ["brand", "text-text-link", "hover:bg-state-hover"],
    ["neutral", "text-ink-700", "hover:bg-state-hover-neutral"],
    ["danger", "text-status-danger", "hover:bg-status-danger-soft"],
  ] as const)("paints the %s color with %s and %s", (color, ink, hover) => {
    render(<TextButton color={color}>Edit</TextButton>);
    expect(screen.getByRole("button")).toHaveClass(ink, hover);
  });

  it.each([
    ["sm", "h-text-button-h-sm", "text-button-sm"],
    ["md", "h-text-button-h-md", "text-button-md"],
  ] as const)("sizes %s with %s and %s", (size, height, type) => {
    render(<TextButton size={size}>View all</TextButton>);
    expect(screen.getByRole("button")).toHaveClass(height, type);
  });

  it("uppercases with isCaps", () => {
    render(<TextButton isCaps>Dismiss</TextButton>);
    expect(screen.getByRole("button")).toHaveClass("uppercase", "text-overline");
  });

  it("sets data-pressed for pointer and Enter", async () => {
    const user = userEvent.setup();
    render(<TextButton>Undo</TextButton>);
    const button = screen.getByRole("button", { name: "Undo" });
    await user.pointer({ keys: "[MouseLeft>]", target: button });
    expect(button).toHaveAttribute("data-pressed", "");
    await user.pointer({ keys: "[/MouseLeft]", target: button });
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("while loading, reports busy and blocks presses", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <TextButton isLoading onClick={onClick} icon={Pencil}>
        Saving
      </TextButton>
    );
    const button = screen.getByRole("button", { name: "Saving" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("follows the surface for brand/ink (white ink, on-color fills)", () => {
    render(
      <div data-surface="brand">
        <TextButton color="neutral">Undo</TextButton>
      </div>
    );
    expect(screen.getByRole("button")).toHaveClass(
      "in-data-[surface=brand]:text-ink-000",
      "in-data-[surface=brand]:hover:bg-state-hover-on-color"
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <TextButton>Undo</TextButton>
        <TextButton color="danger" isCaps>
          Delete
        </TextButton>
        <TextButton disabled>Sold out</TextButton>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
