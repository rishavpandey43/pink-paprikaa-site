import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Users } from "lucide-react";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Select } from "./select";

const SLOTS = [
  { value: "19:30", label: "7:30pm" },
  { value: "20:00", label: "8:00pm" },
  { value: "20:30", label: "8:30pm", isDisabled: true },
];

describe("Select", () => {
  it("is a native select inside Input's field box", () => {
    render(<Select aria-label="Pickup time" options={SLOTS} />);
    const select = screen.getByRole("combobox", { name: "Pickup time" });
    expect(select.tagName).toBe("SELECT");
    expect(select.parentElement).toHaveAttribute("data-surface", "light");
    expect(select.parentElement).toHaveClass("h-field-md", "rounded-md", "border-border-default");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "7:30pm",
      "8:00pm",
      "8:30pm",
    ]);
    expect(screen.getByRole("option", { name: "8:30pm" })).toBeDisabled();
  });

  it("starts on a disabled placeholder until the guest chooses", () => {
    render(<Select aria-label="Guests" placeholder="Choose a size" options={SLOTS} />);
    expect(screen.getByRole("option", { name: "Choose a size" })).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("keeps a given value over the placeholder", () => {
    render(
      <Select
        aria-label="Pickup time"
        placeholder="Choose a slot"
        defaultValue="20:00"
        options={SLOTS}
      />
    );
    expect(screen.getByRole("combobox")).toHaveValue("20:00");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native select", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("slot");
    render(<Select aria-label="Pickup time" options={SLOTS} {...field} />);
    const select = screen.getByRole("combobox", { name: "Pickup time" });

    expect(field.ref).toHaveBeenCalledWith(select);
    expect(select).toHaveAttribute("name", "slot");
    await user.tab();
    expect(select).toHaveFocus();
    await user.selectOptions(select, "8:00pm");
    expect(field.onChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue("20:00");
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("rests with a chevron", () => {
    const { container } = render(<Select aria-label="Outlet" options={SLOTS} />);
    expect(container.querySelector(".lucide-chevron-down")).toBeInTheDocument();
  });

  it.each([
    ["error", "border-status-danger", ".lucide-circle-alert"],
    ["success", "border-status-success", ".lucide-circle-check"],
    ["warning", "border-status-warning", ".lucide-triangle-alert"],
  ] as const)("shows %s with its glyph in place of the chevron", (status, border, glyph) => {
    const { container } = render(<Select aria-label="Outlet" status={status} options={SLOTS} />);
    expect(screen.getByRole("combobox").parentElement).toHaveClass("border-2", border);
    expect(container.querySelector(glyph)).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("marks only an error invalid", () => {
    render(
      <>
        <Select aria-label="Pickup time" status="error" options={SLOTS} />
        <Select aria-label="Outlet" status="warning" options={SLOTS} />
      </>
    );
    expect(screen.getByRole("combobox", { name: "Pickup time" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByRole("combobox", { name: "Outlet" })).not.toHaveAttribute("aria-invalid");
  });

  it("disables with a real fill, never opacity", () => {
    render(<Select aria-label="Delivery slot" disabled options={SLOTS} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    expect(select.parentElement).toHaveClass(
      "has-[>:is(input,textarea,select):disabled]:bg-ink-100",
      "has-[>:is(input,textarea,select):disabled]:text-ink-400"
    );
    expect(select.parentElement?.className).not.toMatch(/opacity-/);
  });

  it("puts Field's wiring on the select and className on the box", () => {
    render(
      <Select
        id="slot"
        aria-label="Pickup time"
        aria-describedby="slot-hint"
        required
        className="w-60"
        options={SLOTS}
      />
    );
    const select = screen.getByRole("combobox", { name: "Pickup time" });
    expect(select).toHaveAttribute("id", "slot");
    expect(select).toHaveAttribute("aria-describedby", "slot-hint");
    expect(select).toBeRequired();
    expect(select).not.toHaveClass("w-60");
    expect(select.parentElement).toHaveClass("w-60");
    expect(select.parentElement).not.toHaveClass("w-full");
  });

  it("locks when read-only: sunken fill, a lock, and the value cannot change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Select
        aria-label="Outlet"
        readOnly
        defaultValue="20:00"
        onChange={onChange}
        options={SLOTS}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
    await user.selectOptions(select, "7:30pm").catch(() => undefined);
    expect(select).toHaveValue("20:00");
    expect(onChange).not.toHaveBeenCalled();
    expect(select.parentElement).toHaveClass("bg-surface-sunken");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("still submits a read-only value through a hidden input carrying its name", () => {
    const { container } = render(
      <>
        <Select aria-label="Outlet" name="outlet" readOnly defaultValue="20:00" options={SLOTS} />
        <Select aria-label="Pickup time" name="slot" defaultValue="20:00" options={SLOTS} />
      </>
    );
    const hidden = container.querySelectorAll('input[type="hidden"]');
    expect(hidden).toHaveLength(1);
    expect(hidden[0]).toHaveAttribute("name", "outlet");
    expect(hidden[0]).toHaveValue("20:00");
  });

  it("undoes the disabled paint when read-only, and keeps it when also disabled", () => {
    render(
      <>
        <Select aria-label="Outlet" readOnly defaultValue="20:00" options={SLOTS} />
        <Select aria-label="Pickup time" readOnly disabled options={SLOTS} />
      </>
    );
    const readOnly = screen.getByRole("combobox", { name: "Outlet" }).parentElement;
    expect(readOnly).toHaveClass(
      "has-[>:is(input,textarea,select):disabled]:text-text-body",
      "has-[>:is(input,textarea,select):disabled]:border-border-default",
      // Its own sunken fill, not the disabled ink-100 that only happens to match it.
      "has-[>:is(input,textarea,select):disabled]:bg-surface-sunken"
    );
    // One class per assertion: a negated multi-class match passes if any one is absent.
    expect(readOnly).not.toHaveClass("has-[>:is(input,textarea,select):disabled]:text-ink-400");
    expect(readOnly).not.toHaveClass(
      "has-[>:is(input,textarea,select):disabled]:border-border-subtle"
    );
    const disabled = screen.getByRole("combobox", { name: "Pickup time" }).parentElement;
    expect(disabled).toHaveClass("has-[>:is(input,textarea,select):disabled]:text-ink-400");
    expect(disabled).not.toHaveClass("has-[>:is(input,textarea,select):disabled]:text-text-body");
  });

  it.each([
    ["error", "has-[>:is(input,textarea,select):disabled]:border-status-danger"],
    ["success", "has-[>:is(input,textarea,select):disabled]:border-status-success"],
    ["warning", "has-[>:is(input,textarea,select):disabled]:border-status-warning"],
  ] as const)("keeps the %s border when read-only (%s)", (status, border) => {
    render(<Select aria-label="Outlet" readOnly status={status} options={SLOTS} />);
    const box = screen.getByRole("combobox", { name: "Outlet" }).parentElement;
    expect(box).toHaveClass(border);
    expect(box).not.toHaveClass("has-[>:is(input,textarea,select):disabled]:border-border-default");
    expect(box).not.toHaveClass("has-[>:is(input,textarea,select):disabled]:border-border-subtle");
  });

  it("posts no empty value from a read-only placeholder", () => {
    const { container } = render(
      <Select aria-label="Outlet" name="outlet" readOnly placeholder="Choose" options={SLOTS} />
    );
    expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
  });

  it("submits nothing when read-only and disabled", () => {
    const { container } = render(
      <Select
        aria-label="Outlet"
        name="outlet"
        readOnly
        disabled
        defaultValue="20:00"
        options={SLOTS}
      />
    );
    expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument();
  });

  it("clears a leading icon with its text inset", () => {
    const { container } = render(<Select aria-label="Guests" icon={Users} options={SLOTS} />);
    expect(container.querySelector(".lucide-users")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("ps-11");
    expect(screen.getByRole("combobox")).not.toHaveClass("ps-3.5");
  });

  it("never lets a long option label widen its box: it overlays the box and truncates", () => {
    render(
      <Select
        aria-label="Outlet"
        options={[
          {
            value: "57",
            label: "Sector 57, HSVP Market (MKM Market), Gurgaon 122003 — the pickup counter",
          },
        ]}
      />
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("absolute", "inset-0", "size-full", "truncate");
    // Fills its parent; a content-sized parent still gets the R90 intrinsic minimum.
    expect(select.parentElement).toHaveClass("w-full", "min-w-field-select-min");
    // The box's shared `min-w-0` is replaced, not stacked: twMerge keeps only the select minimum.
    expect(select.parentElement).not.toHaveClass("min-w-0");
  });

  it("has no accessibility violations with an icon, a placeholder and an error, disabled or read-only", async () => {
    const { container } = render(
      <>
        <Select
          aria-label="Guests"
          icon={Users}
          placeholder="Choose a size"
          status="error"
          options={SLOTS}
        />
        <Select aria-label="Delivery slot" disabled options={SLOTS} />
        <Select aria-label="Outlet" readOnly defaultValue="20:00" options={SLOTS} />
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its outermost element", () => {
    const { container } = render(
      <Select aria-label="Guests" options={[{ value: "2", label: "2" }]} sx={{ mt: 4 }} />
    );
    expect(container.firstElementChild).toHaveClass("mt-4");
  });
});
