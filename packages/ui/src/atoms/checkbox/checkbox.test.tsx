import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Checkbox } from "./checkbox";

const LABEL = "Extra burnt chilli mayo";

describe("Checkbox", () => {
  it("renders an unchecked box named by its label", () => {
    render(<Checkbox label={LABEL} />);
    expect(screen.getByRole("checkbox", { name: LABEL })).not.toBeChecked();
  });

  it("folds the add-on price into the accessible name", () => {
    render(<Checkbox label={LABEL} price={40} />);
    expect(screen.getByRole("checkbox")).toHaveAccessibleName(/Extra burnt chilli mayo\s*\+₹40/);
  });

  it("toggles on click and reports the new state", async () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox label={LABEL} onCheckedChange={handleCheckedChange} />);

    await userEvent.click(screen.getByRole("checkbox", { name: LABEL }));

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("checkbox", { name: LABEL })).toBeChecked();
  });

  it("toggles from the space bar", async () => {
    render(<Checkbox label={LABEL} />);

    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(screen.getByRole("checkbox", { name: LABEL })).toBeChecked();
  });

  it("does nothing while disabled", async () => {
    const handleCheckedChange = vi.fn();
    render(<Checkbox disabled label={LABEL} onCheckedChange={handleCheckedChange} />);

    await userEvent.click(screen.getByRole("checkbox", { name: LABEL }));

    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it("describes itself with its second line", () => {
    render(<Checkbox description="Adds fries and a kulhad chai." label="Make it a meal" />);
    expect(screen.getByRole("checkbox", { name: "Make it a meal" })).toHaveAccessibleDescription(
      "Adds fries and a kulhad chai."
    );
  });

  it("floods the box with the brand pink once checked", () => {
    render(<Checkbox checked label={LABEL} />);
    expect(screen.getByRole("checkbox")).toHaveClass("data-[state=checked]:bg-brand-primary");
  });

  it("reads as mixed when indeterminate", () => {
    render(<Checkbox checked="indeterminate" label="All add-ons" />);
    expect(screen.getByRole("checkbox", { name: "All add-ons" })).toHaveAttribute(
      "aria-checked",
      "mixed"
    );
  });

  it("marks the box invalid on error", () => {
    render(<Checkbox hasError label="I agree to the terms" />);
    const control = screen.getByRole("checkbox", { name: "I agree to the terms" });
    expect(control).toHaveClass("border-status-danger");
    expect(control).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps a real grey fill when disabled rather than fading the row out", () => {
    const { container } = render(
      <Checkbox description="Sold out today." disabled label="Truffle oil" />
    );
    expect(screen.getByRole("checkbox")).toHaveClass("bg-(--field-bg-disabled)");
    expect(container.firstElementChild?.className).not.toMatch(/opacity-/);
  });

  it("merges a caller className onto the row", () => {
    const { container } = render(<Checkbox className="gap-6" label={LABEL} />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Checkbox label={LABEL} price={40} />
        <Checkbox
          checked
          description="Adds fries and a kulhad chai."
          label="Make it a meal"
          price={120}
        />
        <Checkbox disabled label="Truffle oil" />
        <Checkbox hasError label="I agree to the terms" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
