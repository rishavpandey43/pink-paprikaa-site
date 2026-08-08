import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Field, FieldMessage } from "./field";

describe("FieldMessage", () => {
  it("renders nothing without a sentence to show", () => {
    const { container } = render(<FieldMessage status="error" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("falls back to the neutral tone for a message on the default status", () => {
    render(<FieldMessage message="Two slots left at 7:30pm." />);
    expect(screen.getByText("Two slots left at 7:30pm.")).toHaveClass("text-text-subtle");
  });
});

describe("Field", () => {
  it("labels the control it wraps", () => {
    render(
      <Field htmlFor="mobile" label="Mobile number">
        <input id="mobile" type="tel" />
      </Field>
    );
    expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
  });

  it("renders the label as plain text when there is no control to point at", () => {
    const { container } = render(
      <Field label="How spicy?">
        <div />
      </Field>
    );
    expect(screen.getByText("How spicy?")).toBeInTheDocument();
    expect(container.querySelector("label")).toBeNull();
  });

  it("shows the hint while the status is default", () => {
    render(<Field hint="You can change this later." label="How spicy?" />);
    expect(screen.getByText("You can change this later.")).toBeInTheDocument();
  });

  it("replaces the hint with the status message", () => {
    render(
      <Field
        hint="You can change this later."
        label="How spicy?"
        message="Pick a heat level."
        status="error"
      />
    );
    expect(screen.getByText("Pick a heat level.")).toBeInTheDocument();
    expect(screen.queryByText("You can change this later.")).not.toBeInTheDocument();
  });

  it.each([
    ["error", "text-status-danger"],
    ["success", "text-status-success"],
    ["warning", "text-status-warning"],
  ] as const)("paints the %s message in its own colour and glyph", (status, expected) => {
    const { container } = render(
      <Field label="Promo code" message="PAPRIKAA50 applied." status={status} />
    );
    expect(screen.getByText("PAPRIKAA50 applied.")).toHaveClass(expected);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("announces an error message without waiting for focus", () => {
    render(<Field label="Promo code" message="That code has expired." status="error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("That code has expired.");
  });

  it("shows the pulsing diamond beside a loading message", () => {
    const { container } = render(
      <Field label="Promo code" message="Checking that code." status="loading" />
    );
    expect(container.querySelector(".animate-pp-pulse")).toBeInTheDocument();
  });

  it("mutes the label when the control is disabled", () => {
    render(<Field label="Pickup time" status="disabled" />);
    expect(screen.getByText("Pickup time")).toHaveClass("text-text-subtle");
  });

  it("marks a field required without announcing a bare asterisk", () => {
    render(<Field isRequired label="Mobile number" />);
    const marker = screen.getByText("*");
    expect(marker).toHaveAttribute("aria-hidden", "true");
    expect(marker).toHaveClass("text-text-brand");
  });

  it("marks a field optional instead", () => {
    render(<Field isOptional label="Delivery notes" />);
    expect(screen.getByText("optional")).toBeInTheDocument();
  });

  it("splits into a label column only when there is a label to put in it", () => {
    const { container, rerender } = render(<Field label="Outlet" layout="side" />);
    expect(container.firstElementChild).toHaveClass("sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]");

    rerender(<Field layout="side" />);
    expect(container.firstElementChild).not.toHaveClass(
      "sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]"
    );
  });

  it("points the message at an id the control can describe itself with", () => {
    render(
      <Field hint="We text the order code here." htmlFor="mobile" label="Mobile number">
        <input aria-describedby="mobile-description" id="mobile" type="tel" />
      </Field>
    );
    expect(screen.getByText("We text the order code here.")).toHaveAttribute(
      "id",
      "mobile-description"
    );
  });

  it("merges a caller className", () => {
    const { container } = render(<Field className="gap-6" label="Outlet" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-1-5");
  });

  it("renders nothing under the control when there is neither hint nor message", () => {
    const { container } = render(<Field label="Outlet" status="warning" />);
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Field
          hint="We text the order code here."
          htmlFor="mobile"
          isRequired
          label="Mobile number"
        >
          <input aria-describedby="mobile-description" id="mobile" type="tel" />
        </Field>
        <Field htmlFor="promo" label="Promo code" message="That code has expired." status="error">
          <input aria-describedby="promo-description" aria-invalid id="promo" type="text" />
        </Field>
        <Field htmlFor="outlet" isOptional label="Outlet" layout="side">
          <input id="outlet" type="text" />
        </Field>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
