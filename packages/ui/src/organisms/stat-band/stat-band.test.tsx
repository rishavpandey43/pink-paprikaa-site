import { render, screen, within } from "@testing-library/react";
import { Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatBand, type StatBandItem } from "./stat-band";

const STATS: StatBandItem[] = [
  { value: "30", label: "dishes on the Classic plan" },
  { value: "3 km", label: "free delivery radius" },
  { value: "100%", label: "pure vegetarian kitchen", sub: "No egg, no meat, ever" },
];

const patternLayer = (container: HTMLElement) =>
  container.querySelector('section > [aria-hidden="true"]');

describe("StatBand", () => {
  it("lists every stat with its value, label and sub-line", () => {
    render(<StatBand stats={STATS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("30");
    expect(items[0]).toHaveTextContent("dishes on the Classic plan");
    expect(screen.getByText("No egg, no meat, ever")).toBeInTheDocument();
  });

  it("renders a sub-line only for the stat that carries one", () => {
    render(<StatBand stats={STATS} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items[0]?.textContent).toBe("30dishes on the Classic plan");
    expect(items[2]).toHaveTextContent("No egg, no meat, ever");
  });

  it("renders the sub-line wrapper for a 0 sub — a number is content", () => {
    render(<StatBand stats={[{ value: "3 km", label: "free delivery radius", sub: 0 }]} />);
    expect(screen.getByText("3 km").parentElement?.children).toHaveLength(3);
  });

  it("draws one glyph per stat that asks for one", () => {
    render(
      <StatBand
        stats={STATS.map((stat, index) => (index === 1 ? stat : { ...stat, icon: Leaf }))}
      />
    );
    expect(screen.getByRole("list").querySelectorAll("svg")).toHaveLength(2);
  });

  it.each([
    ["soft", "bg-surface-brand-soft"],
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
  ] as const)("paints the %s field and sets its surface", (surfaceName, background) => {
    const { container } = render(<StatBand stats={STATS} surface={surfaceName} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surfaceName);
    expect(container.firstElementChild).toHaveClass(background);
  });

  it("colours the numbers brand on soft and white on the flooded fields", () => {
    const { rerender } = render(<StatBand stats={STATS} surface="soft" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-brand");
    rerender(<StatBand stats={STATS} surface="brand" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-on-inverse");
    rerender(<StatBand stats={STATS} surface="ink" />);
    expect(screen.getByText("3 km")).toHaveClass("text-text-on-inverse");
  });

  it("centres every stat so the row reads as one band", () => {
    render(<StatBand stats={STATS} />);
    expect(screen.getByText("3 km").parentElement).toHaveClass("text-center");
  });

  it("merges a caller className over its own, and the diamond layer lets that ground show", () => {
    const { container } = render(<StatBand stats={STATS} className="bg-surface-page" />);
    expect(container.firstElementChild).toHaveClass("bg-surface-page");
    expect(container.firstElementChild).not.toHaveClass("bg-surface-brand-soft");
    expect(patternLayer(container)).toHaveClass("bg-transparent");
    expect(patternLayer(container)).not.toHaveClass("bg-surface-brand-soft");
  });

  it("always carries the tiled diamond", () => {
    const { container } = render(<StatBand stats={STATS} />);
    expect(patternLayer(container)).toBeInTheDocument();
  });

  it("lays the stats on the auto-fitting stat grid, an explicit list", () => {
    render(<StatBand stats={STATS} />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("autogrid-min-sm", "container-page");
    // Safari drops list semantics under `list-style: none` unless the role is explicit.
    expect(list).toHaveAttribute("role", "list");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<StatBand stats={STATS} surface="brand" />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(<StatBand stats={STATS} sx={{ mt: 4 }} className="italic" />);
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
