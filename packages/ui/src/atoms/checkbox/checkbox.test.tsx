import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Checkbox } from "./checkbox";

/** The drawn box: the input's next sibling is the decorative control slot, the box sits inside. */
const boxOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

describe("Checkbox", () => {
  it("is a native checkbox named by its label, toggled by clicking the row", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Masala fries on the side" />);
    const checkbox = screen.getByRole("checkbox", { name: "Masala fries on the side" });
    expect(checkbox).not.toBeChecked();
    await user.click(screen.getByText("Masala fries on the side"));
    expect(checkbox).toBeChecked();
  });

  it("toggles with the space bar and rings its box on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Order updates by SMS" />);
    await user.tab();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    expect(boxOf(checkbox)).toHaveClass("group-has-focus-visible/choice:outline-2");
  });

  it("draws the checked state as a pink box with a white tick (CSS off the native state)", () => {
    render(<Checkbox label="Extra burnt chilli mayo" defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    expect(boxOf(checkbox)).toHaveClass(
      "group-has-checked/choice:bg-pink-500",
      "group-has-checked/choice:text-ink-000"
    );
    expect(boxOf(checkbox)?.querySelector(".lucide-check")).toBeInTheDocument();
  });

  it("prints an add-on price as +₹ and includes it in the accessible name", () => {
    render(<Checkbox label="Extra burnt chilli mayo" price={40} />);
    expect(
      screen.getByRole("checkbox", { name: "Extra burnt chilli mayo +₹40" })
    ).toBeInTheDocument();
    expect(screen.getByText("+₹40")).toHaveClass("font-display", "font-bold");
  });

  it("announces the description as a description, not as part of the name", () => {
    render(
      <Checkbox label="Make it a meal" description="Adds fries and a kulhad chai." price={120} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Make it a meal +₹120" });
    expect(checkbox).toHaveAccessibleDescription("Adds fries and a kulhad chai.");
  });

  it("keeps Field's aria-describedby next to its own description", () => {
    render(
      <Checkbox
        label="I agree to the terms"
        description="Read them first."
        aria-describedby="terms-error"
      />
    );
    const ids = screen.getByRole("checkbox").getAttribute("aria-describedby")?.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids).toContain("terms-error");
  });

  it("marks itself invalid and paints the box as an error", () => {
    render(<Checkbox label="I agree to the terms" isInvalid />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(boxOf(checkbox)).toHaveClass("group-has-aria-invalid/choice:border-status-danger");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("mayo");
    render(<Checkbox label="Extra burnt chilli mayo" {...field} />);
    const checkbox = screen.getByRole("checkbox");

    expect(field.ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute("name", "mayo");
    await user.click(checkbox);
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables the whole row with a real fill, never opacity, and ignores clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Checkbox label="Truffle oil" description="Sold out today." disabled onChange={onChange} />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Truffle oil" });
    expect(checkbox).toBeDisabled();
    expect(checkbox.closest("label")).toHaveClass(
      "has-disabled:cursor-not-allowed",
      "has-disabled:text-ink-400"
    );
    expect(boxOf(checkbox)).toHaveClass("group-has-disabled/choice:bg-ink-200");
    await user.click(screen.getByText("Truffle oil"));
    expect(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("puts className on the row, not the input, replacing a conflicting class", () => {
    render(<Checkbox label="Extra mayo" className="w-full gap-6" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toHaveClass("w-full");
    expect(checkbox.closest("label")).toHaveClass("w-full", "gap-6");
    expect(checkbox.closest("label")).not.toHaveClass("gap-3");
  });

  it("has no accessibility violations checked, priced, described, invalid and disabled", async () => {
    const { container } = render(
      <>
        <Checkbox
          label="Make it a meal"
          description="Adds fries and a kulhad chai."
          price={120}
          defaultChecked
          isInvalid
        />
        <Checkbox label="Truffle oil" description="Sold out today." price={60} disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
