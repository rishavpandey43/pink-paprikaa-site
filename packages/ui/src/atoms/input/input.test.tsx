import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Phone } from "lucide-react";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Input } from "./input";

/** The brand mark (Plan 2a's SymbolMark) is the only `.mask-symbol` element. */
const markIn = (root: HTMLElement) => root.querySelector(".mask-symbol");

describe("Input", () => {
  it("is a md text field on its own light island by default", () => {
    render(<Input aria-label="Full name" />);
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveAttribute("type", "text");
    const box = screen.getByRole("textbox", { name: "Full name" }).parentElement;
    expect(box).toHaveAttribute("data-surface", "light");
    expect(box).toHaveClass("h-field-md", "text-body", "border", "border-border-default");
  });

  it.each([
    ["sm", "h-field-sm", "text-body"],
    ["md", "h-field-md", "text-body"],
    ["lg", "h-field-lg", "text-body"],
  ] as const)("renders size %s at %s with the 16px value text %s", (size, height, text) => {
    render(<Input aria-label="Guests" size={size} />);
    expect(screen.getByRole("textbox").parentElement).toHaveClass(height, text);
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("mobile");
    render(<Input aria-label="Mobile number" {...field} />);
    const input = screen.getByRole("textbox", { name: "Mobile number" });

    expect(field.ref).toHaveBeenCalledWith(input);
    expect(input).toHaveAttribute("name", "mobile");
    await user.type(input, "98");
    expect(field.onChange).toHaveBeenCalledTimes(2);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("puts Field's wiring and native attributes on the input, and className on the box", () => {
    render(
      <Input
        id="mobile"
        aria-describedby="mobile-hint"
        type="tel"
        required
        placeholder="98765 43210"
        className="w-60"
      />
    );
    const input = screen.getByPlaceholderText("98765 43210");
    expect(input).toHaveAttribute("id", "mobile");
    expect(input).toHaveAttribute("aria-describedby", "mobile-hint");
    expect(input).toHaveAttribute("type", "tel");
    expect(input).toBeRequired();
    expect(input).not.toHaveClass("w-60");
    expect(input.parentElement).toHaveClass("w-60");
    expect(input.parentElement).not.toHaveClass("w-full");
  });

  it.each([
    ["error", "border-status-danger", ".lucide-circle-alert"],
    ["success", "border-status-success", ".lucide-circle-check"],
    ["warning", "border-status-warning", ".lucide-triangle-alert"],
  ] as const)(
    "shows %s with a 2px border and its glyph — never by colour alone",
    (status, border, glyph) => {
      const { container } = render(<Input aria-label="Promo code" status={status} />);
      expect(screen.getByRole("textbox").parentElement).toHaveClass("border-2", border);
      expect(container.querySelector(glyph)).toBeInTheDocument();
    }
  );

  it("marks only an error invalid for assistive tech", () => {
    render(
      <>
        <Input aria-label="Card" status="error" />
        <Input aria-label="Promo code" status="success" />
      </>
    );
    expect(screen.getByRole("textbox", { name: "Card" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("textbox", { name: "Promo code" })).not.toHaveAttribute("aria-invalid");
  });

  it("locks a read-only field with a sunken fill and a lock, still focusable and readable", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input aria-label="Outlet" defaultValue="Sector 57" readOnly />);
    const input = screen.getByRole("textbox", { name: "Outlet" });
    expect(input.parentElement).toHaveClass("bg-surface-sunken");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    await user.tab();
    expect(input).toHaveFocus();
    expect(input).toHaveValue("Sector 57");
  });

  it("lets a status glyph win over the lock", () => {
    const { container } = render(<Input aria-label="Outlet" readOnly status="warning" />);
    expect(container.querySelector(".lucide-triangle-alert")).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock")).not.toBeInTheDocument();
  });

  it("pulses the brand mark in place of the glyph while loading, and reports busy", () => {
    const { container } = render(<Input aria-label="Promo code" status="error" isLoading />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-busy", "true");
    expect(markIn(container)).toHaveClass(
      "size-field-spinner",
      "text-pink-500",
      "motion-safe:animate-mark-pulse"
    );
    expect(container.querySelector(".lucide-circle-alert")).not.toBeInTheDocument();
  });

  it("disables through the native attribute, painted with a real fill (never opacity)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Delivery address" disabled onChange={onChange} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input.parentElement).toHaveClass("has-disabled:bg-ink-100", "has-disabled:text-ink-400");
    expect(input.parentElement?.className).not.toMatch(/opacity-/);
    await user.type(input, "98");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders a leading icon, a mono suffix and a trailing slot", () => {
    const { container } = render(
      <Input
        aria-label="Table size"
        icon={Phone}
        suffix="guests"
        trailing={<button type="button">Check</button>}
      />
    );
    expect(container.querySelector(".lucide-phone")).toBeInTheDocument();
    expect(screen.getByText("guests")).toHaveClass("font-mono", "text-field-suffix");
    expect(screen.getByRole("button", { name: "Check" })).toBeInTheDocument();
  });

  it("becomes a vertically resizable textarea, four rows by default", () => {
    render(<Input aria-label="Notes for the kitchen" isMultiline />);
    const textarea = screen.getByRole("textbox", { name: "Notes for the kitchen" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveClass("resize-y");
    expect(textarea.parentElement).toHaveClass("h-auto", "items-start");
  });

  it("takes register() on the textarea too", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("notes");
    render(<Input aria-label="Notes" isMultiline rows={3} {...field} />);
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(field.ref).toHaveBeenCalledWith(textarea);
    expect(textarea).toHaveAttribute("rows", "3");
    await user.type(textarea, "x");
    expect(field.onChange).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations in its richest state", async () => {
    const { container } = render(
      <Input aria-label="Mobile number" icon={Phone} status="error" suffix="+91" isLoading />
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations at rest, read-only and multiline", async () => {
    const { container } = render(
      <>
        <Input aria-label="Full name" />
        <Input aria-label="Outlet" defaultValue="Sector 57" readOnly />
        <Input aria-label="Notes for the kitchen" isMultiline />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
