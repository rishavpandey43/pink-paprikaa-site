import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("renders its visible label beside the dot", () => {
    render(<StatusDot label="Open till 11:30pm" tone="open" />);
    expect(screen.getByText("Open till 11:30pm")).toBeInTheDocument();
  });

  it("hides the dot from assistive tech when a visible label already says the state", () => {
    render(<StatusDot label="Open till 11:30pm" tone="open" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("names a bare dot after its tone so colour never carries meaning alone", () => {
    render(<StatusDot tone="busy" />);
    expect(screen.getByRole("img", { name: "Busy" })).toBeInTheDocument();
  });

  it.each([
    ["open", "bg-status-success"],
    ["busy", "bg-status-warning"],
    ["closed", "bg-ink-400"],
    ["live", "bg-brand-primary"],
    ["danger", "bg-status-danger"],
  ] as const)("paints the %s tone", (tone, expected) => {
    render(<StatusDot tone={tone} />);
    expect(screen.getByRole("img")).toHaveClass(expected);
  });

  it.each([
    ["xs", "size-2"],
    ["sm", "size-3"],
    ["md", "size-4"],
    ["lg", "size-5"],
  ] as const)("draws the %s dot at its fixed size", (size, expected) => {
    render(<StatusDot size={size} tone="open" />);
    expect(screen.getByRole("img")).toHaveClass(expected);
  });

  it("is a rotated diamond rather than a circle", () => {
    render(<StatusDot tone="open" />);
    const dot = screen.getByRole("img");
    expect(dot).toHaveClass("rotate-45");
    expect(dot).toHaveClass("rounded-1");
  });

  it("throbs only when asked to", () => {
    const { rerender } = render(<StatusDot tone="live" />);
    expect(screen.getByRole("img")).not.toHaveClass("animate-pp-pulse");

    rerender(<StatusDot isPulsing tone="live" />);
    expect(screen.getByRole("img")).toHaveClass("animate-pp-pulse");
  });

  it("merges a caller className onto the row", () => {
    const { container } = render(<StatusDot className="gap-4" label="Opens 9am" tone="closed" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("gap-4");
    expect(root).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <StatusDot label="Open till 11:30pm" tone="open" />
        <StatusDot label="Kitchen is busy" tone="busy" />
        <StatusDot isPulsing label="On the tandoor" tone="live" />
        <StatusDot tone="closed" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
