import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Building2 } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Alert } from "./alert";

describe("Alert", () => {
  it("is a polite status message with its title and body", () => {
    render(<Alert title="Kitchen is busy">Pickup is running 25 minutes today.</Alert>);
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent("Kitchen is busy");
    expect(alert).toHaveTextContent("Pickup is running 25 minutes today.");
  });

  it("interrupts for danger", () => {
    render(
      <Alert tone="danger" title="That card didn't go through">
        Try another card or pay by UPI.
      </Alert>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That card didn't go through");
  });

  it.each([
    ["info", "lucide-info", "text-text-info", "bg-status-info-soft"],
    ["success", "lucide-check", "text-text-success", "bg-status-success-soft"],
    ["warning", "lucide-triangle-alert", "text-text-warning", "bg-status-warning-soft"],
    ["danger", "lucide-circle-alert", "text-text-danger", "bg-status-danger-soft"],
    ["brand", "lucide-megaphone", "text-pink-800", "bg-surface-brand-soft"],
    ["neutral", "lucide-info", "text-text-heading", "bg-surface-sunken"],
  ] as const)("paints the %s tone with its glyph and soft ground", (tone, glyph, colour, fill) => {
    const { container } = render(<Alert tone={tone}>Message.</Alert>);
    expect(container.firstElementChild).toHaveClass(colour, fill);
    expect(container.querySelector(`svg.${glyph}`)).toBeInTheDocument();
  });

  it("carries a full border rather than a coloured left edge", () => {
    const { container } = render(<Alert tone="danger">Try another card or pay by UPI.</Alert>);
    expect(container.firstElementChild).toHaveClass("border", "border-status-danger");
    expect(container.firstElementChild).not.toHaveClass("border-l-4");
  });

  it("merges a caller className over its own radius", () => {
    const { container } = render(<Alert className="rounded-lg">We now take UPI.</Alert>);
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-md");
  });

  it("takes a glyph of its own", () => {
    const { container } = render(
      <Alert tone="neutral" icon={Building2}>
        Ordering for a PG, hostel or office of 20+? Talk to us about group pricing.
      </Alert>
    );
    expect(container.querySelector("svg.lucide-building-2")).toBeInTheDocument();
  });

  it("renders its action slot under the message", () => {
    render(
      <Alert
        tone="brand"
        title="New in Sector 57"
        action={<button type="button">See the Menu</button>}
      >
        Doors open Friday, 8am.
      </Alert>
    );
    expect(screen.getByRole("button", { name: "See the Menu" })).toBeInTheDocument();
  });

  it("offers a dismiss button only when onDismiss is given", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { rerender } = render(<Alert>We now take UPI at every counter.</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    rerender(<Alert onDismiss={onDismiss}>We now take UPI at every counter.</Alert>);
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    // A 24px glyph button with a 40px hit area (dev parity; spec §5.5 floor is 24px).
    expect(dismiss).toHaveClass("size-6", "before:-inset-2");
    await user.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("is a light island, so its action and links keep light skins on a dark field", () => {
    const { container } = render(
      <Alert tone="warning">Full setup and service starts at 50 guests.</Alert>
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
  });

  it("has no accessibility violations with a title, an action and a dismiss", async () => {
    const { container } = render(
      <Alert
        tone="brand"
        title="New in Sector 57"
        action={<button type="button">See the Menu</button>}
        onDismiss={vi.fn()}
      >
        Doors open Friday, 8am.
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
