import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "#vitest.setup";

import { Checkbox } from "../../atoms/checkbox/checkbox";
import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { Field, type FieldControlProps } from "./field";

const HEAT = [
  { value: "1", label: "Mild" },
  { value: "3", label: "Hot" },
];

function renderInput(control: FieldControlProps) {
  return <input {...control} />;
}

describe("Field", () => {
  it("labels the control and hands it only the keys that apply", () => {
    const children = vi.fn(renderInput);
    render(<Field label="Mobile number">{children}</Field>);
    const input = screen.getByRole("textbox", { name: "Mobile number" });
    // Keys, not values: `toHaveBeenCalledWith` would treat an `undefined` key as absent.
    expect(Object.keys(children.mock.calls[0]?.[0] ?? {})).toEqual(["id"]);
    expect(children.mock.calls[0]?.[0].id).toBe(input.id);
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toBeRequired();
  });

  it("describes the control with its hint", () => {
    render(
      <Field label="Outlet" hint="Pickup only for now.">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAccessibleDescription(
      "Pickup only for now."
    );
  });

  it("replaces the hint with the error message, marks the control invalid and shows the glyph", () => {
    const { container } = render(
      <Field
        label="How spicy?"
        hint="You can change this later."
        status="error"
        message="Pick a heat level."
      >
        {renderInput}
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "How spicy?" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Pick a heat level.");
    expect(screen.queryByText("You can change this later.")).not.toBeInTheDocument();
    expect(container.querySelector("p svg")).toBeInTheDocument();
  });

  it.each([
    ["Input", (c: FieldControlProps) => <Input {...c} status="error" />, "textbox"],
    [
      "Select",
      (c: FieldControlProps) => (
        <Select {...c} status="error" options={HEAT} placeholder="Pick one" defaultValue="" />
      ),
      "combobox",
    ],
    [
      "Checkbox",
      (c: FieldControlProps) => <Checkbox {...c} label="I agree to the terms" isInvalid />,
      "checkbox",
    ],
  ] as const)(
    "gives an invalid %s its words: marked invalid and described by the message",
    (_n, control, role) => {
      render(
        <Field label="Terms" status="error" message="Tick to continue.">
          {control}
        </Field>
      );
      const el = screen.getByRole(role);
      expect(el).toHaveAttribute("aria-invalid", "true");
      expect(el).toHaveAccessibleDescription("Tick to continue.");
      expect(screen.getByRole("alert")).toHaveTextContent("Tick to continue.");
    }
  );

  it.each(["success", "warning"] as const)(
    "shows a %s message without marking the control invalid",
    (status) => {
      render(
        <Field label="Promo code" status={status} message="PAPRIKAA50 applied.">
          {renderInput}
        </Field>
      );
      const input = screen.getByRole("textbox", { name: "Promo code" });
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(input).toHaveAccessibleDescription("PAPRIKAA50 applied.");
    }
  );

  it("keeps the hint when a status has no message — never a colour without words", () => {
    render(
      <Field label="Outlet" hint="Pickup only for now." status="error">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAccessibleDescription(
      "Pickup only for now."
    );
  });

  it("marks a required control without reading the star aloud", () => {
    render(
      <Field label="Mobile number" isRequired>
        {renderInput}
      </Field>
    );
    const control = screen.getByRole("textbox", { name: "Mobile number" });
    expect(control).toBeRequired();
    expect(control).toHaveAttribute("aria-required", "true");
    expect(control).not.toHaveAttribute("required");
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("*")).toHaveClass("text-text-brand");
  });

  it("marks an optional control in its label", () => {
    render(
      <Field label="Promo code" isOptional>
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Promo code optional" })).not.toBeRequired();
  });

  it("gives the control the id it is asked for", () => {
    render(
      <Field label="Outlet" id="outlet">
        {renderInput}
      </Field>
    );
    expect(screen.getByRole("textbox", { name: "Outlet" })).toHaveAttribute("id", "outlet");
  });

  it("puts the label in a column beside the control from 480px up when orientation is side", () => {
    const { container } = render(
      <Field label="Outlet" orientation="side">
        {renderInput}
      </Field>
    );
    // Below `sm` it stacks: a 160px label column leaves a 360px screen's control too narrow.
    expect(container.firstElementChild).toHaveClass("sm:grid-cols-field-side");
    expect(container.firstElementChild).not.toHaveClass("grid-cols-field-side");
    expect(screen.getByText("Outlet").closest("label")).toHaveClass("sm:pt-3.25");
  });

  it("mutes the label while the control it labels is disabled", () => {
    const { container } = render(
      <Field label="Pickup time">{(control) => <input {...control} disabled />}</Field>
    );
    // jsdom cannot evaluate `:has()`; the class is the contract, the story shows the effect.
    expect(container.firstElementChild).toHaveClass("group/form-field");
    expect(screen.getByText("Pickup time").closest("label")).toHaveClass(
      "group-has-[:is(input,textarea,select,button[role=combobox]):disabled]/form-field:text-text-subtle"
    );
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(
      <Field label="Outlet" className="gap-6">
        {renderInput}
      </Field>
    );
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-1.5");
  });

  it("keeps its wiring when a react-hook-form register() result is spread after it", async () => {
    const user = userEvent.setup();
    const registered = fakeRegister("phone");
    render(
      <Field label="Mobile number" status="error" message="Enter a 10-digit number." isRequired>
        {(control) => <Input {...control} {...registered} status="error" />}
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "Mobile number" });
    expect(input).toHaveAttribute("name", "phone");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a 10-digit number.");
    expect(input).toBeRequired();
    expect(registered.ref).toHaveBeenCalledWith(input);
    await user.type(input, "9");
    await user.tab();
    expect(registered.onChange).toHaveBeenCalled();
    expect(registered.onBlur).toHaveBeenCalled();
  });

  it("has no accessibility violations at rest or in error", async () => {
    const { container } = render(
      <>
        <Field label="Outlet" hint="Pickup only for now.">
          {renderInput}
        </Field>
        <Field label="How spicy?" status="error" message="Pick a heat level." isRequired>
          {renderInput}
        </Field>
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <Field label="Mobile number" sx={{ mt: 4 }} className="italic">
        {renderInput}
      </Field>
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
