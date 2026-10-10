import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { Typography } from "./typography";

describe("Typography", () => {
  it("renders body copy as a paragraph in the body color, wrapping pretty", () => {
    render(<Typography>We roast our own masala every morning.</Typography>);
    const copy = screen.getByText("We roast our own masala every morning.");
    expect(copy.tagName).toBe("P");
    expect(copy).toHaveClass("m-0", "font-body", "text-body", "text-text-body", "text-pretty");
  });

  it.each([
    ["h1", 1],
    ["h2", 2],
    ["h3", 3],
    ["h4", 4],
  ] as const)(
    "renders the %s step as a level-%i heading in the heading color",
    (variant, level) => {
      render(<Typography variant={variant}>Our Menu</Typography>);
      const heading = screen.getByRole("heading", { level, name: "Our Menu" });
      expect(heading).toHaveClass(
        "font-display",
        `text-${variant}`,
        "text-text-heading",
        "text-balance"
      );
    }
  );

  it.each([
    ["display-1", "SPAN"],
    ["display-2", "SPAN"],
    ["body-lg", "P"],
    ["body-sm", "P"],
    ["caption", "SPAN"],
    ["overline", "SPAN"],
    ["mono", "SPAN"],
  ] as const)("renders the %s step as a <%s>", (variant, tag) => {
    render(<Typography variant={variant}>Chai</Typography>);
    expect(screen.getByText("Chai").tagName).toBe(tag);
  });

  it("sets display steps in the heading color on the display face", () => {
    render(<Typography variant="display-1">Desi at heart.</Typography>);
    expect(screen.getByText("Desi at heart.")).toHaveClass(
      "font-display",
      "text-display-1",
      "text-text-heading"
    );
  });

  it("sets the overline in capitals on the display face, in the body color", () => {
    render(<Typography variant="overline">The Menu</Typography>);
    expect(screen.getByText("The Menu")).toHaveClass(
      "font-display",
      "text-overline",
      "uppercase",
      "text-text-body"
    );
  });

  it("sets order codes in the mono face", () => {
    render(<Typography variant="mono">PPK-4821</Typography>);
    expect(screen.getByText("PPK-4821")).toHaveClass("font-mono", "text-mono");
  });

  it("lets `as` choose the element without changing the ramp step", () => {
    render(
      <Typography variant="h2" as="p">
        Most ordered this week
      </Typography>
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
  ] as const)("paints the %s color with %s and nothing else", (color, colour) => {
    render(
      <Typography variant="h3" color={color}>
        Small Plates
      </Typography>
    );
    const text = screen.getByText("Small Plates");
    expect(text).toHaveClass(colour);
    expect(text.className.match(/(^|\s)text-text-/g)).toHaveLength(1);
  });

  it("keeps the font size when a color is applied (the merge never drops a step)", () => {
    render(
      <Typography variant="h1" color="muted">
        Our Menu
      </Typography>
    );
    expect(screen.getByText("Our Menu")).toHaveClass("text-h1", "text-text-muted");
  });

  it.each(["display-1", "display-2", "h1", "h2", "h3", "h4", "body"] as const)(
    "swaps %s for its fluid clamp when isFluid",
    (variant) => {
      render(
        <Typography variant={variant} isFluid>
          Desi at heart.
        </Typography>
      );
      const text = screen.getByText("Desi at heart.");
      expect(text).toHaveClass(`text-${variant}-fluid`);
      expect(text).not.toHaveClass(`text-${variant}`);
    }
  );

  it("keeps the fixed size on steps that have no fluid twin", () => {
    render(
      <Typography variant="caption" isFluid>
        Caption
      </Typography>
    );
    expect(screen.getByText("Caption")).toHaveClass("text-caption");
  });

  it("applies weight, alignment, line clamping, the narrow measure and balance", () => {
    render(
      <Typography weight="bold" align="center" lineClamp={2} measure="narrow" isBalanced>
        We roast our own masala every morning.
      </Typography>
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
    render(<Typography measure="prose">We roast our own masala every morning.</Typography>);
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text).toHaveClass("max-w-text-measure-prose");
    expect(text).not.toHaveClass("max-w-prose");
  });

  it("adds neither an alignment nor a line-length class when asked for neither", () => {
    render(<Typography>We roast our own masala every morning.</Typography>);
    const text = screen.getByText("We roast our own masala every morning.");
    expect(text.className).not.toMatch(/(^|\s)text-(start|center|end)(\s|$)/);
    expect(text.className).not.toMatch(/(^|\s)max-w-/);
  });

  it("lets the document outline differ from the visual level", () => {
    render(
      <Typography as="h1" variant="h2">
        Desi at heart.
      </Typography>
    );
    expect(screen.getByRole("heading", { level: 1, name: "Desi at heart." })).toHaveClass(
      "text-h2"
    );
  });

  it("lets isBalanced={false} opt a heading out of balance", () => {
    render(
      <Typography variant="h2" isBalanced={false}>
        Most ordered this week
      </Typography>
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("text-pretty");
    expect(heading).not.toHaveClass("text-balance");
  });

  it("merges a consumer className and forwards native props", () => {
    render(
      <Typography className="mt-4" id="lede" data-testid="lede">
        Lede
      </Typography>
    );
    const text = screen.getByTestId("lede");
    expect(text).toHaveClass("mt-4", "m-0");
    expect(text).toHaveAttribute("id", "lede");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Typography variant="h2">Chai</Typography>
        <Typography color="muted">We roast our own masala every morning.</Typography>
        <Typography variant="overline" color="brand">
          The Menu
        </Typography>
      </>
    );
    await expectNoA11yViolations(container);
  });
});

describe("Typography: color, sx, noWrap and the link steps", () => {
  it("takes color (the old tone) and sx", () => {
    render(
      <Typography color="muted" sx={{ mt: 4 }}>
        Thali of the day
      </Typography>
    );
    const p = screen.getByText("Thali of the day");
    expect(p).toHaveClass("text-text-muted", "mt-4");
  });

  it("paints success and link colours", () => {
    render(
      <>
        <Typography color="success">Confirmed</Typography>
        <Typography color="link">Menu</Typography>
      </>
    );
    expect(screen.getByText("Confirmed")).toHaveClass("text-text-success");
    expect(screen.getByText("Menu")).toHaveClass("text-text-link");
  });

  it("noWrap keeps one line with an ellipsis", () => {
    render(<Typography noWrap>Paneer Butter Masala with Garlic Naan</Typography>);
    const p = screen.getByText(/Paneer Butter Masala/);
    expect(p).toHaveClass("truncate", "text-nowrap");
    // text-wrap is a white-space shorthand: pretty or balance would let the line wrap again.
    expect(p).not.toHaveClass("text-pretty");
  });

  it.each([
    ["link-sm", "text-link-sm"],
    ["link-md", "text-link-md"],
    ["link-lg", "text-link-lg"],
  ] as const)("variant %s uses the link text style", (variant, cls) => {
    render(<Typography variant={variant}>Menu</Typography>);
    expect(screen.getByText("Menu")).toHaveClass(cls, "font-body");
  });

  it("variant inherit sets no size, face or colour", () => {
    render(<Typography variant="inherit">Inherited</Typography>);
    const p = screen.getByText("Inherited");
    expect(p.className).not.toMatch(/text-(body|link|h\d|caption)/);
    expect(p.className).not.toMatch(/font-(body|display|mono)/);
  });

  it("renders as an anchor when asked", () => {
    render(
      <Typography as="a" variant="link-md">
        Menu
      </Typography>
    );
    expect(screen.getByText("Menu").tagName).toBe("A");
  });

  it("className still beats sx", () => {
    render(
      <Typography sx={{ mt: 4 }} className="mt-2">
        Kulfi
      </Typography>
    );
    const p = screen.getByText("Kulfi");
    expect(p).toHaveClass("mt-2");
    expect(p).not.toHaveClass("mt-4");
  });
});
