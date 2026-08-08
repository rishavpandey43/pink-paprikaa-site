import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Phone } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Input } from "./input";

/** The control is deliberately label-less — `Field` owns the label — so tests name it themselves. */
const NAME = "Mobile number";

describe("Input", () => {
  it("renders a text field the caller can name", () => {
    render(<Input aria-label={NAME} placeholder="98765 43210" />);
    const control = screen.getByRole("textbox", { name: NAME });
    expect(control).toHaveAttribute("type", "text");
    expect(control).toHaveAttribute("placeholder", "98765 43210");
  });

  it("passes the typed value to onChange", async () => {
    const handleChange = vi.fn();
    render(<Input aria-label={NAME} onChange={handleChange} />);

    await userEvent.type(screen.getByRole("textbox", { name: NAME }), "98");

    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it("accepts no typing while disabled", async () => {
    const handleChange = vi.fn();
    render(<Input aria-label={NAME} disabled onChange={handleChange} />);

    const control = screen.getByRole("textbox", { name: NAME });
    await userEvent.type(control, "98");

    expect(control).toBeDisabled();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it.each([
    ["sm", "h-10"],
    ["md", "h-(--field-h)"],
    ["lg", "h-14"],
  ] as const)("renders the %s size at its fixed height", (size, expected) => {
    render(<Input aria-label={NAME} size={size} />);
    expect(screen.getByRole("textbox").parentElement).toHaveClass(expected);
  });

  it.each([
    ["error", "border-(--field-border-error)"],
    ["success", "border-(--field-border-success)"],
    ["warning", "border-(--field-border-warning)"],
  ] as const)("draws the %s border and hangs its glyph", (status, expected) => {
    const { container } = render(<Input aria-label={NAME} status={status} />);
    const field = screen.getByRole("textbox").parentElement;
    expect(field).toHaveClass(expected);
    expect(field).toHaveClass("border-2");
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("marks itself invalid only on the error status", () => {
    const { rerender } = render(<Input aria-label={NAME} status="error" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");

    rerender(<Input aria-label={NAME} status="warning" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("renders a leading glyph, a suffix and a trailing element", () => {
    const { container } = render(
      <Input
        aria-label="Table size"
        icon={Phone}
        suffix="guests"
        trailing={<button type="button">Check</button>}
      />
    );
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(screen.getByText("guests")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeInTheDocument();
  });

  it("swaps the input for a resizable textarea when multiline", () => {
    render(<Input aria-label="Notes for the kitchen" isMultiline rows={3} />);
    const control = screen.getByRole("textbox", { name: "Notes for the kitchen" });
    expect(control.tagName).toBe("TEXTAREA");
    expect(control).toHaveAttribute("rows", "3");
    expect(control.parentElement).toHaveClass("h-auto");
  });

  it("hangs the pulsing diamond on the trailing edge while loading", () => {
    const { container } = render(<Input aria-label="Promo code" isLoading />);
    expect(container.querySelector(".animate-pp-pulse")).toBeInTheDocument();
  });

  it("shows a lock and a sunken fill when read-only", () => {
    const { container } = render(<Input aria-label="Outlet" readOnly value="Sector 57" />);
    const control = screen.getByRole("textbox", { name: "Outlet" });
    expect(control).toHaveAttribute("readonly");
    expect(control.parentElement).toHaveClass("bg-(--field-bg-readonly)");
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("keeps a real grey fill when disabled rather than fading out", () => {
    render(<Input aria-label={NAME} disabled />);
    const field = screen.getByRole("textbox").parentElement;
    expect(field).toHaveClass("bg-(--field-bg-disabled)");
    expect(field?.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className", () => {
    render(<Input aria-label={NAME} className="rounded-6" />);
    const field = screen.getByRole("textbox").parentElement;
    expect(field).toHaveClass("rounded-6");
    expect(field).not.toHaveClass("rounded-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Input aria-label={NAME} icon={Phone} placeholder="98765 43210" />
        <Input aria-label="Promo code" status="error" />
        <Input aria-label="Outlet" readOnly value="Sector 57" />
        <Input aria-label="Notes for the kitchen" isMultiline />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
