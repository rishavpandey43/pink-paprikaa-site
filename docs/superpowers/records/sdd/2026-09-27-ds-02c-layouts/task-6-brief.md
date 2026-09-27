### Task 6: Section

**Files:**

- Create: `packages/design-tokens/tokens/component/section.json`, `packages/ui/src/layouts/section/{section.tsx,section.test.tsx,section.stories.tsx}`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/section/section.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                            | Ruling  | Where / clause                                                                     |
| ----------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `<section>` with the default rhythm, content in a Container                         | ALREADY | Step 2 first test                                                                  |
| `padding` none/tight/default/loose (arbitrary `py-[clamp(…)]`)                      | ALREADY | `space` + `section-{tight,loose}` tokens (contracts §4; token-only rule)           |
| Rhythm `clamp(56px, 7vw, 96px)`                                                     | DROP    | C8 (handoff `clamp(48px, 8vw, 96px)`)                                              |
| `size` passed to the Container                                                      | ALREADY | Step 2                                                                             |
| `bare` skips the Container                                                          | ALREADY | `isBare` (spec §8.2)                                                               |
| `as` (footer → `contentinfo`)                                                       | ALREADY | Step 2 `as="aside"`; union per contracts §4                                        |
| Background only through `className`; test "emits no colour, border or type classes" | DROP    | Spec §9.4 `tone` + §8.1: Section paints its field and sets `data-surface` (D5)     |
| Test: caller className replaces the rhythm; native props pass through               | ADD     | Step 2 className test                                                              |
| Test: axe with a heading                                                            | ALREADY | Step 2                                                                             |
| Story `Default`, `Rhythm`, `Grounds`                                                | ALREADY | `Playground`, `Rhythm`, `Tones`                                                    |
| Story `Widths` (`size` prose/wide, `bare`)                                          | ADD     | Step 6 `Widths`                                                                    |
| Story `InContext` (brand band, then a prose band)                                   | ADD     | Step 6 `InContext`                                                                 |
| Only large text on the brand band (the 4.04:1 note)                                 | DROP    | Spec §5.1: white on brand is the declared 3:1 exception, owned by the token policy |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Container`, `ContainerSize` (Task 2); `PatternField` (Plan 2a, contracts §2 — `tone`, `density`, `className`, sets `data-surface`); `--spacing-section` and `--color-surface-*` (Plan 1); the surfaces in `surfaces.css` (the light surface restores every override); `Stack`, `Text` in stories.
- Produces: `Section`, `type SectionProps`, `type SectionTone` (module export), and component tokens `--spacing-section-{tight,loose}`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/section.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "section-tight": {
      "$value": "clamp(36px, 4vw, 56px)",
      "$description": "Section space=\"tight\" (design system Section.jsx)."
    },
    "section-loose": {
      "$value": "clamp(72px, 9vw, 128px)",
      "$description": "Section space=\"loose\" (design system Section.jsx)."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, add to `SPACING`:

```ts
  "section-tight",
  "section-loose",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/layouts/section/section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Section, type SectionTone } from "./section";

// Spy on the real atom: Section's wiring (tone, density) is asserted here; the pattern's own
// rendering belongs to PatternField's suite.
vi.mock("../../atoms/pattern-field/pattern-field", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../atoms/pattern-field/pattern-field")>();
  return { ...actual, PatternField: vi.fn(actual.PatternField) };
});

