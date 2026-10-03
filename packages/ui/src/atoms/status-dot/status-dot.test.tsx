import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("shows a visible label beside a decorative dot", () => {
    render(<StatusDot label="Open till 11:30pm" />);
    const label = screen.getByText("Open till 11:30pm");
    expect(label).toHaveClass("font-body", "text-status-dot-label", "text-text-body");
    const root = label.parentElement;
    expect(root).not.toHaveAttribute("role");
    expect(root).toHaveClass("inline-flex", "items-center", "gap-2");
    expect(root?.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["open", "Open"],
    ["busy", "Busy"],
    ["closed", "Closed"],
    ["live", "Live"],
    ["danger", "Attention"],
  ] as const)(
    "announces a bare %s dot as %s — never colour alone (Review Focus 2)",
    (status, name) => {
      render(<StatusDot status={status} />);
      expect(screen.getByRole("img", { name })).toBeInTheDocument();
    }
  );

  it("treats a blank label as no label, so the dot is still named by its status", () => {
    const { container } = render(<StatusDot status="busy" label="   " />);
    expect(screen.getByRole("img", { name: "Busy" })).toBeInTheDocument();
    expect(container.firstElementChild?.children).toHaveLength(1);
  });

  it("lets a consumer name a bare dot", () => {
    render(<StatusDot status="open" aria-label="Sector 57 is open" />);
    expect(screen.getByRole("img", { name: "Sector 57 is open" })).toBeInTheDocument();
  });

  it.each([
    ["open", "text-status-success"],
    ["busy", "text-status-warning"],
    ["closed", "text-ink-400"],
    ["live", "text-pink-500"],
    ["danger", "text-status-danger"],
  ] as const)("colours the %s diamond with %s", (status, colour) => {
    const { container } = render(<StatusDot status={status} />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass(colour);
  });

  it("draws a rotated diamond carrying the counter-rotated brand mark", () => {
    const { container } = render(<StatusDot />);
    const diamond = container.firstElementChild?.firstElementChild?.lastElementChild;
    expect(diamond).toHaveClass("rotate-45", "rounded-diamond", "bg-current", "overflow-hidden");
    expect(diamond?.querySelector(".mask-symbol")).toHaveClass(
      "size-4/5",
      "-rotate-45",
      "text-ink-000",
      "opacity-66"
    );
  });

  it.each([
    ["sm", "size-status-dot-sm"],
    ["md", "size-status-dot-md"],
  ] as const)("sizes %s with %s", (size, sizeClass) => {
    const { container } = render(<StatusDot size={size} />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass(sizeClass);
  });

  it("is 14px (sm) by default", () => {
    const { container } = render(<StatusDot />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("size-status-dot-sm");
  });

  it("pulses only when isPulsing — unrotated (the keyframes rotate it) and hidden under reduced motion", () => {
    const { container, rerender } = render(<StatusDot status="live" label="On the tandoor" />);
    const dot = () => container.firstElementChild?.firstElementChild;
    expect(dot()?.children).toHaveLength(1);
    rerender(<StatusDot status="live" label="On the tandoor" isPulsing />);
    expect(dot()?.children).toHaveLength(2);
    const pulse = dot()?.firstElementChild;
    expect(pulse).toHaveClass("animate-dot-pulse", "motion-reduce:hidden", "bg-current");
    expect(pulse).not.toHaveClass("rotate-45");
  });

  it("merges a consumer className", () => {
    render(<StatusDot label="Opens 9am" className="ml-2" />);
    expect(screen.getByText("Opens 9am").parentElement).toHaveClass("ml-2", "gap-2");
  });

  it("sx lands on the root and beats its own gap", () => {
    render(<StatusDot label="Opens 9am" sx={{ gap: 4, mt: 4 }} />);
    const root = screen.getByText("Opens 9am").parentElement;
    expect(root).toHaveClass("gap-4", "mt-4");
    expect(root).not.toHaveClass("gap-2");
  });

  it("lets a consumer className replace the gap", () => {
    render(<StatusDot status="closed" label="Opens 9am" className="gap-4" />);
    const root = screen.getByText("Opens 9am").parentElement;
    expect(root).toHaveClass("gap-4");
    expect(root).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <StatusDot status="open" label="Open till 11:30pm" />
        <StatusDot status="live" label="On the tandoor" isPulsing />
        <StatusDot status="closed" size="md" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
