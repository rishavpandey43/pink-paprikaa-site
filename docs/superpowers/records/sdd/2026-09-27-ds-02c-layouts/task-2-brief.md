### Task 2: Container

**Files:**

- Create: `packages/ui/src/layouts/container/{container.tsx,container.test.tsx,container.stories.tsx}`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/container/container.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                        | Ruling  | Where / clause                                                                                                                 |
| ------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Sizes `default`/`wide`/`prose`/`full`                                           | ALREADY | `content`/`wide`/`prose`/`full` + `narrow`/`article` (spec §9.4)                                                               |
| `isFullBleed` drops the gutter                                                  | ALREADY | `isBleed` (spec §8.2)                                                                                                          |
| Gutter `clamp(20px, 4vw, 40px)`, `--layout-*` / `--measure-prose` names         | DROP    | C8 (handoff 16px gutter); D4 (old token names)                                                                                 |
| `defaultVariants`                                                               | DROP    | Plan tier rule: defaults live in the destructured props                                                                        |
| `as` any element; test "renders the element the caller asks for" with `as="ul"` | PENDING | Contracts §4 union has no `ul`/`ol` — proposed contract delta 1 in `02c-audit.md`. Implement only if the controller accepts it |
| Native attributes forwarded (`id`)                                              | ALREADY | Step 1 "passes native props through"                                                                                           |
| Test: emits no colour, border or type classes                                   | ADD     | Step 1 "paints nothing"                                                                                                        |
| Test: caller className replaces the width cap as well as the gutter             | ADD     | Step 1 className test (`max-w-none`)                                                                                           |
| Test: axe                                                                       | ALREADY | Step 1                                                                                                                         |
| Stories `Default`, `Sizes`, `Bleed`                                             | ALREADY | `Playground`, `Sizes` (all `isBleed`), `Gutter`                                                                                |
| Story `InContext` (prose article on alt)                                        | ADD     | Step 5 `InContext`                                                                                                             |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `--container-{content,wide,narrow,article,prose}` → `max-w-*`, and `--spacing-gutter` → `px-gutter` (Plan 1).
- Produces: `Container`, `type ContainerProps`, and `type ContainerSize = "content" | "wide" | "narrow" | "article" | "prose" | "full"` (used by Section).

No component tokens: every value is a Plan 1 layout token.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/layouts/container/container.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Container, type ContainerSize } from "./container";

interface CatalogueEntry {
  name: string;
  value: unknown;
  surface: string | null;
}

const catalogue = JSON.parse(
  readFileSync(new URL("../../../../design-tokens/dist/tokens.json", import.meta.url), "utf8")
) as CatalogueEntry[];

function tokenValue(name: string): string {
  const value = catalogue.find((entry) => entry.surface === null && entry.name === name)?.value;
  if (typeof value !== "string") throw new Error(`no string token named ${name}`);
  return value;
}

/** A `clamp(<min>px, <n>vw, <max>px)` length at a viewport width, computed as the browser does. */
function clampAt(length: string, viewport: number): number {
  const groups = /^clamp\((?<min>\d+)px, (?<fluid>[\d.]+)vw, (?<max>\d+)px\)$/.exec(length)?.groups;
  if (groups?.min === undefined || groups.fluid === undefined || groups.max === undefined) {
    throw new Error(`not a clamp(px, vw, px) length: ${length}`);
  }
  const fluid = (Number(groups.fluid) / 100) * viewport;
  return Math.min(Math.max(Number(groups.min), fluid), Number(groups.max));
}

const SIZES: [ContainerSize, string][] = [
  ["content", "max-w-content"],
  ["wide", "max-w-wide"],
  ["narrow", "max-w-narrow"],
  ["article", "max-w-article"],
  ["prose", "max-w-text-measure-prose"],
  ["full", "max-w-none"],
];

