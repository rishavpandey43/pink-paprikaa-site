import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Card } from "./card";

describe("Card", () => {
  it("is a white card and a light island by default", () => {
    render(<Card>Sector 57</Card>);
    const card = screen.getByText("Sector 57");
    expect(card).toHaveAttribute("data-surface", "light");
    expect(card).toHaveClass(
      "bg-surface-card",
      "border",
      "border-border-subtle",
      "rounded-lg",
      "shadow-1",
      "p-5",
      "overflow-hidden"
    );
  });

  it.each([
    [{ variant: "default" }, "light", "bg-surface-card", "rounded-lg"],
    [{ variant: "feature" }, "soft", "bg-surface-brand-soft", "rounded-xl"],
    [{ surface: "brand" }, "brand", "bg-surface-brand", "rounded-xl"],
    [{ surface: "ink" }, "ink", "bg-surface-inverse", "rounded-xl"],
    [{ variant: "quiet" }, "light", "bg-surface-sunken", "rounded-lg"],
  ] as const)("%o sets data-surface=%s, a %s field and %s", (props, dataSurface, fill, radius) => {
    render(<Card {...props}>Card</Card>);
    const card = screen.getByText("Card");
    expect(card).toHaveAttribute("data-surface", dataSurface);
    expect(card).toHaveClass(fill, radius);
  });

  it("a flooded surface drops the default card's border and shadow", () => {
    render(<Card surface="brand">Brand</Card>);
    const card = screen.getByText("Brand");
    expect(card).not.toHaveClass("border", "border-border-subtle", "shadow-1");
  });

  it("sx lands on the card and beats its own padding", () => {
    render(<Card sx={{ p: 8, mt: 4 }}>Card</Card>);
    const card = screen.getByText("Card");
    expect(card).toHaveClass("p-8", "mt-4");
    expect(card).not.toHaveClass("p-5");
  });

  it("gives only the brand card the brand glow and only the default card a border", () => {
    render(
      <>
        <Card surface="brand">Brand</Card>
        <Card variant="feature">Feature</Card>
      </>
    );
    expect(screen.getByText("Brand")).toHaveClass("shadow-brand");
    expect(screen.getByText("Feature").className).not.toMatch(/(^|\s)(border|shadow-)/);
  });

  it.each([
    ["none", "p-0"],
    ["sm", "p-4"],
    ["md", "p-5"],
    ["lg", "p-7"],
  ] as const)("pads %s with %s", (padding, paddingClass) => {
    render(<Card padding={padding}>Card</Card>);
    expect(screen.getByText("Card")).toHaveClass(paddingClass);
  });

  it("lifts to shadow-3 on hover only when interactive", () => {
    render(
      <>
        <Card isInteractive>Interactive</Card>
        <Card>Static</Card>
      </>
    );
    expect(screen.getByText("Interactive")).toHaveClass(
      "cursor-pointer",
      "transition",
      "duration-base",
      "hover:lift",
      "active:press-scale-card",
      "active:shadow-1",
      "hover:shadow-3"
    );
    expect(screen.getByText("Static")).not.toHaveClass("hover:lift");
  });

  it("never fades: an interactive card keeps a real surface", () => {
    render(
      <Card isInteractive variant="feature">
        Feature
      </Card>
    );
    expect(screen.getByText("Feature").className).not.toMatch(/opacity/);
  });

  it("stays a plain container, so a nested link owns the interaction", () => {
    render(
      <Card isInteractive>
        <a href="/menu">See Full Menu</a>
      </Card>
    );
    const link = screen.getByRole("link", { name: "See Full Menu" });
    expect(link).toHaveAttribute("href", "/menu");
    expect(link.parentElement?.tagName).toBe("DIV");
  });

  it("stays a light island inside a flooded field (Review Focus 5)", () => {
    render(
      <div data-surface="brand">
        <Card>Island</Card>
      </div>
    );
    expect(screen.getByText("Island")).toHaveAttribute("data-surface", "light");
  });

  it("becomes the link itself through asChild, without underlining its content", () => {
    render(
      <Card asChild isInteractive>
        <a href="/outlets/sector-57">
          <h3>Sector 57</h3>
        </a>
      </Card>
    );
    const link = screen.getByRole("link", { name: "Sector 57" });
    expect(link).toHaveAttribute("data-surface", "light");
    expect(link).toHaveClass("no-underline", "hover:lift", "bg-surface-card");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Card className="w-50" aria-label="Outlet" role="group">
        Card
      </Card>
    );
    const card = screen.getByRole("group", { name: "Outlet" });
    expect(card).toHaveClass("w-50", "p-5");
  });

  it("lets a consumer className replace its radius", () => {
    render(<Card className="rounded-md">Card</Card>);
    const card = screen.getByText("Card");
    expect(card).toHaveClass("rounded-md");
    expect(card).not.toHaveClass("rounded-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Card>
          <h3>Sector 57</h3>
          <p>8am – 11:30pm</p>
        </Card>
        <Card asChild isInteractive surface="brand">
          <a href="/menu">Menu</a>
        </Card>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
