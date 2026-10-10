import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

import { type SlotOption, SlotPicker } from "./slot-picker";

const SLOTS: SlotOption[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

describe("SlotPicker", () => {
  it("is a named group of radios sharing one name", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    const radios = within(screen.getByRole("group", { name: "Pickup time" })).getAllByRole("radio");
    expect(radios).toHaveLength(5);
    for (const radio of radios) expect(radio).toHaveAttribute("name", "pickup");
  });

  it("names each slot by its label and describes it with its note", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveAccessibleDescription("12 min");
  });

  it("starts at defaultValue and moves with a click when uncontrolled", async () => {
    const user = userEvent.setup();
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} defaultValue="7:30pm" />);
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    await user.click(screen.getByText("8:00pm"));
    expect(screen.getByRole("radio", { name: "8:00pm" })).toBeChecked();
  });

  it("reports the picked slot and follows the caller when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        value="7:30pm"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByText("8:30pm"));
    expect(onValueChange).toHaveBeenCalledWith("8:30pm");
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    rerender(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        value="8:30pm"
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole("radio", { name: "8:30pm" })).toBeChecked();
  });

  it("takes a value with no handler as its starting pick, without React's read-only warning", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(vi.fn());
    try {
      render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} value="7:30pm" />);
      expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
      await user.click(screen.getByText("8:00pm"));
      expect(screen.getByRole("radio", { name: "8:00pm" })).toBeChecked();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      // Restored even when an assertion fails, so a later test's console is real.
      consoleError.mockRestore();
    }
  });

  it("picks from the keyboard", async () => {
    const user = userEvent.setup();
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "ASAP" })).toBeChecked();
  });

  it("moves between slots with the arrow keys, skipping a sold-out one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        defaultValue="8:30pm"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("radio", { name: "8:30pm" }));
    await user.keyboard("{ArrowRight}");
    // 9:00pm is sold out, so the native group wraps round to the first slot.
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "ASAP" })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith("asap");
  });

  it("strikes through and disables a sold-out slot — never hides it, never fades it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} onValueChange={onValueChange} />
    );
    const soldOut = screen.getByRole("radio", { name: "9:00pm" });
    expect(soldOut).toBeDisabled();
    expect(soldOut.closest("label")).toHaveClass("line-through");
    expect(soldOut.closest("label")?.className).not.toMatch(/opacity-/);
    await user.click(screen.getByText("9:00pm"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables every slot and mutes the legend when the group is disabled", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    // jsdom cannot evaluate `:disabled` on the fieldset for styling; the class is the contract.
    expect(screen.getByText("Pickup time")).toHaveClass(
      "group-disabled/slot-picker:text-text-subtle"
    );
  });

  it.each([
    ["error", "border-status-danger"],
    ["success", "border-status-success"],
    ["warning", "border-status-warning"],
  ] as const)("paints the slots with the %s border", (status, border) => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status={status}
        message="Pick a slot to continue."
      />
    );
    expect(screen.getByRole("radio", { name: "7:30pm" }).closest("label")).toHaveClass(border);
  });

  it("shows a hint as its message on the default status, describing the group politely", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        message="Slots open 30 minutes ahead."
      />
    );
    expect(screen.getByRole("group", { name: "Pickup time" })).toHaveAccessibleDescription(
      "Slots open 30 minutes ahead."
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} className="gap-6" />);
    const group = screen.getByRole("group", { name: "Pickup time" });
    expect(group).toHaveClass("gap-6");
    expect(group).not.toHaveClass("gap-2.5");
  });

  it("describes the group with its error message and marks the slots invalid", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status="error"
        message="Pick a slot to continue."
      />
    );
    expect(screen.getByRole("group", { name: "Pickup time" })).toHaveAccessibleDescription(
      "Pick a slot to continue."
    );
    expect(screen.getByRole("radio", { name: "ASAP" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a slot to continue.");
  });

  it("marks the slots invalid only on the error status", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        status="warning"
        message="That slot is nearly full."
      />
    );
    expect(screen.getByRole("radio", { name: "ASAP" })).not.toHaveAttribute("aria-invalid");
  });

  it("lays slots in fixed columns, or auto-fits them without columns", () => {
    const { container, rerender } = render(
      <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} columns={3} />
    );
    expect(container.querySelector(".grid-cols-3")).toBeInTheDocument();
    rerender(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(container.querySelector(".grid-cols-slot-picker")).toBeInTheDocument();
  });

  it("keeps the group named when its legend is visually hidden", () => {
    render(<SlotPicker name="guests" legend="Guests" slots={SLOTS} isLegendHidden />);
    expect(screen.getByRole("group", { name: "Guests" })).toBeInTheDocument();
    expect(screen.getByText("Guests")).toHaveClass("sr-only");
  });

  it("has no accessibility violations at rest or in error", async () => {
    const { container } = render(
      <>
        <SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} defaultValue="7:30pm" />
        <SlotPicker
          name="table"
          legend="Table time"
          slots={SLOTS}
          status="error"
          message="Pick a slot to continue."
        />
        <SlotPicker
          name="booking"
          legend="Booking time"
          slots={SLOTS}
          disabled
          message="Table booking opens at 11am."
        />
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx, id and data-* on its fieldset", () => {
    render(
      <SlotPicker
        name="pickup"
        legend="Pickup time"
        slots={SLOTS}
        id="pickup"
        data-section="order"
        sx={{ mt: 4 }}
      />
    );
    const group = screen.getByRole("group", { name: "Pickup time" });
    expect(group).toHaveAttribute("id", "pickup");
    expect(group).toHaveAttribute("data-section", "order");
    expect(group).toHaveClass("mt-4");
  });

  it("forwards a ref to the fieldset", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(<SlotPicker ref={ref} name="pickup" legend="Pickup time" slots={SLOTS} />);
    expect(ref.current).toBe(screen.getByRole("group", { name: "Pickup time" }));
  });

  it("renders Field around itself when given an error message", () => {
    render(<SlotPicker name="pickup" legend="Pickup time" slots={SLOTS} error="Pick a slot" />);
    expect(screen.getByText("Pick a slot")).toBeInTheDocument();
  });
});
