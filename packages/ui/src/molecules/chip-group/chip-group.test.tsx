import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ChipGroup } from "./chip-group";

const MEALS = [
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "both", label: "Lunch + Dinner" },
];

const STARTERS = [
  { value: "chilli-potato", label: "Chilli Potato" },
  { value: "honey-chilli-potato", label: "Honey Chilli Potato" },
  { value: "veg-manchurian", label: "Veg Manchurian" },
];

describe("ChipGroup", () => {
  it("as a single group is a named radio group that always keeps its one choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup type="single" label="Which meals" options={MEALS} onValueChange={onValueChange} />
    );
    expect(screen.getByRole("radiogroup", { name: "Which meals" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Dinner" }));
    await user.click(screen.getByRole("radio", { name: "Dinner" }));
    expect(screen.getByRole("radio", { name: "Dinner" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("dinner");
  });

  it("as a multiple group is a toolbar of toggle buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole("toolbar", { name: "Starters" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    await user.click(screen.getByRole("button", { name: "Veg Manchurian" }));
    expect(screen.getByRole("button", { name: "Chilli Potato" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["chilli-potato", "veg-manchurian"]);
  });

  it("never lets a keyboard user pick more than maxSelected, and says why the rest are unavailable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        onValueChange={onValueChange}
      />
    );
    await user.tab();
    await user.keyboard(" ");
    await user.keyboard("{ArrowRight} ");
    await user.keyboard("{ArrowRight}");
    const blocked = screen.getByRole("button", { name: "Veg Manchurian" });
    expect(blocked).toHaveFocus();
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    // Each key is checked on its own: a Space that got through and an Enter that undid it would
    // otherwise cancel out.
    await user.keyboard(" ");
    expect(blocked).toHaveAttribute("aria-pressed", "false");
    await user.keyboard("{Enter}");
    expect(blocked).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange).toHaveBeenLastCalledWith(["chilli-potato", "honey-chilli-potato"]);
    expect(screen.getByRole("toolbar", { name: "Starters" })).toHaveAccessibleDescription(
      "2 of 2 chosen. Remove one to choose another."
    );
    expect(screen.getByText("2 of 2 chosen. Remove one to choose another.")).toHaveAttribute(
      "aria-live",
      "polite"
    );
  });

  it("frees the other chips as soon as one is removed", async () => {
    const user = userEvent.setup();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        defaultValue={["chilli-potato", "honey-chilli-potato"]}
      />
    );
    expect(screen.getByRole("button", { name: "Veg Manchurian" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    expect(screen.getByRole("button", { name: "Veg Manchurian" })).not.toHaveAttribute(
      "aria-disabled"
    );
    expect(screen.getByText("1 of 2 chosen.")).toBeInTheDocument();
  });

  it("lets a group that starts over its limit drop chips, but never add one", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={[...STARTERS, { value: "hara-bhara-kebab", label: "Hara Bhara Kebab" }]}
        maxSelected={1}
        defaultValue={["chilli-potato", "honey-chilli-potato", "veg-manchurian"]}
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    expect(screen.getByRole("button", { name: "Chilli Potato" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["honey-chilli-potato", "veg-manchurian"]);
    const blocked = screen.getByRole("button", { name: "Hara Bhara Kebab" });
    act(() => {
      blocked.focus();
    });
    await user.keyboard(" ");
    expect(blocked).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("lets the page word the limit", () => {
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={3}
        getLimitMessage={(selected, max) => `Pick ${String(max)} · ${String(selected)} picked`}
      />
    );
    expect(screen.getByText("Pick 3 · 0 picked")).toBeInTheDocument();
  });

  it("rejects a limit that could never be met", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<ChipGroup type="multiple" label="Starters" options={STARTERS} maxSelected={0} />)
    ).toThrow(RangeError);
    vi.restoreAllMocks();
  });

  it("submits its values with a form under its name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChipGroup type="multiple" label="Starters" name="starters" options={STARTERS} />
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    await user.click(screen.getByRole("button", { name: "Veg Manchurian" }));
    const values = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="starters"]'),
    ].map((input) => input.value);
    expect(values).toEqual(["chilli-potato", "veg-manchurian"]);
  });

  it("submits nothing while disabled, like a native disabled control", () => {
    const { container } = render(
      <ChipGroup
        type="multiple"
        label="Starters"
        name="starters"
        options={STARTERS}
        defaultValue={["chilli-potato"]}
        disabled
      />
    );
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });

  it("reports blur only when focus leaves the whole group", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <>
        <ChipGroup type="single" label="Which meals" options={MEALS} onBlur={onBlur} />
        <button type="button">Next step</button>
      </>
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onBlur).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next step" })).toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("draws the segmented pill track, with unchosen options unfilled", () => {
    render(
      <ChipGroup
        type="single"
        variant="segmented"
        label="Meals per day"
        defaultValue="one"
        options={[
          { value: "one", label: "Lunch or dinner" },
          { value: "both", label: "Lunch + dinner" },
        ]}
      />
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("rounded-pill");
    expect(screen.getByRole("radio", { name: "Lunch + dinner" })).toHaveClass("bg-transparent");
    expect(screen.getByRole("radio", { name: "Lunch or dinner" })).not.toHaveClass(
      "bg-transparent"
    );
  });

  it("disables one chip, or the whole group", () => {
    const { rerender } = render(
      <ChipGroup
        type="single"
        label="Which meals"
        options={MEALS.map((meal) => ({ ...meal, isDisabled: meal.value === "both" }))}
      />
    );
    expect(screen.getByRole("radio", { name: "Lunch + Dinner" })).toBeDisabled();
    rerender(<ChipGroup type="single" label="Which meals" options={MEALS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("says what is wrong in words, not only in red (R101)", () => {
    render(
      <ChipGroup
        type="single"
        label="Which meals"
        options={MEALS}
        status="error"
        message="Choose the meals you want."
      />
    );
    const group = screen.getByRole("radiogroup", { name: "Which meals" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Choose the meals you want.");
    expect(screen.getByRole("alert")).toHaveTextContent("Choose the meals you want.");
  });

  it("never marks the group invalid by colour alone — no message, no error (R101)", () => {
    render(<ChipGroup type="single" label="Which meals" options={MEALS} status="error" />);
    const group = screen.getByRole("radiogroup", { name: "Which meals" });
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).not.toHaveAttribute("aria-describedby");
  });

  it("never lets a caller's aria-invalid redden the chips without words", () => {
    // Not in the props type; the cast stands in for an untyped spread (e.g. a form library's).
    const callerInvalid = { "aria-invalid": true } as object;
    const { container } = render(
      <ChipGroup type="multiple" label="Starters" options={STARTERS} {...callerInvalid} />
    );
    expect(container.querySelector("[aria-invalid]")).toBeNull();
  });

  it("keeps its limit line alongside a message and a caller's description (R102)", () => {
    render(
      <>
        <p id="step-hint">Served with the main course.</p>
        <ChipGroup
          type="multiple"
          label="Starters"
          options={STARTERS}
          maxSelected={2}
          message="Change them any week."
          aria-describedby="step-hint"
        />
      </>
    );
    expect(screen.getByRole("toolbar", { name: "Starters" })).toHaveAccessibleDescription(
      "0 of 2 chosen. Change them any week. Served with the main course."
    );
  });

  it.each([
    [
      "single",
      <ChipGroup
        key="single"
        type="single"
        label="Which meals"
        options={MEALS}
        defaultValue="lunch"
      />,
    ],
    [
      "multiple with a limit",
      <ChipGroup
        key="multiple"
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        defaultValue={["chilli-potato", "veg-manchurian"]}
      />,
    ],
    [
      "multiple with an error",
      <ChipGroup
        key="multiple-error"
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        status="error"
        message="Pick at least one starter."
      />,
    ],
  ])("has no accessibility violations (%s)", async (_, element) => {
    const { container } = render(element);
    await expectNoA11yViolations(container);
  });
});
