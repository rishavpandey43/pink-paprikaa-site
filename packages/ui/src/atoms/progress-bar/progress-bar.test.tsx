import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ProgressBar } from "./progress-bar";

/** The stamps inside a segmented track, in document order. */
function segmentsOf(): Element[] {
  return [...screen.getByRole("progressbar").children];
}

describe("ProgressBar", () => {
  it("exposes the score against the scale", () => {
    render(<ProgressBar label="Uploading your photo" max={100} value={70} />);
    const node = screen.getByRole("progressbar", { name: "Uploading your photo" });

    expect(node).toHaveAttribute("aria-valuenow", "70");
    expect(node).toHaveAttribute("aria-valuemax", "100");
  });

  it("takes its accessible name from the visible label", () => {
    render(<ProgressBar label="Order being packed" value={40} />);

    expect(screen.getByText("Order being packed")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Order being packed" })).toBeInTheDocument();
  });

  it("accepts an aria-label when there is no visible caption", () => {
    render(<ProgressBar aria-label="Checkout progress" value={25} />);
    expect(screen.getByRole("progressbar", { name: "Checkout progress" })).toBeInTheDocument();
  });

  it("fills the continuous track by real percentage", () => {
    render(<ProgressBar aria-label="Upload" max={200} value={50} />);
    const indicator = screen.getByRole("progressbar").firstElementChild;

    expect(indicator).toHaveStyle({ width: "25.000%" });
  });

  it("clamps a value that overshoots the scale", () => {
    render(<ProgressBar aria-label="Upload" max={100} value={140} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("draws one stamp per segment and turns on only the earned ones", () => {
    render(<ProgressBar aria-label="Loyalty" segments={6} value={3} />);
    const stamps = segmentsOf();

    expect(stamps).toHaveLength(6);
    expect(stamps.filter((stamp) => stamp.classList.contains("bg-brand-primary"))).toHaveLength(3);
    expect(stamps.filter((stamp) => stamp.classList.contains("bg-brand-soft"))).toHaveLength(3);
  });

  it("makes the segment count the scale, ignoring max", () => {
    render(<ProgressBar aria-label="Loyalty" max={100} segments={6} value={4} />);
    const node = screen.getByRole("progressbar");

    expect(node).toHaveAttribute("aria-valuemax", "6");
    expect(node).toHaveAttribute("aria-valuenow", "4");
  });

  it("gaps a segmented track and clips a continuous one", () => {
    const { rerender } = render(<ProgressBar aria-label="Loyalty" segments={4} value={2} />);
    expect(screen.getByRole("progressbar")).toHaveClass("gap-1");

    rerender(<ProgressBar aria-label="Upload" value={50} />);
    expect(screen.getByRole("progressbar")).toHaveClass("overflow-hidden");
  });

  it.each([
    ["brand", "bg-brand-primary"],
    ["mint", "bg-mint"],
    ["inverse", "bg-surface-card"],
  ] as const)("fills the %s tone with its own colour", (tone, expected) => {
    render(<ProgressBar aria-label="Upload" tone={tone} value={50} />);
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(expected);
  });

  it.each([
    ["sm", "h-1-5"],
    ["md", "h-2"],
    ["lg", "h-3"],
  ] as const)("renders the %s size at its fixed track height", (size, expected) => {
    render(<ProgressBar aria-label="Upload" size={size} value={50} />);
    expect(screen.getByRole("progressbar")).toHaveClass(expected);
  });

  it("puts the inverse label on the on-brand text colour", () => {
    render(<ProgressBar label="Four stamps in" tone="inverse" value={50} />);
    expect(screen.getByText("Four stamps in")).toHaveClass("text-text-on-brand");
  });

  it("merges a caller className", () => {
    const { container } = render(<ProgressBar aria-label="Upload" className="gap-6" value={50} />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("gap-6");
    expect(node).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <ProgressBar label="Three more visits and chai is on us" segments={6} value={3} />
        <ProgressBar label="Uploading your photo" value={70} />
        <ProgressBar aria-label="Kitchen prep" tone="mint" value={45} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
