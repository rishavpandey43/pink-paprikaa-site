import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Field } from "../field/field";
import { CheckCard } from "./check-card";

const UPFRONT = {
  title: "Pay 3 months upfront",
  description: "Classic at ₹125 a meal, locked for 3 cycles",
} as const;

describe("CheckCard", () => {
  it("is a checkbox named by its title and described by its detail", () => {
    render(<CheckCard {...UPFRONT} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    expect(checkbox).toHaveAccessibleDescription(UPFRONT.description);
  });

  it("toggles by click and by Space, with the native change event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckCard {...UPFRONT} onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("toggles when the card's words are clicked, not just the box", async () => {
    const user = userEvent.setup();
    render(<CheckCard {...UPFRONT} />);
    await user.click(screen.getByText(UPFRONT.description));
    expect(screen.getByRole("checkbox", { name: UPFRONT.title })).toBeChecked();
  });

  it("submits with its form under its name", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Plan">
        <CheckCard {...UPFRONT} name="upfront" />
      </form>
    );
    await user.click(screen.getByRole("checkbox"));
    const form = screen.getByRole("form", { name: "Plan" });
    expect(form instanceof HTMLFormElement && new FormData(form).get("upfront")).toBe("on");
  });

  it("takes react-hook-form's register() unmodified", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("upfront");
    render(<CheckCard {...UPFRONT} {...field} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    expect(field.ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute("name", "upfront");
    await user.click(checkbox);
    expect(field.onChange).toHaveBeenCalledOnce();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledOnce();
  });

  it("stays a light island on dark fields and can be disabled", () => {
    const { container } = render(<CheckCard {...UPFRONT} disabled />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  // The class pins the wiring; the DisabledChecked story's play asserts the computed fill in Chromium.
  it("greys a disabled box like Checkbox: an ink-200 fill and an ink-400 tick, never brand pink", () => {
    render(<CheckCard {...UPFRONT} disabled defaultChecked />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("disabled:border-ink-200", "disabled:bg-ink-200");
    expect(checkbox.nextElementSibling).toHaveClass("peer-disabled:text-ink-400");
    expect(checkbox.closest("label")).toHaveClass("has-disabled:shadow-none");
  });

  it("keeps a caller's description alongside its own", () => {
    render(
      <>
        <CheckCard {...UPFRONT} aria-describedby="upfront-note" />
        <p id="upfront-note">Billed today.</p>
      </>
    );
    expect(screen.getByRole("checkbox", { name: UPFRONT.title })).toHaveAccessibleDescription(
      `${UPFRONT.description} Billed today.`
    );
  });

  it("takes Field's error: invalid, and described by the words that say why", () => {
    render(
      <Field label="Terms" status="error" message="Tick this to place the order.">
        {(control) => (
          <CheckCard
            {...UPFRONT}
            aria-describedby={control["aria-describedby"]}
            aria-invalid={control["aria-invalid"]}
          />
        )}
      </Field>
    );
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    // The card's own label only: Field's `<label htmlFor>` would be a second one (axe
    // form-field-multiple-labels).
    expect((checkbox as HTMLInputElement).labels).toHaveLength(1);
    expect(checkbox).toBeInvalid();
    expect(checkbox).toHaveAccessibleDescription(
      `${UPFRONT.description} Tick this to place the order.`
    );
  });

  it("marks itself invalid with isInvalid, like Checkbox", () => {
    render(<CheckCard {...UPFRONT} isInvalid />);
    expect(screen.getByRole("checkbox", { name: UPFRONT.title })).toBeInvalid();
  });

  it("drops the pink selected inset when checked and invalid, so the red is not lined with pink", () => {
    render(<CheckCard {...UPFRONT} isInvalid defaultChecked />);
    expect(screen.getByRole("checkbox").closest("label")).toHaveClass(
      "has-checked:shadow-selected",
      "has-aria-invalid:has-checked:shadow-none"
    );
  });

  it("has no accessibility violations when checked", async () => {
    const { container } = render(<CheckCard {...UPFRONT} defaultChecked />);
    await expectNoA11yViolations(container);
  });
});
