### Task 5: SocialHeadline

**Dev reference:** `git show dev:packages/ui/src/atoms/social-headline/social-headline.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                           | Ruling  | Where / reason                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `on` prop (brand/ink/soft/light)                                                                                   | DROP    | D5 — colour follows the artboard's `data-surface`                                                                                                    |
| Body and caption at 88% white on dark grounds                                                                      | DROP    | spec §3.2.2 (`--text-body` is white on brand/ink); `/88` is not a token                                                                              |
| Soft ground ink `pink-800`                                                                                         | ALREADY | the soft surface's `text-heading`                                                                                                                    |
| Default element `p` for every size                                                                                 | DROP    | contracts §0.0 (the plan's code wins shape); plan deviation 4 defaults hero/h1/h2 to `h2`                                                            |
| Measures `narrow` 14ch / `wide` 34ch / `none`; a size-dependent default (34ch for body/caption, none for overline) | DROP    | contracts §2 (`tight`/`default`/`wide`, deviation 4) and `SocialHeadline.d.ts` (one default, 18ch). `className="max-w-none"` still frees an overline |
| `align="end"` pushes the block (`ms-auto`)                                                                         | DROP    | `SocialHeadline.jsx` moves the block only for `center`                                                                                               |
| Arbitrary `leading-[…]`, `tracking-[…]`, `max-w-[…]`                                                               | DROP    | AUTHORING §6; the canvas composites and measure tokens replace them                                                                                  |
| Tests: every size, overline caps and tracking, balance, measures, centring, `as`, axe                              | ALREADY | Step 2 (the tracking lives in `text-canvas-overline`)                                                                                                |
| Test: caller className replaces the size step                                                                      | ADD     | Step 2                                                                                                                                               |
| Stories `Ramp`, `Grounds`                                                                                          | ALREADY | the four size-row stories; `OnSurfaces`                                                                                                              |
| Story `Alignment`                                                                                                  | ADD     | Step 6                                                                                                                                               |
| Story `OnACanvas` (a whole post)                                                                                   | ADD     | Step 6, at true pixels on a brand field                                                                                                              |
| Half-scale `Artboard` wrapper                                                                                      | DROP    | Task 15 accepted difference: true canvas pixels here; PostFrame (Plan 2c) scales artboards                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/SocialHeadline.{jsx,d.ts,card.html,prompt.md}`, readme §4b. Canvas type: hero 132 / 0.96 / −0.035em, h1 96 / 1.0 / −0.03em, h2 72 / 1.05 / −0.025em (all Poppins 800), body 34 / 1.45 and caption 26 / 1.4 (DM Sans 500), overline 24 / 1.2 / +0.14em (Poppins 700, capitals). Always `text-wrap: balance`, capped by a measure. The `on` prop is removed (D5): colour follows the artboard's surface.

**Files:**

