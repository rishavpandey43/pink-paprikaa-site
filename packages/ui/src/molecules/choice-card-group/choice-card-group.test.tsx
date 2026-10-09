import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEvent } from "react";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { ChoiceCardGroup, type ChoiceOption } from "./choice-card-group";

const PLATES: ChoiceOption[] = [
  {
    value: "everyday",
    title: "Everyday",
    price: formatRupees(120),
    description: "Home-style basics, kept simple.",
  },
  {
    value: "classic",
    title: "Classic",
    price: formatRupees(130),
    was: formatRupees(140),
    badge: <span>Pick</span>,
    description: "The full Pink Paprikaa menu. Our recommendation.",
  },
  {
    value: "signature",
    title: "Signature",
    price: formatRupees(200),
    description: "A different plate, every single day.",
  },
];

describe("ChoiceCardGroup", () => {
  it("is a fieldset named by its legend, with one radio per option", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />);
    expect(screen.getByRole("group", { name: "Your plate" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("names each radio by its title and price, and describes it with its blurb and badge", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />);
    const classic = screen.getByRole("radio", { name: "Classic ₹130 was ₹140" });
    expect(classic).toHaveAccessibleDescription(
      "The full Pink Paprikaa menu. Our recommendation. Pick"
    );
    expect(screen.getByRole("radio", { name: /Everyday/ })).toHaveAccessibleDescription(
      "Home-style basics, kept simple."
    );
  });

  it("draws the struck price with the shared StruckPrice, in text-subtle like PriceTag", () => {
    const { container } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    expect(container.querySelector("s")).toHaveClass("text-text-subtle");
  });

  it("greys a disabled card's struck price with the rest of the card", () => {
    const { container } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES.map((option) => ({ ...option, isDisabled: true }))}
      />
    );
    expect(container.querySelector("s")).toHaveClass("group-has-disabled/card:text-ink-400");
  });

  it("reads an option's meta line in its description, so an offer is never silent", () => {
    render(
      <ChoiceCardGroup
        name="length"
        legend="How many meals"
        options={[
          {
            value: "weekday",
            title: "Weekday plan",
            description: "24 meals · Mon–Sat",
            meta: <span>Offer: +1 free / month</span>,
          },
          { value: "offer-only", title: "Trial", meta: "Offer: first week free" },
        ]}
      />
    );
    expect(screen.getByRole("radio", { name: "Weekday plan" })).toHaveAccessibleDescription(
      "24 meals · Mon–Sat Offer: +1 free / month"
    );
    expect(screen.getByRole("radio", { name: "Trial" })).toHaveAccessibleDescription(
      "Offer: first week free"
    );
  });

  it("starts on the default choice and reports a new one as a value and a native event", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();
    render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        defaultValue="classic"
        onValueChange={onValueChange}
        onChange={onChange}
      />
    );
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("signature");
    const [event] = onChange.mock.lastCall ?? [];
    expect(event?.target.name).toBe("plate");
    expect(event?.target.value).toBe("signature");
  });

  it("moves the choice with the arrow keys, like any radio group", async () => {
    const user = userEvent.setup();
    render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} defaultValue="everyday" />
    );
    await user.click(screen.getByRole("radio", { name: /Everyday/ }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveFocus();
  });

  it("submits the chosen value with its form, under its name", async () => {
    const user = userEvent.setup();
    render(
      <form noValidate aria-label="Plan">
        <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
      </form>
    );
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    const form = screen.getByRole("form", { name: "Plan" });
    expect(form instanceof HTMLFormElement && new FormData(form).get("plate")).toBe("signature");
  });

  it("takes react-hook-form's register() unmodified — every radio gets the ref and the events", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("plate");
    render(<ChoiceCardGroup legend="Your plate" options={PLATES} {...field} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(field.ref).toHaveBeenCalledWith(radio);
      expect(radio).toHaveAttribute("name", "plate");
    }
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    expect(field.onChange).toHaveBeenCalledOnce();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalled();
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        value="everyday"
        onValueChange={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: /Everyday/ })).toBeChecked();
    rerender(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        value="signature"
        onValueChange={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: /Signature/ })).toBeChecked();
  });

  it("disables one option, or the whole group through the fieldset", () => {
    const { rerender } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES.map((option) => ({ ...option, isDisabled: option.value === "signature" }))}
      />
    );
    expect(screen.getByRole("radio", { name: /Signature/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeEnabled();
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("hides the native radio on light cards and draws a real one on the brand surface", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveClass("sr-only");
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} surface="brand" />);
    expect(screen.getByRole("radio", { name: /Classic/ })).not.toHaveClass("sr-only");
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveClass("appearance-none");
  });

  it("skips a slot React would not render — no empty span, nothing to describe or name it by", () => {
    const { container } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={[
          {
            value: "everyday",
            title: "Everyday",
            price: null,
            description: false,
            meta: "",
            badge: false,
          },
        ]}
      />
    );
    const radio = screen.getByRole("radio", { name: "Everyday" });
    expect(radio).not.toHaveAttribute("aria-describedby");
    expect(radio).toHaveAttribute("aria-labelledby", expect.stringMatching(/-title$/));
    expect(container.querySelectorAll("label span:empty")).toHaveLength(0);
  });

  it("shows a 0 price, as React renders it", () => {
    render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={[{ value: "free", title: "Taster", price: 0 }]}
      />
    );
    expect(screen.getByRole("radio", { name: "Taster 0" })).toBeInTheDocument();
  });

  it("puts the price under the title on tiles and at the end of rows", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    const card = () => screen.getByRole("radio", { name: /Classic/ }).closest("label");
    const price = () => card()?.querySelector('[id$="-price"]');
    // Tile: the price sits in the body, under the title.
    expect(price()).toHaveTextContent("₹130");
    expect(card()?.lastElementChild).not.toBe(price());
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} layout="row" />);
    expect(card()?.lastElementChild).toBe(price());
  });

  it("keeps the group named when the legend is hidden visually", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} isLegendHidden />);
    expect(screen.getByRole("group", { name: "Your plate" })).toBeInTheDocument();
    expect(screen.getByText("Your plate")).toHaveClass("sr-only");
  });

  it("says what is wrong in words, not only in red", () => {
    render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        status="error"
        message="Choose a plate to see your total."
      />
    );
    const group = screen.getByRole("group", { name: "Your plate" });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Choose a plate to see your total.");
    expect(screen.getByRole("alert")).toHaveTextContent("Choose a plate to see your total.");
  });

  it("never marks the group invalid by colour alone — no message, no error", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} status="error" />);
    const group = screen.getByRole("group", { name: "Your plate" });
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).not.toHaveAttribute("aria-describedby");
  });

  it.each(["page", "brand"] as const)(
    "reddens the checked card's border too when the group is in error (%s)",
    (surface) => {
      render(
        <ChoiceCardGroup
          name="plate"
          legend="Your plate"
          options={PLATES}
          defaultValue="classic"
          surface={surface}
          status="error"
          message="Choose a plate to see your total."
        />
      );
      // The checked brand/ink border would otherwise out-rank the error red (Radio precedent).
      const checked = screen.getByRole("radio", { name: /Classic/ }).closest("label");
      expect(checked).toHaveClass(
        "in-aria-invalid:border-status-danger",
        "in-aria-invalid:has-checked:border-status-danger"
      );
    }
  );

  it("keeps its own invalid state over a caller's aria-invalid", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} aria-invalid />
    );
    const group = screen.getByRole("group", { name: "Your plate" });
    // No words, no red: a bare aria-invalid cannot mark the group by colour alone.
    expect(group).not.toHaveAttribute("aria-invalid");
    rerender(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        aria-invalid={false}
        status="error"
        message="Choose a plate to see your total."
      />
    );
    expect(group).toHaveAttribute("aria-invalid", "true");
  });

  it("reads a plain message as the group's hint", () => {
    render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        message="Change it any week."
      />
    );
    const group = screen.getByRole("group", { name: "Your plate" });
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).toHaveAccessibleDescription("Change it any week.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each(["page", "brand"] as const)("has no accessibility violations (%s)", async (surface) => {
    const { container } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        surface={surface}
        defaultValue="classic"
        status="error"
        message="Choose a plate to see your total."
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, beating a default class and keeping className", () => {
    const { container } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        sx={{ minW: "full", mt: 4 }}
        className="italic"
      />
    );
    expect(container.firstElementChild).toHaveClass("min-w-full", "mt-4", "italic");
    expect(container.firstElementChild).not.toHaveClass("min-w-0");
  });
});
