import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { type Slot, SlotPicker } from "./slot-picker";

const SLOTS: (Slot | string)[] = [
  { value: "asap", label: "ASAP", note: "12 min" },
  "7:30pm",
  "8:00pm",
  { value: "9pm", label: "9:00pm", isDisabled: true },
];

describe("SlotPicker", () => {
  it("renders a named group of radios from both strings and slot objects", () => {
    render(<SlotPicker label="Pickup time" slots={SLOTS} />);
    expect(screen.getByRole("radiogroup", { name: "Pickup time" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("radio", { name: "ASAP, 12 min" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeInTheDocument();
  });

  it("marks the chosen slot", () => {
    render(<SlotPicker label="Pickup time" slots={SLOTS} value="7:30pm" />);
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "8:00pm" })).not.toBeChecked();
  });

  it("reports the slot that was picked", async () => {
    const handleValueChange = vi.fn();
    render(<SlotPicker label="Pickup time" onValueChange={handleValueChange} slots={SLOTS} />);

    await userEvent.click(screen.getByRole("radio", { name: "8:00pm" }));

    expect(handleValueChange).toHaveBeenCalledWith("8:00pm");
  });

  it("keeps its own choice when uncontrolled", async () => {
    render(<SlotPicker defaultValue="7:30pm" label="Pickup time" slots={SLOTS} />);

    await userEvent.click(screen.getByRole("radio", { name: "8:00pm" }));

    expect(screen.getByRole("radio", { name: "8:00pm" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "7:30pm" })).not.toBeChecked();
  });

  it("moves between slots with the arrow keys", async () => {
    const handleValueChange = vi.fn();
    render(
      <SlotPicker
        defaultValue="7:30pm"
        label="Pickup time"
        onValueChange={handleValueChange}
        slots={["7:30pm", "8:00pm"]}
      />
    );

    await userEvent.click(screen.getByRole("radio", { name: "7:30pm" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "8:00pm" })).toHaveFocus();

    await userEvent.keyboard(" ");
    expect(handleValueChange).toHaveBeenCalledWith("8:00pm");
  });

  it("strikes a sold-out slot through rather than hiding it", async () => {
    const handleValueChange = vi.fn();
    render(<SlotPicker label="Pickup time" onValueChange={handleValueChange} slots={SLOTS} />);

    const soldOut = screen.getByRole("radio", { name: "9:00pm" });
    expect(soldOut).toBeDisabled();
    expect(screen.getByText("9:00pm")).toHaveClass("line-through");

    await userEvent.click(soldOut);
    expect(handleValueChange).not.toHaveBeenCalled();
  });

  it("disables every slot when the whole group is disabled", () => {
    render(<SlotPicker disabled label="Pickup time" slots={SLOTS} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });

  it("disables every slot and mutes the label on the disabled status", () => {
    render(<SlotPicker label="Pickup time" slots={SLOTS} status="disabled" />);
    expect(screen.getByRole("radio", { name: "7:30pm" })).toBeDisabled();
    expect(screen.getByText("Pickup time")).toHaveClass("text-text-subtle");
  });

  it("auto-fits at a 96px minimum unless a column count is set", () => {
    const { rerender } = render(<SlotPicker label="Pickup time" slots={SLOTS} />);
    expect(screen.getByRole("radiogroup")).toHaveClass(
      "grid-cols-[repeat(auto-fit,minmax(min(6rem,100%),1fr))]"
    );

    rerender(<SlotPicker columns={3} label="Pickup time" slots={SLOTS} />);
    expect(screen.getByRole("radiogroup")).toHaveClass("grid-cols-3");
  });

  it.each([
    ["error", "border-(--field-border-error)"],
    ["success", "border-(--field-border-success)"],
    ["warning", "border-(--field-border-warning)"],
  ] as const)("paints the slots with the %s border", (status, expected) => {
    render(
      <SlotPicker
        label="Pickup time"
        message="Pick a slot to continue."
        slots={SLOTS}
        status={status}
      />
    );
    expect(screen.getByRole("radio", { name: "7:30pm" })).toHaveClass(expected);
  });

  it("marks the group invalid only on the error status", () => {
    const { rerender } = render(
      <SlotPicker
        label="Pickup time"
        message="Pick a slot to continue."
        slots={SLOTS}
        status="error"
      />
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a slot to continue.");

    rerender(
      <SlotPicker
        label="Pickup time"
        message="That slot is nearly full."
        slots={SLOTS}
        status="warning"
      />
    );
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
  });

  it("replaces the hint with the status message and describes the group with it", () => {
    render(
      <SlotPicker
        hint="Slots open 30 minutes ahead."
        label="Pickup time"
        message="Pick a slot to continue."
        slots={SLOTS}
        status="error"
      />
    );
    const group = screen.getByRole("radiogroup");
    const describedBy = group.getAttribute("aria-describedby");
    expect(screen.queryByText("Slots open 30 minutes ahead.")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("id", describedBy);
  });

  it("merges a caller className", () => {
    const { container } = render(
      <SlotPicker className="gap-6" label="Pickup time" slots={SLOTS} />
    );
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2.5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SlotPicker hint="Slots open 30 minutes ahead." label="Pickup time" slots={SLOTS} />
        <SlotPicker
          columns={3}
          label="Table size"
          message="Pick a table size to continue."
          slots={["2 guests", "4 guests", "6 guests"]}
          status="error"
        />
        <SlotPicker
          label="Booking time"
          message="Table booking opens at 11am."
          slots={SLOTS}
          status="disabled"
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