describe("Container", () => {
  it("is a centred, full-width div capped at the content width, with the fluid gutter", () => {
    render(<Container>Our story</Container>);
    const frame = screen.getByText("Our story");
    expect(frame.tagName).toBe("DIV");
    expect(frame).toHaveClass("mx-auto", "w-full", "max-w-content", "px-gutter");
  });

  it.each(SIZES)("caps size=%s with %s and keeps the gutter", (size, cap) => {
    render(<Container size={size}>Frame</Container>);
    expect(screen.getByText("Frame")).toHaveClass(cap, "px-gutter");
  });

  it("drops the gutter only when isBleed is set", () => {
    render(<Container isBleed>Edge to edge</Container>);
    const frame = screen.getByText("Edge to edge");
    expect(frame).toHaveClass("px-0");
    expect(frame).not.toHaveClass("px-gutter");
  });

  it("renders the element named by as", () => {
    render(<Container as="main">Menu</Container>);
    expect(screen.getByRole("main")).toHaveTextContent("Menu");
  });

  it("lets a consumer className replace a conflicting class and passes native props through", () => {
    render(
      <Container className="max-w-none px-4" id="story">
        Frame
      </Container>
    );
    const frame = screen.getByText("Frame");
    expect(frame).toHaveClass("px-4", "max-w-none");
    expect(frame).not.toHaveClass("px-gutter");
    expect(frame).not.toHaveClass("max-w-content");
    expect(frame).toHaveAttribute("id", "story");
  });

  // A layout carries width and spacing only; the band around it owns colour (dev parity).
  it.each(SIZES)("paints nothing at size=%s — no colour, border, shadow or type class", (size) => {
    render(<Container size={size}>Frame</Container>);
    const classes = screen.getByText("Frame").className.split(/\s+/);
    expect(classes.filter((name) => /^(bg|border|shadow|text|font)-/.test(name))).toEqual([]);
  });

  // Review Focus 4, pure half — the rendered half is the AtTheFloor story.
  it("resolves the gutter to 16px at the 360px floor and 40px on desktop", () => {
    const gutter = tokenValue("spacing-gutter");
    expect(clampAt(gutter, 360)).toBe(16);
    expect(clampAt(gutter, 1280)).toBe(40);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Container as="main">
        <h1>Our story</h1>
      </Container>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./container"`.

- [ ] **Step 3: Implement**

`packages/ui/src/layouts/container/container.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";

export type ContainerSize = "content" | "wide" | "narrow" | "article" | "prose" | "full";

const container = componentVariants({
  base: "mx-auto w-full px-gutter",
  variants: {
    size: {
      content: "max-w-content",
      wide: "max-w-wide",
      narrow: "max-w-narrow",
      article: "max-w-article",
      prose: "max-w-text-measure-prose",
      full: "max-w-none",
    },
    isBleed: { true: "px-0" },
  },
});

export interface ContainerProps extends ComponentProps<"div"> {
  /** content 1200 · wide 1440 · narrow 960 · article 760 · prose 64ch · full (no cap). */
  size?: ContainerSize;
  /** Drop the gutters, for a child that must run edge to edge. */
  isBleed?: boolean;
  as?: "div" | "main" | "section" | "article" | "header" | "footer" | "nav";
}

/**
 * The only correct way to constrain page width: a centred width cap with the fluid gutter
 * clamp(16px, 4vw, 40px) — the handoff value (spec C8), so 360px screens keep 16px each side.
 */
export function Container({
  as = "div",
  size = "content",
  isBleed = false,
  className,
  ...props
}: ContainerProps) {
  const Element: ElementType = as;
  return <Element className={container({ size, isBleed, className })} {...props} />;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 5: Stories — card parity, gutter, and the 360/1280 viewports**

The card (`Container.card.html`) has three rows — `size="default"` (now `content`), `prose` and `wide` — each `bleed`, with a dashed pink box. The stories cover every contract size, and add the gutter and the two viewport stories.

`packages/ui/src/layouts/container/container.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Container, type ContainerSize } from "./container";

/** The card's demo box: a dashed pink block showing where the frame's content box sits. */
function Box({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-pink-300 bg-pink-100 p-3 font-body text-caption text-pink-800">
      {children}
    </div>
  );
}

const SIZES: { size: ContainerSize; note: string }[] = [
  { size: "content", note: "1200px (design system size=default)" },
  { size: "prose", note: "64ch — long-form copy" },
  { size: "wide", note: "1440px" },
  { size: "narrow", note: "960px (handoff)" },
  { size: "article", note: "760px (handoff)" },
  { size: "full", note: "no cap" },
];

const meta = {
  title: "Layouts/Container",
  component: Container,
  args: {
    size: "content",
    isBleed: false,
    children: <Box>max-width 1200 · gutter clamp(16px, 4vw, 40px)</Box>,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The only correct way to constrain page width. `content` caps at 1200px with the fluid gutter clamp(16px, 4vw, 40px) — the handoff value (spec C8). Use `size="prose"` for long-form copy so the measure stays readable; `narrow` (960) and `article` (760) come from the handoff; `full` removes the cap. `isBleed` drops the gutters for a child that must run edge to edge.',
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card rows: each size with `isBleed`, so the box shows the cap itself. */
export const Sizes: Story = {
  name: "size (isBleed, as on the card)",
  render: () => (
    <div className="grid gap-4 py-6">
      {SIZES.map(({ size, note }) => (
        <Container key={size} size={size} isBleed>
          <Box>{`size="${size}" · ${note}`}</Box>
        </Container>
      ))}
    </div>
  ),
};

/** The gutter at work: the dashed box sits one fluid gutter in from each edge of the tinted band. */
export const Gutter: Story = {
  name: "gutter (default)",
  render: () => (
    <div className="bg-surface-page-alt py-6">
      <Container>
        <Box>gutter clamp(16px, 4vw, 40px) either side</Box>
      </Container>
    </div>
  ),
};

/** Review Focus 4: at the 360px floor the gutter is exactly 16px and nothing scrolls sideways. */
export const AtTheFloor: Story = {
  name: "360px — 16px gutter",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Container data-testid="frame">
      <Box>Every design survives 360px.</Box>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByTestId("frame"));
    await expect(style.paddingLeft).toBe("16px");
    await expect(style.paddingRight).toBe("16px");
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** At 1280px the gutter has grown to its 40px ceiling (4vw would be 51.2px). */
export const AtDesktop: Story = {
  name: "1280px — 40px gutter",
  globals: { viewport: { value: "xl", isRotated: false } },
  render: () => (
    <Container data-testid="frame">
      <Box>max-width 1200 · gutter 40px</Box>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const style = getComputedStyle(within(canvasElement).getByTestId("frame"));
    await expect(style.paddingLeft).toBe("40px");
    await expect(style.paddingRight).toBe("40px");
  },
};

/** In context: a prose Container keeps an About page readable at desktop width (dev parity). */
export const InContext: Story = {
  name: 'in context — size="prose" as="article"',
  render: () => (
    <div className="bg-surface-page-alt py-12">
      <Container as="article" size="prose">
        <h2 className="font-display text-h2 text-text-heading">A kitchen in Sector 57</h2>
        <p className="mt-4 font-body text-body text-text-body">
          Pink Paprikaa cooks North Indian, Chinese, momos and chaat in one 100% vegetarian kitchen.
        </p>
      </Container>
    </div>
  ),
};
```

- [ ] **Step 6: Export**

Add to `packages/ui/src/index.ts` (layouts after atoms/molecules/organisms, before `./lib/…`):

```ts
export { Container, type ContainerProps, type ContainerSize } from "./layouts/container/container";
```

- [ ] **Step 7: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/container packages/ui/src/index.ts`, then the gate. Expected: green, including the `AtTheFloor` and `AtDesktop` plays. Paste the summary lines.

```bash
git add packages/ui/src/layouts/container packages/ui/src/index.ts
git commit -m "feat(ui): Container layout

A centred width cap (content, wide, narrow, article, prose, full) with
the handoff's fluid gutter. The 360px floor is pinned twice: the gutter
token's clamp is evaluated in jsdom, and a Chromium story reads the
computed 16px padding.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

