import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Radio, RadioGroup } from "./radio";

function Portions({
  onValueChange = () => undefined,
}: {
  onValueChange?: (value: string) => void;
}) {
  return (
    <RadioGroup aria-label="Portion" defaultValue="regular" onValueChange={onValueChange}>
      <Radio label="Regular" price={280} value="regular" />
      <Radio description="Feeds two." label="Sharing" price={440} value="sharing" />
    </RadioGroup>
  );
}

describe("Radio", () => {
  it("renders a group whose chosen option is the one selected", () => {
    render(<Portions />);
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Regular/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Sharing/ })).not.toBeChecked();
  });

  it("folds the price into the accessible name", () => {
    render(<Portions />);
    expect(screen.getByRole("radio", { name: /Regular/ })).toHaveAccessibleName(/Regular\s*₹280/);
  });

  it("moves the choice on click and reports the new value", async () => {
    const handleValueChange = vi.fn();
    render(<Portions onValueChange={handleValueChange} />);

    await userEvent.click(screen.getByRole("radio", { name: /Sharing/ }));

    expect(handleValueChange).toHaveBeenCalledWith("sharing");
    expect(screen.getByRole("radio", { name: /Sharing/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Regular/ })).not.toBeChecked();
  });

  it("moves the choice with the arrow keys", async () => {
    render(<Portions />);

    await userEvent.tab();
    // Held, not tapped: Radix moves roving focus on a macrotask, and a key-up before that lands
    // clears the "an arrow moved me here" flag that turns the focus into a selection.
    await userEvent.keyboard("{ArrowDown>}");

    expect(screen.getByRole("radio", { name: /Sharing/ })).toHaveFocus();
    expect(screen.getByRole("radio", { name: /Sharing/ })).toBeChecked();
  });

  it("describes an option with its second line", () => {
    render(<Portions />);
    expect(screen.getByRole("radio", { name: /Sharing/ })).toHaveAccessibleDescription(
      "Feeds two."
    );
  });

  it("does nothing while an option is disabled", async () => {
    const handleValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Portion" onValueChange={handleValueChange}>
        <Radio disabled label="Family platter" value="family" />
      </RadioGroup>
    );

    await userEvent.click(screen.getByRole("radio", { name: "Family platter" }));

    expect(handleValueChange).not.toHaveBeenCalled();
  });

  it("floods the ring with the brand pink once chosen", () => {
    render(<Portions />);
    expect(screen.getByRole("radio", { name: /Regular/ })).toHaveClass(
      "data-[state=checked]:bg-brand-primary"
    );
  });

  it("marks an option invalid when the group is unanswered", () => {
    render(
      <RadioGroup aria-label="Portion">
        <Radio hasError label="Regular" value="regular" />
      </RadioGroup>
    );
    expect(screen.getByRole("radio", { name: "Regular" })).toHaveClass("border-status-danger");
  });

  it("keeps a real grey fill when disabled rather than fading the row out", () => {
    const { container } = render(
      <RadioGroup aria-label="Portion">
        <Radio description="Weekends only." disabled label="Family platter" value="family" />
      </RadioGroup>
    );
    expect(screen.getByRole("radio")).toHaveClass("bg-(--field-bg-disabled)");
    expect(container.innerHTML).not.toMatch(/opacity-/);
  });

  it("lays the group out in a row when asked", () => {
    render(
      <RadioGroup aria-label="Heat" orientation="horizontal">
        <Radio label="Hot" value="hot" />
      </RadioGroup>
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("flex-row");
  });

  it("merges a caller className on both the group and an option", () => {
    render(
      <RadioGroup aria-label="Heat" className="gap-6">
        <Radio className="gap-6" label="Hot" value="hot" />
      </RadioGroup>
    );
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveClass("gap-6");
    expect(group).not.toHaveClass("gap-3");
    expect(screen.getByRole("radio").parentElement).toHaveClass("gap-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Portions />
        <RadioGroup aria-label="Heat" orientation="horizontal">
          <Radio label="Hot" value="hot" />
          <Radio label="Extra hot" value="extra-hot" />
          <Radio description="Weekends only." disabled label="Family platter" value="family" />
        </RadioGroup>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