const TONES: [SectionTone, string, string][] = [
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

  it.each(TONES)("tone=%s paints %s and sets data-surface=%s", (tone, background, surface) => {
    const { container } = render(
      <Section tone={tone}>
        <p>Band</p>
      </Section>
    );
    const band = bandOf(container);
    expect(band).toHaveClass(background);
    expect(band).toHaveAttribute("data-surface", surface);
  });

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
      <Section tone="ink">
        <Section tone="alt">
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
      ["alt", "light"],
    ] as const)("on tone=%s lays a %s PatternField behind the content", (tone, surface) => {
      const { container } = render(
        <Section tone={tone} pattern="faint">
          <p>Band</p>
        </Section>
      );
      expect(vi.mocked(PatternField).mock.calls[0]?.[0]).toMatchObject({
        tone: surface,
        density: "faint",
        "aria-hidden": true,
      });
      const band = bandOf(container);
      const [layer, content] = [...band.children];
      expect(band).toHaveClass("relative");
      expect(layer).toHaveClass("pointer-events-none", "absolute", "inset-0", "bg-transparent");
      expect(content).toHaveClass("relative");
      expect(content).toContainElement(screen.getByText("Band"));
    });

    it("keeps the band's own colour under the pattern", () => {
      const { container } = render(
        <Section tone="alt" pattern="default">
          <p>Band</p>
        </Section>
      );
      expect(bandOf(container)).toHaveClass("bg-surface-page-alt");
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Section tone="brand" pattern="default" aria-labelledby="story-title">
        <h2 id="story-title">Our story</h2>
      </Section>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./section"`.

- [ ] **Step 4: Implement**

`packages/ui/src/layouts/section/section.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants } from "../../lib/component-variants";
import { Container, type ContainerSize } from "../container/container";

export type SectionTone = "page" | "alt" | "sunken" | "soft" | "brand" | "ink";

/**
 * The surface each tone establishes. Light tones say `light` explicitly, so a light band nested in
 * a dark one restores dark text (the light island, spec §3.2.3) instead of inheriting white. The
 * same value is the PatternField tone, whose four tones are the surfaces.
 */
const SURFACE = {
  page: "light",
  alt: "light",
  sunken: "light",
  soft: "soft",
  brand: "brand",
  ink: "ink",
} as const satisfies Record<SectionTone, "light" | "soft" | "brand" | "ink">;

const section = componentVariants({
  variants: {
    tone: {
      page: "bg-surface-page",
      alt: "bg-surface-page-alt",
      sunken: "bg-surface-sunken",
      soft: "bg-surface-brand-soft",
      brand: "bg-surface-brand",
      ink: "bg-surface-inverse",
    },
    space: {
      none: "py-0",
      tight: "py-section-tight",
      default: "py-section",
      loose: "py-section-loose",
    },
    // The pattern layer is placed absolutely against the band.
    hasPattern: { true: "relative" },
  },
});

export interface SectionProps extends ComponentProps<"section"> {
  /** page · alt (pink-50) · sunken · soft (pink-100) · brand (flooded pink) · ink. Sets data-surface. */
  tone?: SectionTone;
  /** The diamond tile behind the band. `faint` (4%) is the handoff's ink-section texture. */
  pattern?: "none" | "default" | "faint";
  /** Container size passed through; ignored when `isBare`. */
  size?: ContainerSize;
  /** Vertical rhythm: none · tight clamp(36,4vw,56) · default clamp(48,8vw,96) · loose clamp(72,9vw,128). */
  space?: "none" | "tight" | "default" | "loose";
  /** Skip the Container — the child handles its own width. */
  isBare?: boolean;
  as?: "section" | "div" | "header" | "footer" | "aside";
}

/**
 * One page band. It owns the background colour, the surface its content reads on and the vertical
 * rhythm, and it wraps content in a Container. At most two background colours per page:
 * white/alt plus one flooded brand or ink band.
 */
export function Section({
  as = "section",
  tone = "page",
  pattern = "none",
  size = "content",
  space = "default",
  isBare = false,
  className,
  children,
  ...props
}: SectionProps) {
  const Element: ElementType = as;
  const surface = SURFACE[tone];
  const hasPattern = pattern !== "none";
  const content = isBare ? children : <Container size={size}>{children}</Container>;

  return (
    <Element
      data-surface={surface}
      className={section({ tone, space, hasPattern, className })}
      {...props}
    >
      {hasPattern ? (
        <>
          <PatternField
            aria-hidden
            tone={surface}
            density={pattern}
            className="pointer-events-none absolute inset-0 bg-transparent"
          />
          <div className="relative">{content}</div>
        </>
      ) : (
        content
      )}
    </Element>
  );
}
```

(The layer is transparent, so the band's own tone shows through — which is why `alt` and `sunken` can carry the pattern. The content wrapper is `relative`, so it paints above the absolutely placed layer by DOM order alone; no `z-index` is needed.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories — card parity, rhythm, patterns, nesting, viewports**

The card (`Section.card.html`) shows five tones — page, alt, sunken, brand, ink — each `space="tight"` with an `h4` label. On brand and ink the card passes `tone="inverse"` to Text by hand; here the surface does it (spec D5). The contract adds `soft`.

`packages/ui/src/layouts/section/section.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Text } from "../../atoms/text/text";
import { Stack } from "../stack/stack";
import { Section, type SectionTone } from "./section";

const TONES: { tone: SectionTone; label: string }[] = [
  { tone: "page", label: 'tone="page"' },
  { tone: "alt", label: 'tone="alt" · pink-50' },
  { tone: "sunken", label: 'tone="sunken"' },
  { tone: "soft", label: 'tone="soft" · pink-100' },
  { tone: "brand", label: 'tone="brand"' },
  { tone: "ink", label: 'tone="ink"' },
];

const RHYTHM = [
  { space: "none", tone: "page", label: 'space="none" · 0' },
  { space: "tight", tone: "alt", label: 'space="tight" · clamp(36px, 4vw, 56px)' },
  { space: "default", tone: "page", label: 'space="default" · clamp(48px, 8vw, 96px)' },
  { space: "loose", tone: "alt", label: 'space="loose" · clamp(72px, 9vw, 128px)' },
] as const;

const PATTERNS = [
  { tone: "brand", pattern: "default", label: 'tone="brand" pattern="default"' },
  { tone: "ink", pattern: "faint", label: 'tone="ink" pattern="faint" · the handoff ink band' },
  { tone: "soft", pattern: "default", label: 'tone="soft" pattern="default"' },
  { tone: "alt", pattern: "default", label: 'tone="alt" pattern="default"' },
] as const;

const meta = {
  title: "Layouts/Section",
  component: Section,
  args: {
    tone: "page",
    pattern: "none",
    size: "content",
    space: "default",
    isBare: false,
    children: (
      <Text variant="h4" as="div">
        One page band
      </Text>
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'One page band. Owns the background colour and the vertical rhythm, and sets `data-surface` so text inside follows the band — no `tone="inverse"` needed on brand or ink. Light tones set the light surface explicitly, so a light band nested in a dark one restores dark text. Maximum two background colours per page: white/alt plus one flooded brand or ink band. `pattern` lays the diamond tile behind the band (`faint` on ink, as the handoff pages do). Content sits in a Container (`size`) unless `isBare`. Sections are what RevealObserver reveals.',
      },
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card rows: every tone at `space="tight"`; the label's colour comes from the surface. */
export const Tones: Story = {
  name: "tone (text follows the surface)",
  render: () => (
    <div>
      {TONES.map(({ tone, label }) => (
        <Section key={tone} tone={tone} space="tight">
          <Text variant="h4" as="div">
            {label}
          </Text>
        </Section>
      ))}
    </div>
  ),
};

export const TonesAt360: Story = {
  ...Tones,
  name: "360px — tones at the floor (tight = 36px)",
  globals: { viewport: { value: "floor360", isRotated: false } },
};

export const Rhythm: Story = {
  name: "space (vertical rhythm)",
  render: () => (
    <div>
      {RHYTHM.map(({ space, tone, label }) => (
        <Section key={space} space={space} tone={tone}>
          <Text variant="body" as="div">
            {label}
          </Text>
        </Section>
      ))}
    </div>
  ),
};

export const Patterns: Story = {
  name: "pattern",
  render: () => (
    <div>
      {PATTERNS.map(({ tone, pattern, label }) => (
        <Section key={tone} tone={tone} pattern={pattern}>
          <Text variant="h4" as="div">
            {label}
          </Text>
        </Section>
      ))}
    </div>
  ),
};

/** `size` reaches the inner Container; `isBare` removes it so the child runs full width (dev parity). */
export const Widths: Story = {
  name: "size and isBare",
  render: () => (
    <div>
      <Section size="prose" space="tight">
        <Text as="div">{'size="prose" · 64ch measure'}</Text>
      </Section>
      <Section size="wide" space="tight" tone="alt">
        <Text as="div">{'size="wide" · 1440px'}</Text>
      </Section>
      <Section isBare space="tight">
        <div className="border-y border-dashed border-border-default px-6 py-4">
          <Text as="div" variant="caption" tone="muted">
            isBare · no Container, the child runs the full width
          </Text>
        </div>
      </Section>
    </div>
  ),
};

/** In context: one flooded brand band, then a prose page band — the two-background maximum (dev parity). */
export const InContext: Story = {
  name: "in context — brand band, then prose",
  render: () => (
    <div>
      <Section tone="brand" pattern="default">
        <Stack space={3}>
          <Text variant="overline" as="p">
            Sector 57, Gurgaon
          </Text>
          <Text variant="h1" as="h2">
            Chai first, decisions later.
          </Text>
        </Stack>
      </Section>
      <Section size="prose">
        <Text>
          Pink Paprikaa runs a 100% vegetarian kitchen: North Indian, Chinese, momos and chaat.
        </Text>
      </Section>
    </div>
  ),
};

/**
 * Review Focus 2: a page band inside an ink band is a light island — its text is exactly the
 * top-level page band's colour, and its background is the page surface again, not ink.
 */
export const NestedSurfaces: Story = {
  name: "nested — a light band inside an ink band",
  render: () => (
    <div>
      <Section tone="page" space="tight" data-testid="page">
        <Text data-testid="page-text">A top-level page band</Text>
      </Section>
      <Section tone="ink" space="tight">
        <Stack space={6}>
          <Text data-testid="ink-text">An ink band</Text>
          <Section tone="page" space="tight" data-testid="island">
            <Text data-testid="island-text">A light island inside it</Text>
          </Section>
        </Stack>
      </Section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = (id: string) => getComputedStyle(canvas.getByTestId(id));
    await expect(style("island-text").color).toBe(style("page-text").color);
    await expect(style("ink-text").color).not.toBe(style("page-text").color);
    await expect(style("island").backgroundColor).toBe(style("page").backgroundColor);
  },
};
```

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { Section, type SectionProps } from "./layouts/section/section";
```

- [ ] **Step 8: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/section packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/section.json`, then the gate. Expected: green, including `NestedSurfaces`. Paste the summary lines.

```bash
git add packages/design-tokens/tokens/component/section.json packages/ui/src/layouts/section \
  packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): Section layout

A page band that owns its background, surface and rhythm (the handoff's
fluid section spacing, plus tight and loose). Light tones set the light
surface explicitly, so a band nested in an ink band reads dark again; a
Chromium story compares the computed colours. The pattern is a
transparent PatternField layer, so every tone can carry it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

