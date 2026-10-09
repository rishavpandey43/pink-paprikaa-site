import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import type { SurfaceProp } from "../../lib/common-props";
import { Section } from "./section";

// Spy on the real atom: Section's wiring (surface, density) is asserted here; the pattern's own
// rendering belongs to PatternField's suite.
vi.mock("../../atoms/pattern-field/pattern-field", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../atoms/pattern-field/pattern-field")>();
  return { ...actual, PatternField: vi.fn(actual.PatternField) };
});

const SURFACES: [SurfaceProp, string, string][] = [
  ["page", "bg-surface-page", "light"],
  ["alt", "bg-surface-page-alt", "light"],
  ["sunken", "bg-surface-sunken", "light"],
  ["soft", "bg-surface-brand-soft", "soft"],
  ["brand", "bg-surface-brand", "brand"],
  ["ink", "bg-surface-inverse", "ink"],
];

function bandOf(container: HTMLElement): HTMLElement {
  const band = container.firstElementChild;
  if (!(band instanceof HTMLElement)) throw new Error("Section rendered nothing");
  return band;
}

beforeEach(() => {
  vi.mocked(PatternField).mockClear();
});

describe("Section", () => {
  it("is a <section> band on the page surface with the default rhythm, content in a Container", () => {
    const { container } = render(
      <Section>
        <p>Our story</p>
      </Section>
    );
    const band = bandOf(container);
    expect(band.tagName).toBe("SECTION");
    expect(band).toHaveAttribute("data-surface", "light");
    expect(band).toHaveClass("bg-surface-page", "py-section");
    expect(screen.getByText("Our story").parentElement).toHaveClass("max-w-content", "px-gutter");
  });

  it.each(SURFACES)(
    "surface=%s paints %s and sets data-surface=%s",
    (surfaceProp, background, surface) => {
      const { container } = render(
        <Section surface={surfaceProp}>
          <p>Band</p>
        </Section>
      );
      const band = bandOf(container);
      expect(band).toHaveClass(background);
      expect(band).toHaveAttribute("data-surface", surface);
    }
  );

  it.each([
    ["none", "py-0"],
    ["tight", "py-section-tight"],
    ["default", "py-section"],
    ["loose", "py-section-loose"],
  ] as const)("space=%s sets %s", (space, rhythm) => {
    const { container } = render(
      <Section space={space}>
        <p>Band</p>
      </Section>
    );
    expect(bandOf(container)).toHaveClass(rhythm);
  });

  it("passes size to its Container", () => {
    render(
      <Section size="narrow">
        <p>Band</p>
      </Section>
    );
    expect(screen.getByText("Band").parentElement).toHaveClass("max-w-narrow");
  });

  it("puts children straight into the band when isBare", () => {
    const { container } = render(
      <Section isBare>
        <p>Full bleed</p>
      </Section>
    );
    expect(screen.getByText("Full bleed").parentElement).toBe(bandOf(container));
  });

  it("renders the element named by as", () => {
    render(
      <Section as="aside" aria-label="Offers">
        <p>Band</p>
      </Section>
    );
    expect(screen.getByRole("complementary", { name: "Offers" })).toBeInTheDocument();
  });

  it("lets a consumer className replace the rhythm and passes native props through", () => {
    const { container } = render(
      <Section className="py-0" id="story">
        <p>Band</p>
      </Section>
    );
    const band = bandOf(container);
    expect(band).toHaveClass("py-0", "bg-surface-page");
    expect(band).not.toHaveClass("py-section");
    expect(band).toHaveAttribute("id", "story");
  });

  // Review Focus 2, pure half — the rendered-CSS half is the NestedSurfaces story.
  it("resets to the light surface when a light band sits inside a dark one", () => {
    const { container } = render(
      <Section surface="ink">
        <Section surface="alt">
          <p>Light island</p>
        </Section>
      </Section>
    );
    const inner = screen.getByText("Light island").closest("section");
    expect(bandOf(container)).toHaveAttribute("data-surface", "ink");
    expect(inner).toHaveAttribute("data-surface", "light");
    expect(inner).toHaveClass("bg-surface-page-alt");
  });

  describe("pattern", () => {
    it("draws no pattern by default", () => {
      render(
        <Section>
          <p>Band</p>
        </Section>
      );
      expect(PatternField).not.toHaveBeenCalled();
    });

    it.each([
      ["brand", "brand"],
      ["ink", "ink"],
      ["soft", "soft"],
      ["alt", "page"],
    ] as const)(
      "on surface=%s lays a %s PatternField behind the content",
      (surfaceProp, surface) => {
        const { container } = render(
          <Section surface={surfaceProp} pattern="faint">
            <p>Band</p>
          </Section>
        );
        expect(vi.mocked(PatternField).mock.calls[0]?.[0]).toMatchObject({
          surface,
          density: "faint",
          "aria-hidden": true,
        });
        const band = bandOf(container);
        const [layer, content] = [...band.children];
        expect(band).toHaveClass("relative");
        expect(layer).toHaveClass("pointer-events-none", "absolute", "inset-0", "bg-transparent");
        expect(content).toHaveClass("relative");
        expect(content).toContainElement(screen.getByText("Band"));
      }
    );

    it("keeps the band's own colour under the pattern", () => {
      const { container } = render(
        <Section surface="alt" pattern="default">
          <p>Band</p>
        </Section>
      );
      expect(bandOf(container)).toHaveClass("bg-surface-page-alt");
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Section surface="brand" pattern="default" aria-labelledby="story-title">
        <h2 id="story-title">Our story</h2>
      </Section>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root", () => {
    render(
      <Section data-testid="root" sx={{ mt: 6, px: { md: 4 } }}>
        x
      </Section>
    );
    expect(screen.getByTestId("root")).toHaveClass("mt-6", "md:px-4");
  });

  it("takes surface, setting data-surface and the ground", () => {
    render(
      <Section surface="brand" data-testid="s">
        x
      </Section>
    );
    expect(screen.getByTestId("s")).toHaveAttribute("data-surface", "brand");
    expect(screen.getByTestId("s")).toHaveClass("bg-surface-brand");
  });
});
