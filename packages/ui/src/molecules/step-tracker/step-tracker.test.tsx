import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StepTracker, type TrackerStep } from "./step-tracker";

const ORDER: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

const CHECKOUT: TrackerStep[] = [
  { label: "Cart" },
  { label: "Details" },
  { label: "Pay" },
  { label: "Confirmed" },
];

function states(): (string | null)[] {
  return screen.getAllByRole("listitem").map((step) => step.getAttribute("data-state"));
}

describe("StepTracker", () => {
  it("is an ordered list whose current step is marked for assistive tech", () => {
    render(<StepTracker steps={ORDER} current={1} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("On the tandoor").closest("li")).toHaveAttribute(
      "aria-current",
      "step"
    );
    expect(states()).toEqual(["complete", "current", "upcoming"]);
  });

  it("completes every step when current is past the last", () => {
    render(<StepTracker steps={ORDER} current={3} />);
    expect(states()).toEqual(["complete", "complete", "complete"]);
    expect(screen.queryByRole("listitem", { current: "step" })).not.toBeInTheDocument();
  });

  it("leaves every step upcoming when nothing has started", () => {
    render(<StepTracker steps={ORDER} current={-1} />);
    expect(states()).toEqual(["upcoming", "upcoming", "upcoming"]);
    expect(screen.getAllByText("Not started yet")).toHaveLength(3);
  });

  it("spells each step's state out for assistive tech — never by colour alone", () => {
    render(<StepTracker steps={ORDER} current={1} aria-label="Order progress" />);
    expect(screen.getByRole("list", { name: "Order progress" })).toBeInTheDocument();
    expect(screen.getByText("Done")).toHaveClass("sr-only");
    expect(screen.getByText("In progress")).toHaveClass("sr-only");
    expect(screen.getByText("Not started yet")).toHaveClass("sr-only");
    expect(screen.getByText("On the tandoor").closest("li")).toHaveTextContent(
      "In progressOn the tandoor"
    );
  });

  it("keeps its unstyled steps a list for Safari, with an explicit list role", () => {
    render(<StepTracker steps={ORDER} current={0} />);
    expect(screen.getByRole("list")).toHaveAttribute("role", "list");
  });

  it("merges a caller className over its own gap", () => {
    render(<StepTracker steps={ORDER} current={0} className="gap-8" />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("gap-8");
    expect(list).not.toHaveClass("gap-3.5");
  });

  it("draws a diamond per step with a check on the completed ones, all decorative", () => {
    const { container } = render(<StepTracker steps={ORDER} current={2} />);
    expect(container.querySelectorAll(".mask-symbol")).toHaveLength(3);
    expect(container.querySelectorAll("svg.lucide-check")).toHaveLength(2);
    for (const marker of container.querySelectorAll("li > span:first-child")) {
      expect(marker).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("shows the notes in the vertical layout", () => {
    render(<StepTracker steps={ORDER} current={1} />);
    expect(screen.getByText("Chilli paneer is charring.")).toHaveClass("text-text-muted");
  });

  it("draws the horizontal layout as a segmented bar without notes", () => {
    const { container } = render(
      <StepTracker
        steps={[{ label: "Cart", note: "2 items" }, ...CHECKOUT.slice(1)]}
        current={1}
        orientation="horizontal"
      />
    );
    expect(container.firstElementChild).toHaveClass("flex");
    expect(container.querySelectorAll(".bg-step-tracker-bar-on")).toHaveLength(2);
    expect(container.querySelectorAll(".bg-step-tracker-bar-off")).toHaveLength(2);
    expect(screen.queryByText("2 items")).not.toBeInTheDocument();
  });

  it("sets reached labels in heading ink, the current one bold, the rest subtle", () => {
    render(<StepTracker steps={CHECKOUT} current={1} orientation="horizontal" />);
    expect(screen.getByText("Cart")).toHaveClass("text-text-heading", "font-medium");
    expect(screen.getByText("Details")).toHaveClass("text-text-heading", "font-bold");
    expect(screen.getByText("Pay")).toHaveClass("text-text-subtle");
  });

  it("has no accessibility violations in either orientation", async () => {
    const { container } = render(
      <>
        <StepTracker steps={ORDER} current={1} />
        <StepTracker steps={CHECKOUT} current={1} orientation="horizontal" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
