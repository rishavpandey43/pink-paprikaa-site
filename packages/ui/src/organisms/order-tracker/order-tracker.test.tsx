import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OrderTracker } from "./order-tracker";

describe("OrderTracker", () => {
  it("leads with the moment the order is in", () => {
    render(<OrderTracker current={0} total={1239} />);
    expect(screen.getByRole("heading", { name: "Order in" })).toBeInTheDocument();
    // Twice over: once in the pink header, once as the step's own note in the tracker.
    expect(screen.getAllByText("Kitchen's on it.")).toHaveLength(2);
  });

  it("moves the heading and the note as the kitchen works", () => {
    render(<OrderTracker current={1} total={1239} />);
    expect(screen.getByRole("heading", { name: "On the tandoor" })).toBeInTheDocument();
    expect(screen.getAllByText("The paneer is charring.")).toHaveLength(2);
  });

  it("reads Preparing until the last step, then Ready", () => {
    const { unmount } = render(<OrderTracker current={0} />);
    expect(screen.getByText("Preparing")).toBeInTheDocument();
    unmount();

    render(<OrderTracker current={2} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("clamps a step index past the end of the list", () => {
    render(<OrderTracker current={9} />);
    expect(screen.getByRole("heading", { name: "Ready for pickup" })).toBeInTheDocument();
  });

  it("prints the order code and the outlet on one line", () => {
    render(<OrderTracker code="PPK-9310" outlet="MKM MARKET" />);
    expect(screen.getByText("ORDER #PPK-9310 · MKM MARKET")).toBeInTheDocument();
  });

  it("composes the step tracker, with the current step marked", () => {
    render(<OrderTracker current={1} />);

    const tracker = screen.getByRole("list", { name: "Order progress" });
    expect(tracker).toBeInTheDocument();

    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[1]).toHaveAttribute("aria-current", "step");
  });

  it("takes its own steps, including bare strings", () => {
    render(<OrderTracker current={0} steps={["Order in", "Out for delivery"]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Order in" })).toBeInTheDocument();
  });

  it("says what was paid and how", () => {
    render(<OrderTracker payment="Card" total={1239} />);

    expect(screen.getByText("Paid · Card")).toBeInTheDocument();
    expect(screen.getByText("₹1,239")).toBeInTheDocument();
  });

  it("renders no action at all when there is nowhere to go", () => {
    render(<OrderTracker />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onDone from its one action", async () => {
    const handleDone = vi.fn();
    render(<OrderTracker onDone={handleDone} />);

    await userEvent.click(screen.getByRole("button", { name: "Back to Home" }));

    expect(handleDone).toHaveBeenCalledOnce();
  });

  it("takes a different label for that action", () => {
    render(<OrderTracker doneLabel="See My Orders" onDone={vi.fn()} />);
    expect(screen.getByRole("button", { name: "See My Orders" })).toBeInTheDocument();
  });

  it("rounds and clips itself in the card frame", () => {
    const { container } = render(<OrderTracker variant="card" />);
    expect(container.firstElementChild).toHaveClass("rounded-4");
  });

  it("merges a caller className", () => {
    const { container } = render(<OrderTracker className="bg-surface-sunken" />);

    expect(container.firstElementChild).toHaveClass("bg-surface-sunken");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OrderTracker current={1} onDone={vi.fn()} payment="UPI" total={1239} />
    );
    await expectNoA11yViolations(container);
  });
});
