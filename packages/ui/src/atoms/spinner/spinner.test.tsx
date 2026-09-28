import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Spinner } from "./spinner";

/** The brand mark (Plan 2a's SymbolMark) is the only `.mask-symbol` element. */
const markIn = (root: HTMLElement) => root.querySelector(".mask-symbol");

describe("Spinner", () => {
  it("is a status named Loading by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("takes its own label", () => {
    render(<Spinner label="Finding your outlet" />);
    expect(screen.getByRole("status", { name: "Finding your outlet" })).toBeInTheDocument();
  });

  it("announces its label as live-region content, not only as a name", () => {
    render(<Spinner label="Finding your outlet" />);
    const status = screen.getByRole("status");
    expect(status).not.toHaveAttribute("aria-label");
    expect(status).toHaveTextContent("Finding your outlet");
    expect(screen.getByText("Finding your outlet")).toHaveClass("sr-only");
  });

  it("draws the brand mark, pulsing only when motion is allowed", () => {
    const { container } = render(<Spinner />);
    const mark = markIn(container);
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("motion-safe:animate-mark-pulse");
  });

  it.each([
    ["sm", "size-spinner-sm"],
    ["md", "size-spinner-md"],
    ["lg", "size-spinner-lg"],
  ] as const)("renders size %s at %s", (size, sizeClass) => {
    const { container } = render(<Spinner size={size} />);
    expect(markIn(container)).toHaveClass(sizeClass);
  });

  it.each([
    ["brand", "text-pink-500"],
    ["ink", "text-ink-900"],
    ["inverse", "text-ink-000"],
  ] as const)("paints tone %s with %s", (tone, colour) => {
    const { container } = render(<Spinner tone={tone} />);
    expect(markIn(container)).toHaveClass(colour);
  });

  it("merges a caller className onto the status, replacing a conflicting class", () => {
    render(<Spinner className="flex" />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("flex");
    expect(status).not.toHaveClass("inline-flex");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Spinner label="Loading the menu" />);
    await expectNoA11yViolations(container);
  });
});
