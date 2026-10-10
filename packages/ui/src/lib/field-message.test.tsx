import { render, screen } from "@testing-library/react";

import { FieldMessage, hasFieldMessage } from "./field-message";

describe("FieldMessage", () => {
  it("renders nothing without a hint or a status message", () => {
    const { container } = render(<FieldMessage id="m" />);
    expect(container).toBeEmptyDOMElement();
    expect(hasFieldMessage({})).toBe(false);
  });

  it("renders the hint, muted, under the id a control references", () => {
    render(<FieldMessage id="m" hint="You can change this later." />);
    const hint = screen.getByText("You can change this later.");
    expect(hint).toHaveAttribute("id", "m");
    expect(hint).toHaveClass("text-text-subtle");
    expect(hasFieldMessage({ hint: "You can change this later." })).toBe(true);
  });

  it.each([
    ["error", "text-text-danger"],
    ["success", "text-text-success"],
    ["warning", "text-text-warning"],
  ] as const)("replaces the hint with the %s message and its glyph", (status, colour) => {
    const { container } = render(
      <FieldMessage id="m" status={status} message="Pick a heat level." hint="Hint." />
    );
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(colour);
    expect(container.firstElementChild).toHaveAttribute("id", "m");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("announces an error message without waiting for focus; success and warning stay polite", () => {
    const { rerender } = render(
      <FieldMessage id="m" status="error" message="That code has expired." />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That code has expired.");
    rerender(<FieldMessage id="m" status="success" message="PAPRIKAA50 applied." />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mounts a fresh alert when a hint turns into an error, so the role is announced", () => {
    const { rerender } = render(<FieldMessage id="m" hint="We text the code here." />);
    const hint = screen.getByText("We text the code here.");
    rerender(<FieldMessage id="m" status="error" message="Enter a 10-digit number." hint="x" />);
    const alert = screen.getByRole("alert");
    expect(alert).not.toBe(hint);
    rerender(<FieldMessage id="m" status="warning" message="Enter a 10-digit number." />);
    expect(screen.getByText("Enter a 10-digit number.").closest("p")).not.toBe(alert);
  });

  it("shows a message on the default status in the neutral tone, without a glyph, over the hint", () => {
    const { container } = render(
      <FieldMessage id="m" message="Two slots left at 7:30pm." hint="Hint." />
    );
    expect(screen.getByText("Two slots left at 7:30pm.")).toHaveClass("text-text-subtle");
    expect(screen.queryByText("Hint.")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(hasFieldMessage({ message: "Two slots left at 7:30pm." })).toBe(true);
  });

  it("falls back to the hint when a status has no message — never a colour without words", () => {
    render(<FieldMessage id="m" status="error" hint="You can change this later." />);
    expect(screen.getByText("You can change this later.")).toHaveClass("text-text-subtle");
    expect(hasFieldMessage({ status: "error" })).toBe(false);
  });
});