- Modify: `packages/design-tokens/tokens/primitive/typography.json` (the six `canvas-*` composites)
- Create: `packages/design-tokens/tokens/component/social-headline.json`
- Create: `packages/ui/src/atoms/social-headline/social-headline.tsx`, `social-headline.test.tsx`, `social-headline.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged (semantic heading/body tokens on every surface).

**Interfaces:**

- Consumes: `componentVariants`; `text-canvas-*`, `text-text-{heading,body}`.
- Produces: `SocialHeadline`, `interface SocialHeadlineProps extends ComponentProps<"h2">` (contracts §2); tokens `spacing-social-headline-{tight,default,wide}`; the canvas composites gain line height, tracking and weight.

- [ ] **Step 1: Tokens**

The canvas scale **is** SocialHeadline's scale (readme §4b), so the line heights, tracking and weights belong on the canvas composites themselves, not in a parallel set. In `tokens/primitive/typography.json`, replace the six `canvas-*` entries with:

```json
"canvas-hero": {
  "$value": {
    "fontSize": "132px",
    "lineHeight": 0.96,
    "letterSpacing": "-0.035em",
    "fontWeight": "{font-weight.black}"
  },
  "$description": "Marketing canvas type (1080px artboards) — never on screens. Set through SocialHeadline."
},
"canvas-h1": {
  "$value": { "fontSize": "96px", "lineHeight": 1, "letterSpacing": "-0.03em", "fontWeight": "{font-weight.black}" }
},
"canvas-h2": {
  "$value": { "fontSize": "72px", "lineHeight": 1.05, "letterSpacing": "-0.025em", "fontWeight": "{font-weight.black}" }
},
"canvas-body": {
  "$value": { "fontSize": "34px", "lineHeight": 1.45, "fontWeight": "{font-weight.medium}" }
},
"canvas-caption": {
  "$value": { "fontSize": "26px", "lineHeight": 1.4, "fontWeight": "{font-weight.medium}" }
},
"canvas-overline": {
  "$value": { "fontSize": "24px", "lineHeight": 1.2, "letterSpacing": "0.14em", "fontWeight": "{font-weight.bold}" }
}
```

`packages/design-tokens/tokens/component/social-headline.json` (the medians of every `max` the marketing kits pass: headlines 10–16ch, body 26–34ch):

```json
{
  "spacing": {
    "$type": "dimension",
    "social-headline-tight": {
      "$value": "12ch",
      "$description": "measure=\"tight\" — hero statements, 2–3 balanced lines."
    },
    "social-headline-default": {
      "$value": "18ch",
      "$description": "measure=\"default\" — the design system's default cap."
    },
    "social-headline-wide": {
      "$value": "30ch",
      "$description": "measure=\"wide\" — body and caption copy on a canvas."
    }
  }
}
```

In `component-variants.ts`, append to `SPACING`: `"social-headline-tight", "social-headline-default", "social-headline-wide",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "text-canvas-hero" packages/design-tokens/dist/theme.css`
Expected: four lines: `--text-canvas-hero: 132px;`, `--line-height: 0.96`, `--letter-spacing: -0.035em`, `--font-weight: 800`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/social-headline/social-headline.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SocialHeadline } from "./social-headline";

describe("SocialHeadline", () => {
  it("sets a canvas h1 as a balanced h2 on the display face by default", () => {
    render(<SocialHeadline>Masala Cold Brew</SocialHeadline>);
    const headline = screen.getByRole("heading", { level: 2, name: "Masala Cold Brew" });
    expect(headline).toHaveClass(
      "m-0",
      "font-display",
      "text-canvas-h1",
      "text-balance",
      "text-text-heading",
      "max-w-social-headline-default"
    );
  });

  it.each([
    ["hero", "text-canvas-hero", "H2", "font-display"],
    ["h1", "text-canvas-h1", "H2", "font-display"],
    ["h2", "text-canvas-h2", "H2", "font-display"],
    ["body", "text-canvas-body", "P", "font-body"],
    ["caption", "text-canvas-caption", "P", "font-body"],
    ["overline", "text-canvas-overline", "P", "font-display"],
  ] as const)("size %s uses %s on a <%s> in %s", (size, sizeClass, tag, face) => {
    render(<SocialHeadline size={size}>Chai first</SocialHeadline>);
    const text = screen.getByText("Chai first");
    expect(text.tagName).toBe(tag);
    expect(text).toHaveClass(sizeClass, face);
  });

  it.each([
    ["body", "text-text-body"],
    ["caption", "text-text-body"],
    ["hero", "text-text-heading"],
    ["overline", "text-text-heading"],
  ] as const)("paints %s in the surface's %s token — never its own colour", (size, colour) => {
    render(<SocialHeadline size={size}>Cold brew, jaggery, cardamom.</SocialHeadline>);
    const text = screen.getByText("Cold brew, jaggery, cardamom.");
    expect(text).toHaveClass(colour);
    expect(text.className.match(/(^|\s)text-text-/g)).toHaveLength(1);
  });

  it("sets the overline in capitals", () => {
    render(<SocialHeadline size="overline">Tonight Only</SocialHeadline>);
    expect(screen.getByText("Tonight Only")).toHaveClass("uppercase");
  });

  it.each([
    ["tight", "max-w-social-headline-tight"],
    ["default", "max-w-social-headline-default"],
    ["wide", "max-w-social-headline-wide"],
  ] as const)("caps the %s measure with %s", (measure, measureClass) => {
    render(<SocialHeadline measure={measure}>One kitchen. One grinder.</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass(measureClass);
  });

  it("centres the block as well as its lines", () => {
    render(<SocialHeadline align="center">Chai first</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass("text-center", "mx-auto");
  });

  it("aligns to the end without moving the block", () => {
    render(<SocialHeadline align="end">Chai first</SocialHeadline>);
    const headline = screen.getByRole("heading");
    expect(headline).toHaveClass("text-end");
    expect(headline).not.toHaveClass("mx-auto");
  });

  it("lets `as` make it the artboard's one h1", () => {
    render(
      <SocialHeadline size="hero" as="h1">
        Chai first, decisions later.
      </SocialHeadline>
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-canvas-hero");
  });

  it("merges a consumer className", () => {
    render(<SocialHeadline className="mt-8">Chai first</SocialHeadline>);
    expect(screen.getByRole("heading")).toHaveClass("mt-8", "m-0");
  });

  it("lets a consumer className replace the size step", () => {
    render(<SocialHeadline className="text-canvas-h2">Masala Cold Brew</SocialHeadline>);
    const headline = screen.getByRole("heading");
    expect(headline).toHaveClass("text-canvas-h2");
    expect(headline).not.toHaveClass("text-canvas-h1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <SocialHeadline size="overline">Tonight Only</SocialHeadline>
        <SocialHeadline size="hero">Chai first, decisions later.</SocialHeadline>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./social-headline"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/social-headline/social-headline.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";

export interface SocialHeadlineProps extends ComponentProps<"h2"> {
  /** Canvas px: hero 132 · h1 96 · h2 72 · body 34 · caption 26 · overline 24. */
  size?: "hero" | "h1" | "h2" | "body" | "caption" | "overline";
  align?: "start" | "center" | "end";
  /** Line-length cap: tight 12ch · default 18ch (2–3 balanced lines) · wide 30ch (body copy). */
  measure?: "tight" | "default" | "wide";
  /** Element. Default: `h2` for hero, h1 and h2; `p` for body, caption and overline. */
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

type Size = NonNullable<SocialHeadlineProps["size"]>;

const DEFAULT_ELEMENT: Readonly<Record<Size, "h2" | "p">> = {
  hero: "h2",
  h1: "h2",
  h2: "h2",
  body: "p",
  caption: "p",
  overline: "p",
};

const socialHeadline = componentVariants({
  base: "m-0 text-balance text-text-heading",
  variants: {
    size: {
      hero: "font-display text-canvas-hero",
      h1: "font-display text-canvas-h1",
      h2: "font-display text-canvas-h2",
      body: "font-body text-canvas-body text-text-body",
      caption: "font-body text-canvas-caption text-text-body",
      overline: "font-display text-canvas-overline uppercase",
    },
    align: { start: "text-start", center: "mx-auto text-center", end: "text-end" },
    measure: {
      tight: "max-w-social-headline-tight",
      default: "max-w-social-headline-default",
      wide: "max-w-social-headline-wide",
    },
  },
  defaultVariants: { size: "h1", align: "start", measure: "default" },
});

/** Canvas-scale type for marketing artboards. Balanced wrapping, never clipped. */
export function SocialHeadline({
  size = "h1",
  align,
  measure,
  as,
  className,
  ...props
}: SocialHeadlineProps) {
  const Component: ElementType = as ?? DEFAULT_ELEMENT[size];
  return <Component className={socialHeadline({ size, align, measure, className })} {...props} />;
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`SocialHeadline.card.html`, shown there at 40% scale): `overline`, `hero`, `h1 / h2`, `body / caption`. These stories show true canvas pixels (PostFrame in Plan 2c does the scaling), so view them in the `xl — 1280` viewport. Extras: `OnSurfaces`, `Alignment` and `OnACanvas` (dev parity).

`packages/ui/src/atoms/social-headline/social-headline.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { SocialHeadline } from "./social-headline";

