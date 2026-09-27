import { render, screen } from "@testing-library/react";
import { Flame } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Badge } from "./badge";

describe("Badge", () => {
  it("is a soft, uppercase, non-interactive pill by default", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New").parentElement;
    expect(badge?.tagName).toBe("SPAN");
    expect(badge).toHaveClass(
      "bg-pink-100",
      "text-pink-700",
      "font-display",
      "text-overline",
      "uppercase",
      "rounded-pill",
      "px-2.5",
      "py-1",
      "gap-1.25"
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-badge-brand-bg", "text-badge-brand-fg"],
    ["soft", "bg-pink-100", "text-pink-700"],
    ["ink", "bg-ink-900", "text-ink-000"],
    ["success", "bg-status-success-soft", "text-text-success"],
    ["warning", "bg-status-warning-soft", "text-text-warning"],
    ["danger", "bg-status-danger-soft", "text-text-danger"],
    ["neutral", "bg-ink-100", "text-ink-700"],
  ] as const)("paints the %s tone with %s and %s", (tone, fill, text) => {
    render(<Badge tone={tone}>Bestseller</Badge>);
    expect(screen.getByText("Bestseller").parentElement).toHaveClass(fill, text);
  });

  it("draws a 12px glyph at the heavy 2px stroke", () => {
    render(<Badge icon={Flame}>Hot</Badge>);
    const glyph = screen.getByText("Hot").parentElement?.firstElementChild;
    expect(glyph).toHaveClass("size-badge-icon");
    expect(glyph).not.toHaveClass("size-icon-xs");
    expect(glyph?.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it("never wraps — a long label truncates inside the pill (Review Focus 1)", () => {
    render(<Badge>Launch price for the first month</Badge>);
    const label = screen.getByText("Launch price for the first month");
    expect(label).toHaveClass("min-w-0", "truncate");
    expect(label.parentElement).toHaveClass("whitespace-nowrap", "max-w-full", "shrink-0");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Badge className="ml-1" id="pick">
        Pick
      </Badge>
    );
    const badge = screen.getByText("Pick").parentElement;
    expect(badge).toHaveClass("ml-1", "px-2.5");
    expect(badge).toHaveAttribute("id", "pick");
  });

  it("keeps its glyph decorative, so only the label is read", () => {
    render(<Badge icon={Flame}>Hot</Badge>);
    const glyphs = screen.getByText("Hot").parentElement?.querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs?.[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Badge className="rounded-md">Pick</Badge>);
    const badge = screen.getByText("Pick").parentElement;
    expect(badge).toHaveClass("rounded-md");
    expect(badge).not.toHaveClass("rounded-pill");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="success" icon={Flame}>
          100% Veg
        </Badge>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
