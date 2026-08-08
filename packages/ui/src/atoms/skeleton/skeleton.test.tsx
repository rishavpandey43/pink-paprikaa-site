import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders a soft pink block that pulses rather than sweeping a gradient", () => {
    const { container } = render(<Skeleton />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("bg-brand-soft");
    expect(node).toHaveClass("animate-pp-shimmer");
    expect(node?.className).not.toMatch(/gradient/);
  });

  it("is hidden from assistive tech when it carries no label", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("announces politely once it is given a label", () => {
    render(<Skeleton label="Loading the menu" />);
    const node = screen.getByRole("status", { name: "Loading the menu" });

    expect(node).toBeInTheDocument();
    expect(node).not.toHaveAttribute("aria-hidden");
  });

  it.each([
    ["text", "rounded-1"],
    ["block", "rounded-3"],
    ["circle", "rounded-6"],
  ] as const)("renders the %s variant", (variant, expected) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("stacks the requested number of lines", () => {
    const { container } = render(<Skeleton lines={3} />);
    expect(container.firstElementChild?.children).toHaveLength(3);
  });

  it("varies the line widths so a stack reads as prose", () => {
    const { container } = render(<Skeleton lines={4} />);
    const widths = [...(container.firstElementChild?.children ?? [])].map((line) =>
      [...line.classList].find((name) => name.startsWith("w-"))
    );

    expect(widths).toEqual(["w-full", "w-11/12", "w-2/3", "w-5/6"]);
  });

  it("cycles the widths past the fourth line", () => {
    const { container } = render(<Skeleton lines={5} />);
    const lines = [...(container.firstElementChild?.children ?? [])];

    expect(lines[4]).toHaveClass("w-full");
  });

  it("keeps stacked lines on the text variant whatever variant was asked for", () => {
    const { container } = render(<Skeleton lines={2} variant="circle" />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("rounded-1");
  });

  it("merges a caller className onto a single block", () => {
    const { container } = render(<Skeleton className="rounded-4" />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("rounded-4");
    expect(node).not.toHaveClass("rounded-1");
  });

  it("merges a caller className onto the stack when lines are used", () => {
    const { container } = render(<Skeleton className="gap-6" lines={2} />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("gap-6");
    expect(node).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Skeleton label="Loading the menu" variant="block" />
        <Skeleton lines={3} />
        <Skeleton variant="circle" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
