import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StepTracker, type TrackerStep } from "./step-tracker";

const STEPS: TrackerStep[] = [
  { label: "Order in", note: "The kitchen is on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2." },
];

describe("StepTracker", () => {
  it("renders a named list with one entry per step", () => {
    render(<StepTracker current={1} label="Order progress" steps={STEPS} />);

    const list = screen.getByRole("list", { name: "Order progress" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("names the step in progress for assistive tech", () => {
    render(<StepTracker current={1} label="Order progress" steps={STEPS} />);

    const [first, second, third] = screen.getAllByRole("listitem");
    expect(first).not.toHaveAttribute("aria-current");
    expect(second).toHaveAttribute("aria-current", "step");
    expect(third).not.toHaveAttribute("aria-current");
  });

  it("spells each step's state out in text", () => {
    render(<StepTracker current={1} steps={STEPS} />);

    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Not started yet")).toBeInTheDocument();
  });

  it("shows the step notes when vertical", () => {
    render(<StepTracker current={1} steps={STEPS} />);

    expect(screen.getByText("Chilli paneer is charring.")).toBeInTheDocument();
  });

  it("marks a completed step with a check inside the brand diamond", () => {
    const { container } = render(<StepTracker current={2} steps={STEPS} />);

    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(container.querySelectorAll(".rotate-45")).toHaveLength(3);
  });

  it("floods the diamond only up to the current step", () => {
    const { container } = render(<StepTracker current={1} steps={STEPS} />);

    const diamonds = [...container.querySelectorAll(".rotate-45")];
    expect(diamonds[0]).toHaveClass("bg-brand-primary");
    expect(diamonds[1]).toHaveClass("bg-brand-primary");
    expect(diamonds[2]).toHaveClass("bg-ink-200");
  });

  it("renders a segmented bar and drops the notes when horizontal", () => {
    const { container } = render(
      <StepTracker current={1} orientation="horizontal" steps={STEPS} />
    );

    expect(container.querySelectorAll(".rotate-45")).toHaveLength(0);
    expect(screen.queryByText("Chilli paneer is charring.")).not.toBeInTheDocument();
    expect(screen.getByText("On the tandoor")).toBeInTheDocument();
  });

  it("accepts bare strings as steps with no note", () => {
    render(<StepTracker current={2} orientation="horizontal" steps={["Cart", "Details", "Pay"]} />);

    expect(screen.getByText("Pay")).toBeInTheDocument();
  });

  it("flips to the on-brand colourway", () => {
    const { container } = render(<StepTracker current={0} steps={STEPS} tone="inverse" />);

    const diamonds = [...container.querySelectorAll(".rotate-45")];
    expect(diamonds[0]).toHaveClass("bg-surface-card");
    expect(diamonds[2]).toHaveClass("bg-glass-white");
  });

  it("treats every step as upcoming when nothing has started", () => {
    render(<StepTracker current={-1} steps={STEPS} />);

    expect(screen.getAllByText("Not started yet")).toHaveLength(3);
  });

  it("merges a caller className", () => {
    render(<StepTracker className="gap-8" current={0} label="Order progress" steps={STEPS} />);

    const list = screen.getByRole("list", { name: "Order progress" });
    expect(list).toHaveClass("gap-8");
    expect(list).not.toHaveClass("gap-3.5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StepTracker current={1} label="Order progress" steps={STEPS} />);
    await expectNoA11yViolations(container);
  });
});
