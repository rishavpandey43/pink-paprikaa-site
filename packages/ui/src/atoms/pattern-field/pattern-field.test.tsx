import { render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { expectNoA11yViolations } from "#vitest.setup";

import { PatternField } from "./pattern-field";

describe("PatternField", () => {
  it("floods the brand pink by default and makes its content a brand surface", () => {
    const { container } = render(
      <PatternField>
        <h2>Flooded field</h2>
      </PatternField>
    );
    const field = container.firstElementChild;
    expect(field).toHaveAttribute("data-surface", "brand");
    expect(field).toHaveClass("relative", "isolate", "overflow-hidden", "bg-surface-brand");
  });

  it.each([
    ["brand", "bg-surface-brand", "bg-ink-000"],
    ["ink", "bg-surface-inverse", "bg-ink-000"],
    ["soft", "bg-surface-brand-soft", "bg-pink-500"],
    ["page", "bg-surface-page", "bg-pink-500"],
  ] as const)(
    "surface %s sets data-surface, the %s field and a %s mark",
    (surface, field, mark) => {
      const { container } = render(<PatternField surface={surface}>Field</PatternField>);
      const root = container.firstElementChild;
      expect(root).toHaveAttribute("data-surface", surface === "page" ? "light" : surface);
      expect(root).toHaveClass(field);
      expect(root?.firstElementChild).toHaveClass(mark);
    }
  );

  it("sx lands on the root and beats its own radius", () => {
    const { container } = render(
      <PatternField radius="lg" sx={{ radius: "xl", mt: 4 }}>
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("rounded-xl", "mt-4");
    expect(container.firstElementChild).not.toHaveClass("rounded-lg");
  });

  it("tiles the symbol at 64px by default and at any tile token", () => {
    const { container, rerender } = render(<PatternField>Field</PatternField>);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("pattern-tile-64");
    rerender(<PatternField tile={96}>Field</PatternField>);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("pattern-tile-96");
  });

  it.each([
    ["brand", "pattern-opacity-default"],
    ["ink", "pattern-opacity-default"],
    ["soft", "pattern-opacity-light"],
    ["page", "pattern-opacity-light"],
  ] as const)("uses the %s field's default density (%s) and only that one", (surface, opacity) => {
    const { container } = render(<PatternField surface={surface}>Field</PatternField>);
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveClass(opacity);
    expect(pattern?.className.match(/pattern-opacity-/g)).toHaveLength(1);
  });

  it("whispers at 4% when density is faint", () => {
    const { container } = render(
      <PatternField surface="ink" density="faint">
        Field
      </PatternField>
    );
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveClass("pattern-opacity-faint");
    expect(pattern?.className.match(/pattern-opacity-/g)).toHaveLength(1);
  });

  it("keeps the pattern decorative and out of the pointer's way", () => {
    const { container } = render(<PatternField>Field</PatternField>);
    const pattern = container.firstElementChild?.firstElementChild;
    expect(pattern).toHaveAttribute("aria-hidden", "true");
    expect(pattern).toHaveClass("pointer-events-none", "absolute", "inset-0");
  });

  it("paints the tile through the white symbol mask, rendered on the server", () => {
    const html = renderToStaticMarkup(<PatternField surface="ink">Statement</PatternField>);
    expect(html).toContain('data-surface="ink"');
    expect(html).toContain("mask-image:var(--pp-symbol-mask)");
  });

  it("stacks its content above the pattern", () => {
    render(
      <PatternField>
        <h2>Flooded field</h2>
      </PatternField>
    );
    expect(screen.getByRole("heading").parentElement).toHaveClass("relative", "h-full");
  });

  it.each([
    ["none", "rounded-none"],
    ["md", "rounded-md"],
    ["lg", "rounded-lg"],
    ["xl", "rounded-xl"],
  ] as const)("rounds %s with %s", (radius, radiusClass) => {
    const { container } = render(<PatternField radius={radius}>Field</PatternField>);
    expect(container.firstElementChild).toHaveClass(radiusClass);
  });

  it("patterns an existing element through asChild", () => {
    render(
      <PatternField asChild surface="ink">
        <section aria-label="Delivery zones">
          <h2>Delivery zones</h2>
        </section>
      </PatternField>
    );
    const section = screen.getByRole("region", { name: "Delivery zones" });
    expect(section).toHaveAttribute("data-surface", "ink");
    expect(section).toHaveClass("bg-surface-inverse");
    expect(section.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(within(section).getByRole("heading", { name: "Delivery zones" })).toBeInTheDocument();
  });

  it("merges a consumer className and forwards native props", () => {
    const { container } = render(
      <PatternField className="p-10" id="offer">
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("p-10", "bg-surface-brand");
    expect(container.firstElementChild).toHaveAttribute("id", "offer");
  });

  it("lets a consumer className replace its radius", () => {
    const { container } = render(
      <PatternField radius="md" className="rounded-xl">
        Field
      </PatternField>
    );
    expect(container.firstElementChild).toHaveClass("rounded-xl");
    expect(container.firstElementChild).not.toHaveClass("rounded-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <PatternField surface="brand">
        <h2>Tonight only</h2>
        <p>Chai at 8am, chilli paneer at midnight.</p>
      </PatternField>
    );
    await expectNoA11yViolations(container);
  });
});
