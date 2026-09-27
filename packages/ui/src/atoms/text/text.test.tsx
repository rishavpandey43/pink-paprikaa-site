import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Text } from "./text";

describe("Text", () => {
  it("renders body copy as a paragraph in the body tone, wrapping pretty", () => {
    render(<Text>We roast our own masala every morning.</Text>);
    const copy = screen.getByText("We roast our own masala every morning.");
    expect(copy.tagName).toBe("P");
    expect(copy).toHaveClass("m-0", "font-body", "text-body", "text-text-body", "text-pretty");
  });

  it.each([
    ["h1", 1],
    ["h2", 2],
    ["h3", 3],
    ["h4", 4],
  ] as const)("renders the %s step as a level-%i heading in the heading tone", (variant, level) => {
    render(<Text variant={variant}>Our Menu</Text>);
    const heading = screen.getByRole("heading", { level, name: "Our Menu" });
    expect(heading).toHaveClass(
      "font-display",
      `text-${variant}`,
      "text-text-heading",
      "text-balance"
    );
  });

  it.each([
    ["display-1", "SPAN"],
    ["display-2", "SPAN"],
    ["body-lg", "P"],
    ["body-sm", "P"],
    ["caption", "SPAN"],
    ["overline", "SPAN"],
    ["mono", "SPAN"],
  ] as const)("renders the %s step as a <%s>", (variant, tag) => {
    render(<Text variant={variant}>Chai</Text>);
    expect(screen.getByText("Chai").tagName).toBe(tag);
  });

  it("sets display steps in the heading tone on the display face", () => {
    render(<Text variant="display-1">Desi at heart.</Text>);
    expect(screen.getByText("Desi at heart.")).toHaveClass(
      "font-display",
      "text-display-1",
      "text-text-heading"
    );
  });

  it("sets the overline in capitals on the display face, in the body tone", () => {
    render(<Text variant="overline">The Menu</Text>);
    expect(screen.getByText("The Menu")).toHaveClass(
      "font-display",
      "text-overline",
      "uppercase",
      "text-text-body"
    );
  });

  it("sets order codes in the mono face", () => {
    render(<Text variant="mono">PPK-4821</Text>);
    expect(screen.getByText("PPK-4821")).toHaveClass("font-mono", "text-mono");
  });

  it("lets `as` choose the element without changing the ramp step", () => {
    render(
      <Text variant="h2" as="p">
        Most ordered this week
      </Text>
    );
    const text = screen.getByText("Most ordered this week");
    expect(text.tagName).toBe("P");
    expect(text).toHaveClass("text-h2");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it.each([
    ["heading", "text-text-heading"],
    ["body", "text-text-body"],
    ["muted", "text-text-muted"],
    ["subtle", "text-text-subtle"],
    ["brand", "text-text-brand"],
    ["on-brand", "text-text-on-brand"],
    ["inverse", "text-text-on-inverse"],
    ["danger", "text-text-danger"],
  ] as const)("paints the %s tone with %s and nothing else", (tone, colour) => {
    render(
      <Text variant="h3" tone={tone}>
        Small Plates
      </Text>
    );
    const text = screen.getByText("Small Plates");
    expect(text).toHaveClass(colour);
    expect(text.className.match(/(^|\s)text-text-/g)).toHaveLength(1);
  });

  it("keeps the font size when a tone is applied (the merge never drops a step)", () => {
    render(
      <Text variant="h1" tone="muted">
        Our Menu
      </Text>
    );
    expect(screen.getByText("Our Menu")).toHaveClass("text-h1", "text-text-muted");
  });

  it.each(["display-1", "display-2", "h1", "h2", "h3", "h4", "body"] as const)(
    "swaps %s for its fluid clamp when isFluid",
    (variant) => {
      render(
        <Text variant={variant} isFluid>
          Desi at heart.
        </Text>
      );
      const text = screen.getByText("Desi at heart.");
      expect(text).toHaveClass(`text-${variant}-fluid`);
      expect(text).not.toHaveClass(`text-${variant}`);
    }
  );

  it("keeps the fixed size on steps that have no fluid twin", () => {
    render(
      <Text variant="caption" isFluid>
        Caption
      </Text>
    );
    expect(screen.getByText("Caption")).toHaveClass("text-caption");
  });

  it("applies weight, alignment, line clamping, the narrow measure and balance", () => {
    render(
      <Text weight="bold" align="center" lineClamp={2} measure="narrow" isBalanced>
        We roast our own masala every morning.
      </Text>
    );
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text).toHaveClass(
      "font-bold",
      "text-center",
      "line-clamp-2",
      "max-w-text-measure-narrow",
      "text-balance"
    );
    expect(text).not.toHaveClass("text-pretty");
  });

  it("caps prose at the 64ch measure token, never Tailwind's 65ch max-w-prose", () => {
    render(<Text measure="prose">We roast our own masala every morning.</Text>);
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text).toHaveClass("max-w-text-measure-prose");
    expect(text).not.toHaveClass("max-w-prose");
  });

  it("adds neither an alignment nor a line-length class when asked for neither", () => {
    render(<Text>We roast our own masala every morning.</Text>);
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text.className).not.toMatch(/(^|\s)text-(start|center|end)(\s|$)/);
    expect(text.className).not.toMatch(/(^|\s)max-w-/);
  });

  it("lets the document outline differ from the visual level", () => {
    render(
      <Text as="h1" variant="h2">
        Desi at heart.
      </Text>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Desi at heart." })).toHaveClass(
      "text-h2"
    );
  });

  it("lets isBalanced={false} opt a heading out of balance", () => {
    render(
      <Text variant="h2" isBalanced={false}>
        Most ordered this week
      </Text>
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("text-pretty");
    expect(heading).not.toHaveClass("text-balance");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Text className="mt-4" id="lede" data-testid="lede">
        Lede
      </Text>
    );
    const text = screen.getByTestId("lede");
    expect(text).toHaveClass("mt-4", "m-0");
    expect(text).toHaveAttribute("id", "lede");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Text variant="h2">Chai</Text>
        <Text tone="muted">We roast our own masala every morning.</Text>
        <Text variant="overline" tone="brand">
          The Menu
        </Text>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
