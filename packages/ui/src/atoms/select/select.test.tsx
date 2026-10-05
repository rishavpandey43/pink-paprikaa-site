import { render, screen, within } from "@testing-library/react";
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
  it("is our combobox trigger (not a visible native select) in Input's field box", () => {
    render(<Select aria-label="Pickup time" options={SLOTS} />);
    const trigger = screen.getByRole("combobox", { name: "Pickup time" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger.parentElement).toHaveAttribute("data-surface", "light");
    expect(trigger.parentElement).toHaveClass("h-field-md", "rounded-md", "border-border-default");
    expect(document.querySelector("select:not([aria-hidden])")).toBeNull();
    expect(document.querySelector("select[aria-hidden]")).not.toBeNull();
  });

  it("opens our listbox with a brand diamond on the chosen row", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Pickup time" defaultValue="20:00" defaultOpen options={SLOTS} />);
    const listbox = screen.getByRole("listbox", { name: "Pickup time" });
    expect(listbox).toBeVisible();
    const chosen = within(listbox).getByRole("option", { name: "8:00pm" });
    expect(chosen).toHaveAttribute("aria-selected", "true");
    expect(chosen.querySelector("[aria-hidden='true']")).not.toBeNull();
    expect(within(listbox).getByRole("option", { name: "8:30pm" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await user.click(within(listbox).getByRole("option", { name: "7:30pm" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("combobox")).toHaveTextContent("7:30pm");
  });

  it("keyboard: Enter opens, arrows skip disabled, Enter selects, Escape returns focus", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Pickup time" options={SLOTS} />);
    const trigger = screen.getByRole("combobox", { name: "Pickup time" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeVisible();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    // skipped the disabled 8:30pm from first → second is 8:00, third would be disabled so wraps/skips
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("keyboard: Home/End, type-to-jump, Tab closes without selecting", async () => {
    const user = userEvent.setup();
    const spices = [
      { value: "mild", label: "Mild" },
      { value: "medium", label: "Medium" },
      { value: "hot", label: "Hot" },
    ];
    render(<Select aria-label="Spice" options={spices} />);
    const trigger = screen.getByRole("combobox", { name: "Spice" });
    trigger.focus();
    await user.keyboard("{Enter}");
    // Await between keys so activeIndex state commits before Enter selects.
    await user.keyboard("{End}");
    await user.keyboard("{Enter}");
    expect(trigger).toHaveTextContent("Hot");

    await user.keyboard("{Enter}");
    await user.keyboard("{Home}");
    await user.keyboard("{Enter}");
    expect(trigger).toHaveTextContent("Mild");

    await user.keyboard("{Enter}");
    await user.keyboard("me");
    await user.keyboard("{Enter}");
    expect(trigger).toHaveTextContent("Medium");

    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeVisible();
    await user.tab();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveTextContent("Medium");
  });

  it("rotates the chevron when open", async () => {
    const user = userEvent.setup();
    const { container } = render(<Select aria-label="Outlet" options={SLOTS} />);
    expect(container.querySelector(".rotate-180")).toBeNull();
    await user.click(screen.getByRole("combobox"));
    expect(container.querySelector(".rotate-180")).not.toBeNull();
  });

  it("takes react-hook-form register() on the hidden native select", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("slot");
    render(<Select aria-label="Pickup time" options={SLOTS} {...field} />);
    const hidden = document.querySelector("select[aria-hidden]");
    expect(field.ref).toHaveBeenCalledWith(hidden);
    expect(hidden).toHaveAttribute("name", "slot");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "8:00pm" }));
    expect(field.onChange).toHaveBeenCalled();
    expect(hidden).toHaveValue("20:00");
  });

  it("FormData posts the value", async () => {
    const user = userEvent.setup();
    let posted: FormData | undefined;
    render(
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          posted = new FormData(event.currentTarget);
        }}
      >
        <Select aria-label="Outlet" name="outlet" defaultValue="20:00" options={SLOTS} />
        <button type="submit">Save</button>
      </form>
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(posted?.get("outlet")).toBe("20:00");
  });

  it("readOnly cannot open and still posts through a hidden input", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Select aria-label="Outlet" name="outlet" readOnly defaultValue="20:00" options={SLOTS} />
    );
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute("name", "outlet");
    expect(container.querySelector('input[type="hidden"]')).toHaveValue("20:00");
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
  });

  it("error → aria-invalid; required → aria-required", () => {
    render(
      <>
        <Select aria-label="Pickup time" status="error" required options={SLOTS} />
        <Select aria-label="Outlet" status="warning" options={SLOTS} />
      </>
    );
    expect(screen.getByRole("combobox", { name: "Pickup time" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByRole("combobox", { name: "Pickup time" })).toHaveAttribute(
      "aria-required",
      "true"
    );
    expect(screen.getByRole("combobox", { name: "Outlet" })).not.toHaveAttribute("aria-invalid");
  });

  it("sheet=true opens as a bottom sheet", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Spice" sheet options={SLOTS} />);
    await user.click(screen.getByRole("combobox"));
    expect(document.querySelector('[class*="animate-sheet-in"]')).not.toBeNull();
    expect(screen.getByRole("listbox")).toBeVisible();
  });

  it("rests with a chevron; status glyphs replace it", () => {
    const { container, rerender } = render(<Select aria-label="Outlet" options={SLOTS} />);
    expect(container.querySelector(".lucide-chevron-down")).toBeInTheDocument();
    rerender(<Select aria-label="Outlet" status="error" options={SLOTS} />);
    expect(container.querySelector(".lucide-circle-alert")).toBeInTheDocument();
    expect(container.querySelector(".lucide-chevron-down")).not.toBeInTheDocument();
  });

  it("disables with a real fill, never opacity", () => {
    render(<Select aria-label="Delivery slot" disabled options={SLOTS} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(trigger.parentElement).toHaveClass(
      "has-[>:is(input,textarea,select,button[role=combobox]):disabled]:bg-ink-100"
    );
    expect(trigger.parentElement?.className).not.toMatch(/opacity-/);
  });

  it("clears a leading icon with its text inset", () => {
    const { container } = render(<Select aria-label="Guests" icon={Users} options={SLOTS} />);
    expect(container.querySelector(".lucide-users")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("ps-11");
  });

  it("is accessible closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Select
        aria-label="Guests"
        icon={Users}
        placeholder="Choose"
        status="error"
        options={SLOTS}
      />
    );
    await expectNoA11yViolations(container);
    await user.click(screen.getByRole("combobox"));
    await expectNoA11yViolations(screen.getByRole("listbox"));
  });

  it("takes sx on its outermost element", () => {
    const { container } = render(
      <Select aria-label="Guests" options={[{ value: "2", label: "2" }]} sx={{ mt: 4 }} />
    );
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("calls onValueChange when an option is chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Select aria-label="Pickup time" options={SLOTS} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "8:00pm" }));
    expect(onValueChange).toHaveBeenCalledWith("20:00");
  });

  it("Space opens the list from a focused trigger", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Pickup time" options={SLOTS} />);
    screen.getByRole("combobox").focus();
    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeVisible();
  });
});
