import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Alert } from "./alert";

describe("Alert", () => {
  it("renders its message in a polite live region", () => {
    render(<Alert>Pickup is running 25 minutes today.</Alert>);
    expect(screen.getByRole("status")).toHaveTextContent("Pickup is running 25 minutes today.");
  });

  it("renders the title above the message", () => {
    render(<Alert title="Kitchen is busy">Pickup is running 25 minutes today.</Alert>);
    const node = screen.getByRole("status");
    expect(node).toHaveTextContent("Kitchen is busy");
    expect(node).toHaveTextContent("Pickup is running 25 minutes today.");
  });

  it.each([
    ["info", "bg-status-info-soft"],
    ["success", "bg-status-success-soft"],
    ["warning", "bg-status-warning-soft"],
    ["danger", "bg-status-danger-soft"],
    ["brand", "bg-brand-soft"],
  ] as const)("fills the %s tone with its soft ground", (tone, expected) => {
    render(<Alert tone={tone}>We now take UPI at every counter.</Alert>);
    expect(screen.getByRole("status")).toHaveClass(expected);
  });

  it("carries a full border rather than a coloured left edge", () => {
    render(<Alert tone="danger">Try another card or pay by UPI.</Alert>);
    const node = screen.getByRole("status");
    expect(node).toHaveClass("border");
    expect(node).toHaveClass("border-status-danger");
  });

  it("renders a single action under the message", () => {
    render(
      <Alert action={<button type="button">See the Menu</button>} title="New in Sector 57">
        Doors open Friday, 8am.
      </Alert>
    );
    expect(screen.getByRole("button", { name: "See the Menu" })).toBeInTheDocument();
  });

  it("shows no dismiss control without a handler", () => {
    render(<Alert>Try another card or pay by UPI.</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("calls onDismiss when the dismiss control is pressed", async () => {
    const handleDismiss = vi.fn();
    render(<Alert onDismiss={handleDismiss}>We now take UPI at every counter.</Alert>);

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it("merges a caller className", () => {
    render(<Alert className="rounded-1">We now take UPI at every counter.</Alert>);
    const node = screen.getByRole("status");
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Alert onDismiss={vi.fn()} title="Kitchen is busy" tone="warning">
        Pickup is running 25 minutes today.
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
