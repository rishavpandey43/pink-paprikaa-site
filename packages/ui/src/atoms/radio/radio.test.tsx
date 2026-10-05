import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Radio, RadioGroup, type RadioGroupProps } from "./radio";

const ringOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

/** `Omit` over each member, so the status/message pairing survives. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** The card's "group" row as a fixture: the legend and options are fixed, the rest is the test's. */
function Portion(props: DistributiveOmit<RadioGroupProps, "legend" | "children">) {
  return (
    <RadioGroup legend="Portion" {...props}>
      <Radio name="size" value="regular" label="Regular" price={280} defaultChecked />
      <Radio name="size" value="sharing" label="Sharing" price={440} description="Feeds two." />
    </RadioGroup>
  );
}

describe("Radio", () => {
  it("is a native radio named by its label and absolute price", () => {
    render(<Radio name="size" value="regular" label="Regular" price={280} />);
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).toBeInTheDocument();
  });

  it("draws checked as a 6px pink ring, not a filled dot", () => {
    render(<Radio name="heat" value="hot" label="Hot" defaultChecked />);
    expect(ringOf(screen.getByRole("radio"))).toHaveClass(
      "group-has-checked/choice:border-6",
      "group-has-checked/choice:border-pink-500"
    );
  });

  it("describes an option with its description", () => {
    render(<Portion />);
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toHaveAccessibleDescription(
      "Feeds two."
    );
  });

  it("moves the choice with the arrow keys, as native radios do", async () => {
    const user = userEvent.setup();
    render(<Portion />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toBeChecked();
  });

  it("moves the choice on click and unchecks the last one", async () => {
    const user = userEvent.setup();
    render(<Portion />);
    await user.click(screen.getByRole("radio", { name: "Sharing ₹440" }));
    expect(screen.getByRole("radio", { name: "Sharing ₹440" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Regular ₹280" })).not.toBeChecked();
  });

  it("ignores clicks on a disabled option; the row fades at 50% opacity (IX)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Radio
        name="platter"
        value="family"
        label="Family platter"
        description="Weekends only."
        disabled
        onChange={onChange}
      />
    );
    const radio = screen.getByRole("radio", { name: "Family platter" });
    await user.click(screen.getByText("Family platter"));
    expect(radio).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(radio.closest("label")).toHaveClass("has-disabled:opacity-50");
    expect(container.innerHTML).toMatch(/has-disabled:opacity-50/);
  });

  // The class pins the wiring; the InvalidChecked story's play asserts the computed red in Chromium.
  it("marks one option invalid and rings it red", () => {
    render(<Radio name="size" value="regular" label="Regular" isInvalid />);
    const radio = screen.getByRole("radio", { name: "Regular" });
    expect(radio).toHaveAttribute("aria-invalid", "true");
    expect(ringOf(radio)).toHaveClass(
      "group-has-aria-invalid/choice:border-status-danger",
      "group-has-checked/choice:group-has-aria-invalid/choice:border-status-danger"
    );
  });

  it("puts className on the option's row, replacing a conflicting class", () => {
    render(<Radio name="heat" value="hot" label="Hot" className="gap-6" />);
    const row = screen.getByRole("radio").closest("label");
    expect(row).toHaveClass("gap-6");
    expect(row).not.toHaveClass("gap-3");
  });

  it("takes react-hook-form's register() on every option of the field", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("size");
    render(
      <RadioGroup legend="Portion">
        <Radio value="regular" label="Regular" {...field} />
        <Radio value="sharing" label="Sharing" {...field} />
      </RadioGroup>
    );
    const [regular, sharing] = screen.getAllByRole("radio");

    expect(field.ref).toHaveBeenCalledWith(regular);
    expect(field.ref).toHaveBeenCalledWith(sharing);
    expect(sharing).toHaveAttribute("name", "size");
    await user.click(screen.getByText("Sharing"));
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("RadioGroup", () => {
  it("is a radiogroup named by its legend", () => {
    render(<Portion />);
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
  });

  it("can hide the legend visually and keep the name", () => {
    render(<Portion isLegendHidden />);
    expect(screen.getByText("Portion")).toHaveClass("sr-only");
    expect(screen.getByRole("radiogroup", { name: "Portion" })).toBeInTheDocument();
  });

  it.each([
    ["vertical", "flex-col"],
    ["horizontal", "flex-row"],
  ] as const)("lays options out %s", (orientation, layout) => {
    render(<Portion orientation={orientation} />);
    expect(
      screen.getByRole("radio", { name: "Regular ₹280" }).closest("label")?.parentElement
    ).toHaveClass(layout);
  });

  it("carries an error for the whole group: aria-invalid, red rings, glyph and message", () => {
    const { container } = render(<Portion status="error" message="Pick a portion to continue." />);
    const group = screen.getByRole("radiogroup", { name: "Portion" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick a portion to continue.");
    expect(container.querySelector(".lucide-circle-alert")).toBeInTheDocument();
    // Regular is checked: its ring takes the checked-and-invalid red over the checked pink
    // (the GroupError story's play asserts the computed colour in Chromium).
    expect(ringOf(screen.getByRole("radio", { name: "Regular ₹280" }))).toHaveClass(
      "in-aria-invalid:border-status-danger",
      "in-aria-invalid:group-has-checked/choice:border-status-danger"
    );
  });

  it("will not take a status without its message, so an error is never colour alone", () => {
    render(
      // @ts-expect-error — a status needs its message (spec §5.5)
      <RadioGroup legend="Portion" status="error">
        <Radio name="size" value="regular" label="Regular" />
      </RadioGroup>
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
  });

  it.each(["", "   ", false] as const)("treats the blank message %j as none (R48)", (message) => {
    const { container } = render(<Portion message={message} />);
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-describedby");
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("will not take a boolean as a status message", () => {
    render(
      // @ts-expect-error — a status message is words or an element, never a boolean
      <Portion status="error" message={false} />
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows a message without a status as a plain hint", () => {
    const { container } = render(<Portion message="Both come with rice." />);
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Both come with rice.")).toHaveClass("text-text-subtle");
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("disables every option at once through the fieldset", () => {
    render(<Portion disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("puts className on the fieldset", () => {
    render(<Portion className="mt-6" />);
    expect(screen.getByRole("radiogroup")).toHaveClass("mt-6", "min-w-0");
  });

  it("has no accessibility violations with an error and a message, or in a row with a disabled option", async () => {
    const { container } = render(
      <>
        <Portion status="error" message="Pick a portion to continue." />
        <RadioGroup legend="Heat" orientation="horizontal">
          <Radio name="heat" value="hot" label="Hot" />
          <Radio name="heat" value="extra-hot" label="Extra Hot" />
          <Radio
            name="heat"
            value="kitchen-special"
            label="Kitchen special"
            description="Weekends only."
            disabled
          />
        </RadioGroup>
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its outermost element", () => {
    const { container } = render(<Radio label="Half portion" sx={{ mt: 4 }} />);
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("takes sx on a radio group's fieldset", () => {
    const { container } = render(
      <RadioGroup legend="Portion" sx={{ mt: 4 }}>
        <Radio label="Half" name="portion" />
      </RadioGroup>
    );
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("renders Field around itself when given an error message", () => {
    render(<Radio name="heat" value="hot" label="Hot" error="Pick a heat" />);
    expect(screen.getByRole("radio", { name: "Hot" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Pick a heat")).toBeInTheDocument();
  });
});
