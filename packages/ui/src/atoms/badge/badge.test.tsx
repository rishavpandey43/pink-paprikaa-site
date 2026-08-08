import { render, screen } from "@testing-library/react";
import { Flame, Leaf } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its label in caps", () => {
    render(<Badge>Bestseller</Badge>);
    expect(screen.getByText("Bestseller")).toHaveClass("uppercase");
  });

  it("is a label, never a control", () => {
    render(<Badge tone="brand">Bestseller</Badge>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-brand-primary"],
    ["soft", "bg-brand-soft"],
    ["ink", "bg-surface-inverse"],
    ["success", "bg-status-success-soft"],
    ["warning", "bg-status-warning-soft"],
    ["danger", "bg-status-danger-soft"],
    ["neutral", "bg-surface-sunken"],
  ] as const)("renders the %s tone", (tone, expected) => {
    render(<Badge tone={tone}>Bestseller</Badge>);
    expect(screen.getByText("Bestseller")).toHaveClass(expected);
  });

  it("defaults to the soft tone", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toHaveClass("bg-brand-soft");
  });

  it("renders a leading glyph without announcing it twice", () => {
    const { container } = render(
      <Badge icon={Flame} tone="soft">
        Hot
      </Badge>
    );
    expect(screen.getByText("Hot")).toBeInTheDocument();
    const glyphs = container.querySelectorAll("svg");
    expect(glyphs).toHaveLength(1);
    expect(glyphs[0]).toHaveAttribute("aria-hidden", "true");
  });

  it("merges a caller className", () => {
    render(<Badge className="rounded-1">Bestseller</Badge>);
    const node = screen.getByText("Bestseller");
    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Badge tone="brand">Bestseller</Badge>
        <Badge tone="soft">New</Badge>
        <Badge icon={Leaf} tone="success">
          100% Veg
        </Badge>
        <Badge tone="danger">Sold Out</Badge>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
