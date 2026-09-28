import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { QuantityStepper } from "./quantity-stepper";

const DAWAT = { min: 15, max: 2000, step: 5 } as const;

describe("QuantityStepper", () => {
  it("is a named spin button inside a named group, with its range", () => {
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton", { name: "Guests" });
    expect(input).toHaveValue("50");
    expect(input).toHaveAttribute("aria-valuenow", "50");
    expect(input).toHaveAttribute("aria-valuemin", "15");
    expect(input).toHaveAttribute("aria-valuemax", "2000");
    expect(screen.getByRole("group", { name: "Guests" })).toBeInTheDocument();
  });

  it("starts at min when no value is given", () => {
    render(<QuantityStepper label="Plates" min={1} />);
    expect(screen.getByRole("spinbutton", { name: "Plates" })).toHaveValue("1");
  });

  it("steps up and down by one and reports each value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Plates" defaultValue={2} min={1} onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("3");
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("1");
    expect(onValueChange.mock.calls).toEqual([[3], [2], [1]]);
  });

  it("announces the count after a button press (focus stays on the button)", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Plates" defaultValue={2} min={1} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(screen.getByRole("status")).toHaveTextContent("3");
    // Typing or arrowing in the spin button announces itself; the region steps aside.
    await user.click(screen.getByRole("spinbutton"));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("reaches zero when zero removes the line item (min defaults to 0)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" value={1} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Remove one" }));
    expect(onValueChange).toHaveBeenCalledWith(0);
  });

  it.each([
    ["sm", "size-8"],
    ["md", "size-10"],
  ] as const)("renders the %s buttons at their fixed size", (size, expected) => {
    render(<QuantityStepper label="Plates" size={size} />);
    expect(screen.getByRole("button", { name: "Add one" })).toHaveClass(expected);
  });

  it("greys a button at the end of the range with a real colour, never opacity", () => {
    render(<QuantityStepper label="Plates" value={1} min={1} onValueChange={vi.fn()} />);
    const minus = screen.getByRole("button", { name: "Remove one" });
    expect(minus).toHaveClass("disabled:text-ink-400");
    expect(minus.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className over its own", () => {
    render(<QuantityStepper label="Plates" className="rounded-md" />);
    const group = screen.getByRole("group", { name: "Plates" });
    expect(group).toHaveClass("rounded-md");
    expect(group).not.toHaveClass("rounded-pill");
  });

  it("names its buttons by the step they take", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    await user.click(screen.getByRole("button", { name: "Add 5" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("55");
    expect(screen.getByRole("button", { name: "Remove 5" })).toBeEnabled();
  });

  it("names its buttons by decrementLabel and incrementLabel (the dish)", async () => {
    const user = userEvent.setup();
    render(
      <QuantityStepper
        label="Paneer Tikka quantity"
        defaultValue={2}
        min={1}
        decrementLabel="Remove one Paneer Tikka"
        incrementLabel="Add one Paneer Tikka"
      />
    );
    expect(screen.getByRole("group", { name: "Paneer Tikka quantity" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add one Paneer Tikka" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("3");
    expect(screen.getByRole("button", { name: "Remove one Paneer Tikka" })).toBeEnabled();
  });

  it.each(["", "   "])(
    "falls back to the default button names when a label is blank (%j)",
    (blank) => {
      render(
        <QuantityStepper
          label="Guests"
          defaultValue={2}
          decrementLabel={blank}
          incrementLabel={blank}
        />
      );
      expect(screen.getByRole("button", { name: "Remove one" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add one" })).toBeInTheDocument();
    }
  );

  it("disables − at the minimum and + at the maximum", () => {
    const { rerender } = render(
      <QuantityStepper label="Plates" value={1} min={1} max={5} onValueChange={vi.fn()} />
    );
    expect(screen.getByRole("button", { name: "Remove one" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Add one" })).toBeEnabled();
    rerender(<QuantityStepper label="Plates" value={5} min={1} max={5} onValueChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add one" })).toBeDisabled();
  });

  it("reports but keeps the caller's value when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" value={2} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Add one" }));
    expect(onValueChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("spinbutton")).toHaveValue("2");
  });

  it.each([
    ["350", "350"],
    ["5000", "2000"],
    ["3", "15"],
    ["17", "15"],
    ["18", "20"],
  ])("commits a typed %s as %s on blur (15–2000 guests, step 5)", async (typed, committed) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Guests" defaultValue={50} {...DAWAT} onValueChange={onValueChange} />
    );
    const input = screen.getByRole("spinbutton", { name: "Guests" });
    await user.clear(input);
    await user.type(input, typed);
    await user.tab();
    expect(input).toHaveValue(committed);
    expect(onValueChange).toHaveBeenLastCalledWith(Number(committed));
  });

  it("keeps only digits while typing", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "4a2-");
    expect(input).toHaveValue("42");
  });

  it("restores the value when the entry is emptied or escaped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<QuantityStepper label="Plates" defaultValue={4} onValueChange={onValueChange} />);
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue("4");
    await user.type(input, "9");
    expect(input).toHaveValue("49");
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("4");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("commits a typed value on Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <QuantityStepper label="Guests" defaultValue={50} {...DAWAT} onValueChange={onValueChange} />
    );
    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "120{Enter}");
    expect(onValueChange).toHaveBeenCalledWith(120);
    expect(input).toHaveFocus();
  });

  it("steps with the arrow keys and jumps with Home and End", async () => {
    const user = userEvent.setup();
    render(<QuantityStepper label="Guests" defaultValue={50} {...DAWAT} />);
    const input = screen.getByRole("spinbutton");
    await user.click(input);
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("55");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveValue("45");
    await user.keyboard("{Home}");
    expect(input).toHaveValue("15");
    await user.keyboard("{End}");
    expect(input).toHaveValue("2000");
  });

  it("gives react-hook-form's Controller a name, onBlur and a focusable ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const onBlur = vi.fn();
    render(
      <QuantityStepper
        label="Guests"
        name="guests"
        ref={ref}
        onBlur={onBlur}
        defaultValue={20}
        {...DAWAT}
      />
    );
    const input = screen.getByRole("spinbutton");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "guests");
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables the buttons and the field when disabled", () => {
    render(<QuantityStepper label="Plates" defaultValue={2} disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <QuantityStepper label="Plates" defaultValue={1} min={1} />
        <QuantityStepper label="Guests" size="sm" defaultValue={50} {...DAWAT} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
