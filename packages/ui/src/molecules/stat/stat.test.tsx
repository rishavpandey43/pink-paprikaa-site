import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Stat } from "./stat";

describe("Stat", () => {
  it("renders the number and its label", () => {
    render(<Stat label="spices ground in-house, daily" value="18" />);
    expect(screen.getByText("18")).toBeVisible();
    expect(screen.getByText("spices ground in-house, daily")).toBeVisible();
  });

  it("renders the sub line only when given", () => {
    const { rerender } = render(<Stat label="outlets" value="6" />);
    expect(screen.queryByText("Gurgaon")).not.toBeInTheDocument();

    rerender(<Stat label="outlets" sub="Gurgaon" value="6" />);
    expect(screen.getByText("Gurgaon")).toBeVisible();
  });

  it("scales the number fluidly so it survives a narrow column", () => {
    render(<Stat label="outlets" value="6" />);
    expect(screen.getByText("6")).toHaveClass("text-h1-fluid");
  });

  it.each([
    ["ink", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("renders the %s tone", (tone, expected) => {
    render(<Stat label="average guest rating" tone={tone} value="4.6" />);
    expect(screen.getByText("4.6")).toHaveClass(expected);
  });

  it("centres the block when aligned centre", () => {
    const { container } = render(<Stat align="center" label="the year we started" value="2019" />);
    expect(container.firstElementChild).toHaveClass("text-center");
  });

  it("renders a leading glyph when given and none otherwise", () => {
    const { container, rerender } = render(<Stat label="average guest rating" value="4.6" />);
    expect(container.querySelectorAll("svg")).toHaveLength(0);

    rerender(<Stat icon={Heart} label="average guest rating" value="4.6" />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("hides the decorative glyph from assistive tech", () => {
    const { container } = render(<Stat icon={Heart} label="average guest rating" value="4.6" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("merges a caller className", () => {
    const { container } = render(<Stat className="gap-4" label="outlets" value="6" />);
    expect(container.firstElementChild).toHaveClass("gap-4");
    expect(container.firstElementChild).not.toHaveClass("gap-1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Stat icon={Heart} label="average guest rating" sub="Across every channel" value="4.6" />
    );
    await expectNoA11yViolations(container);
  });
});