const meta = {
  title: "Atoms/SocialHeadline",
  component: SocialHeadline,
  args: { children: "Chai first, decisions later.", size: "hero", measure: "default" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Type for marketing canvases — sized in canvas pixels, wrapped with `text-wrap: balance`. Never use screen `text-*` sizes on a 1080 canvas — they render as fine print. Keep headlines ≤ 6 words so `balance` can do its job. Colour follows the artboard's surface (PatternField and PostFrame set it); `measure` caps the line: tight 12ch · default 18ch · wide 30ch.",
      },
    },
  },
} satisfies Meta<typeof SocialHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Overline: Story = {
  name: 'size="overline"',
  args: { size: "overline", className: "text-text-brand", children: "Tonight Only" },
};

export const Hero: Story = {
  name: 'size="hero"',
  args: { size: "hero", children: "Chai first, decisions later." },
};

export const H1H2: Story = {
  name: 'size="h1" · "h2"',
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="h1">Masala Cold Brew</SocialHeadline>
      <SocialHeadline size="h2" as="h3">
        One kitchen. One grinder.
      </SocialHeadline>
    </div>
  ),
};

export const BodyCaption: Story = {
  name: 'size="body" · "caption"',
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="body" measure="wide">
        Cold brew, jaggery, cardamom.
      </SocialHeadline>
      <SocialHeadline size="caption" measure="wide">
        Sector 57, Gurgaon · 8am – 11:30pm
      </SocialHeadline>
    </div>
  ),
};

export const Alignment: Story = {
  name: "align",
  render: () => (
    <div className="grid gap-4">
      <SocialHeadline size="h2" align="start">
        Start
      </SocialHeadline>
      <SocialHeadline size="h2" align="center">
        Center
      </SocialHeadline>
      <SocialHeadline size="h2" align="end">
        End
      </SocialHeadline>
    </div>
  ),
};

/** A whole post as the ramp is really used, at true canvas pixels (72px canvas padding). */
export const OnACanvas: Story = {
  name: "on a canvas (a whole post)",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div data-surface="brand" className="grid gap-8 bg-surface-brand p-18">
      <SocialHeadline size="overline">Tonight Only</SocialHeadline>
      <SocialHeadline size="hero" measure="tight">
        Chai first, decisions later.
      </SocialHeadline>
      <SocialHeadline size="body" measure="wide">
        Kadak chai and hot momos · ₹180–₹320
      </SocialHeadline>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <SocialHeadline size="overline">Tonight Only</SocialHeadline>
      <SocialHeadline size="body">Cold brew, jaggery, cardamom.</SocialHeadline>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { SocialHeadline, type SocialHeadlineProps } from "./atoms/social-headline/social-headline";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/social-headline packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the SocialHeadline atom on the completed canvas type scale

The canvas composites now carry the line height, tracking and weight the
design system sets for marketing type, so one class sets a canvas step. The
on prop is gone: colour follows the artboard's surface. Three measures cap
the balanced lines.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

