import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Card } from "./card";

describe("Card", () => {
  it("renders its children on the white surface by default", () => {
    render(
      <Card>
        <p>Sector 57, Gurgaon</p>
      </Card>
    );
    const node = screen.getByText("Sector 57, Gurgaon").parentElement;
    expect(node).toHaveClass("bg-surface-card");
    expect(node).toHaveClass("border-border-subtle");
    expect(node).toHaveClass("shadow-elevation1");
  });

  it.each([
    ["default", "bg-surface-card"],
    ["feature", "bg-surface-brand-soft"],
    ["brand", "bg-surface-brand"],
    ["ink", "bg-surface-inverse"],
    ["quiet", "bg-surface-sunken"],
  ] as const)("renders the %s skin", (variant, expected) => {
    const { container } = render(<Card variant={variant} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it.each([
    ["default", "rounded-4"],
    ["feature", "rounded-5"],
    ["brand", "rounded-5"],
    ["ink", "rounded-5"],
    ["quiet", "rounded-4"],
  ] as const)("gives the %s skin its own corner radius", (variant, expected) => {
    const { container } = render(<Card variant={variant} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("flips the ink colour on the flooded skins so unstyled text stays legible", () => {
    const { container } = render(<Card variant="brand" />);
    expect(container.firstElementChild).toHaveClass("text-text-on-brand");
  });

  it.each([
    ["none", "p-0"],
    ["sm", "p-4"],
    ["md", "p-5"],
    ["lg", "p-7"],
  ] as const)("applies the %s padding step", (padding, expected) => {
    const { container } = render(<Card padding={padding} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("adds the hover lift only when it is interactive", () => {
    const { container: resting } = render(<Card />);
    expect(resting.firstElementChild).not.toHaveClass("hover:shadow-elevation3");

    const { container: lifting } = render(<Card isInteractive />);
    expect(lifting.firstElementChild).toHaveClass("hover:shadow-elevation3");
    expect(lifting.firstElementChild).toHaveClass("hover:translate-y-(--motion-lift-y)");
  });

  it("keeps a real surface rather than fading, so nested text never dims", () => {
    const { container } = render(<Card isInteractive variant="feature" />);
    expect(container.firstElementChild?.className).not.toMatch(/opacity-/);
  });

  it("stays a plain container so a caller can nest a link that owns the interaction", () => {
    render(
      <Card isInteractive>
        <a href="/menu">See Full Menu</a>
      </Card>
    );
    expect(screen.getByRole("link", { name: "See Full Menu" })).toHaveAttribute("href", "/menu");
  });

  it("merges a caller className", () => {
    const { container } = render(<Card className="rounded-6" />);
    expect(container.firstElementChild).toHaveClass("rounded-6");
    expect(container.firstElementChild).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Card>
          <p>Open 8am – 11:30pm</p>
        </Card>
        <Card isInteractive variant="feature">
          <a href="/menu">See Full Menu</a>
        </Card>
        <Card padding="none" variant="ink">
          <p>Momos from ₹180</p>
        </Card>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
