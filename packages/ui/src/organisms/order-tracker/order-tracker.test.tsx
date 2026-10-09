import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import type { TrackerStep } from "../../molecules/step-tracker/step-tracker";
import { OrderTracker } from "./order-tracker";

const STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

describe("OrderTracker", () => {
  it("heads the screen with the current step and its note, in a live status region", () => {
    render(<OrderTracker steps={STEPS} current={1} code="PPK-4821" />);
    const status = screen.getByRole("status");
    expect(
      within(status).getByRole("heading", { level: 2, name: "On the tandoor" })
    ).toBeInTheDocument();
    expect(status).toHaveTextContent("Chilli paneer is charring.");
  });

  it("clamps a current index past the end to the last step", () => {
    render(<OrderTracker steps={STEPS} current={7} code="PPK-4821" />);
    expect(screen.getByRole("heading", { level: 2, name: "Ready for pickup" })).toBeInTheDocument();
  });

  it("clamps a negative current index to the first step", () => {
    render(<OrderTracker steps={STEPS} current={-1} code="PPK-4821" />);
    expect(screen.getByRole("heading", { level: 2, name: "Order in" })).toBeInTheDocument();
  });

  it("renders no empty heading and no empty step list when there are no steps", async () => {
    const { container } = render(
      <OrderTracker steps={[]} current={0} code="PPK-4821" badge={<span>Preparing</span>} />
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(within(screen.getByRole("status")).getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByText("Order #PPK-4821")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it("marks the current step in the tracker, named Order progress", () => {
    render(<OrderTracker steps={STEPS} current={1} code="PPK-4821" />);
    const tracker = screen.getByRole("list", { name: "Order progress" });
    expect(
      within(tracker).getByText("On the tandoor").closest('[aria-current="step"]')
    ).not.toBeNull();
  });

  it("takes the tracker's name from progressLabel", () => {
    render(
      <OrderTracker steps={STEPS} current={1} code="PPK-4821" progressLabel="Delivery progress" />
    );
    expect(screen.getByRole("list", { name: "Delivery progress" })).toBeInTheDocument();
  });

  it("prints the order code with its label and the outlet", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" outlet="Sector 57, Gurgaon" />);
    expect(screen.getByText("Order #PPK-4821 · Sector 57, Gurgaon")).toBeInTheDocument();
  });

  it("formats the total beside the payment line", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" total={1239} payment="UPI" />);
    expect(screen.getByText("Paid · UPI")).toBeInTheDocument();
    expect(screen.getByText("₹1,239")).toBeInTheDocument();
  });

  it("renders the badge and action slots", () => {
    render(
      <OrderTracker
        steps={STEPS}
        current={0}
        code="PPK-4821"
        badge={<span>Preparing</span>}
        action={<a href="#home">Back to Home</a>}
      />
    );
    expect(within(screen.getByRole("status")).getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument();
  });

  it("derives Preparing/Ready badges from the step when badge is omitted", () => {
    const { rerender } = render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" />);
    expect(within(screen.getByRole("status")).getByText("Preparing")).toBeInTheDocument();
    rerender(<OrderTracker steps={STEPS} current={STEPS.length - 1} code="PPK-4821" />);
    expect(within(screen.getByRole("status")).getByText("Ready")).toBeInTheDocument();
  });

  it("renders no action when none is given", () => {
    render(<OrderTracker steps={STEPS} current={0} code="PPK-4821" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("merges a caller className", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={0} code="PPK-4821" className="bg-surface-page" />
    );
    expect(container.firstElementChild).toHaveClass("flex", "bg-surface-page");
  });

  it("frames itself as a light card with variant=card", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={0} code="PPK-4821" variant="card" />
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
    expect(container.firstElementChild).toHaveClass("rounded-xl");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OrderTracker
        steps={STEPS}
        current={1}
        code="PPK-4821"
        outlet="Sector 57, Gurgaon"
        total={1239}
        payment="UPI"
        badge={<span>Preparing</span>}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <OrderTracker steps={STEPS} current={1} code="PPK-4821" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
