import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Switch } from "./switch";

const trackOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

describe("Switch", () => {
  it("is a native checkbox with role switch, named by its label", () => {
    render(<Switch label="Order updates" />);
    const toggle = screen.getByRole("switch", { name: "Order updates" });
    expect(toggle).toHaveAttribute("type", "checkbox");
    expect(toggle).not.toBeChecked();
  });

  it("sets the label first and the track last, so a column of switches aligns", () => {
    render(<Switch label="Order updates" />);
    const toggle = screen.getByRole("switch");
    expect(toggle.closest("label")).toHaveClass("items-center", "gap-3.5");
    expect(toggle.nextElementSibling).toHaveClass("order-last");
  });

  it("toggles on click and on the space bar", async () => {
    const user = userEvent.setup();
    render(<Switch label="Marketing texts" />);
    const toggle = screen.getByRole("switch");
    await user.click(screen.getByText("Marketing texts"));
    expect(toggle).toBeChecked();
    await user.keyboard(" ");
    expect(toggle).not.toBeChecked();
  });

  it("toggles from the space bar after Tab, ringing its track", async () => {
    const user = userEvent.setup();
    render(<Switch label="Jain preferences" />);
    await user.tab();
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(toggle).toBeChecked();
    expect(trackOf(toggle)).toHaveClass("group-has-focus-visible/choice:outline-2");
  });

  it("puts className on the row, replacing a conflicting class", () => {
    render(<Switch label="Order updates" className="gap-8" />);
    const row = screen.getByRole("switch").closest("label");
    expect(row).toHaveClass("gap-8");
    expect(row).not.toHaveClass("gap-3.5");
  });

  it("fills the track and slides the knob when on — CSS off the native state", () => {
    render(<Switch label="Order updates" defaultChecked />);
    const track = trackOf(screen.getByRole("switch"));
    expect(track).toHaveClass("group-has-checked/choice:bg-pink-500", "w-switch-width");
    expect(track?.firstElementChild).toHaveClass("group-has-checked/choice:translate-x-4.5");
  });

  it("announces its description", () => {
    render(<Switch label="Jain preferences" description="Hides onion and garlic." />);
    expect(screen.getByRole("switch", { name: "Jain preferences" })).toHaveAccessibleDescription(
      "Hides onion and garlic."
    );
  });

  it("can hide its label visually and keep it as the name", () => {
    render(<Switch label="Order updates" isLabelHidden />);
    expect(screen.getByRole("switch", { name: "Order updates" })).toBeInTheDocument();
    expect(screen.getByText("Order updates")).toHaveClass("sr-only");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("alerts");
    render(<Switch label="Order updates" {...field} />);
    const toggle = screen.getByRole("switch");

    expect(field.ref).toHaveBeenCalledWith(toggle);
    expect(toggle).toHaveAttribute("name", "alerts");
    await user.click(toggle);
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables with a real fill (never opacity) and ignores clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Switch
        label="Delivery updates"
        description="Delivery starts in 2027."
        disabled
        onChange={onChange}
      />
    );
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    expect(trackOf(toggle)).toHaveClass("group-has-disabled/choice:bg-ink-200");
    expect(container.innerHTML).not.toMatch(/opacity-/);
    await user.click(screen.getByText("Delivery updates"));
    expect(toggle).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no accessibility violations off, on and described, or disabled", async () => {
    const { container } = render(
      <>
        <Switch label="Order updates" />
        <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
        <Switch label="Delivery updates" description="Delivery starts in 2027." disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
