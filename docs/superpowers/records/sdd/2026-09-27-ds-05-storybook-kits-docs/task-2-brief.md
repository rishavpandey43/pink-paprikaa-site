### Task 2: Storybook plumbing and the docs-kit

**Files:**

- Create: `apps/storybook/src/docs-kit/{token-files.d.ts,catalogue.ts,dom.ts,specimen.tsx,swatch.tsx,token-table.tsx,type-specimen.tsx,contrast-matrix.tsx,spacing-scale.tsx,radius-scale.tsx,shadow-ladder.tsx,motion-demo.tsx,docs-kit.stories.tsx}`, `apps/storybook/src/kits/fixtures.ts` (seed; replaced in Task 10)
- Modify: `apps/storybook/package.json` (deps, `serve` dependsOn), `apps/storybook/.storybook/preview.tsx` (nested sort order)

**Dev reference:** `git show dev:apps/storybook/{.storybook/main.ts,.storybook/preview.tsx,.storybook/styles.css,package.json,vite.config.mts,vitest.config.mts}`; the docs helpers in `git show dev:packages/ui/src/docs/{colour,typography,space-shape-motion}.mdx` (`Swatch`, `Grid`, `Row`, `Space`, `Radius`, `Shadow`, the duration/easing tracks)

**Dev parity:**

| Dev item                                                                                      | Ruling  | Where / spec clause                                                                                       |
| --------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `remark-gfm` in addon-docs `mdxCompileOptions` (tables otherwise render as raw pipes)         | ALREADY | Plan 1 `main.ts`; Task 15 Step 7 now fails a docs page that shows a raw table (ADD there)                 |
| addon-a11y, addon-vitest (browser mode), `@chromatic-com/storybook` + `chromatic` target      | ALREADY | Plan 1 `main.ts` / `package.json` / `vitest.config.mts`, unchanged here                                   |
| react-docgen-typescript `include` + `tsconfigPath` + node_modules `propFilter`                | ALREADY | Plan 1 `main.ts`; Task 15 Step 7 now fails an empty component props table (ADD there)                     |
| Viewports: `floor360` + the five breakpoints + `INITIAL_VIEWPORTS`                            | ALREADY | Plan 1 `preview.tsx` (A16); kits test at `floor360`                                                       |
| Backgrounds as token references (page, tint, brand, inverse)                                  | ALREADY | Plan 1 `preview.tsx`, plus `soft` (spec §10.2 grounds)                                                    |
| `a11y.test = "error"`, `color-contrast` off                                                   | ALREADY | Plan 1 `preview.tsx`, with the §5.4 reason                                                                |
| storySort `Foundations → Atoms → Molecules → Organisms → Templates`                           | DROP    | D13 / spec §10.1: the 13 design-system groups (Step 2); D14 `templates` → `layouts`                       |
| Decorator `font-body text-body1 leading-body1`                                                | ALREADY | Plan 1 decorator `font-body text-body` (D4 names)                                                         |
| Google Fonts `@import` in `styles.css`                                                        | DROP    | D11: fonts self-hosted through `@fontsource/*` (`.storybook/fonts.ts`)                                    |
| `@source` over `packages/ui/src/**/*.{ts,tsx,mdx}`                                            | ALREADY | Spec §6.5: the library scans itself; Storybook adds only its `src/` and the library's stories             |
| `Swatch` reads the value off the live custom property (no second source of truth)             | ALREADY | `catalogue.ts` reads `tokens.json` and throws on a missing name — stronger (Review Focus 1)               |
| `Swatch`: click the name or the value to copy it, with "copied" feedback                      | ADD     | Step 7 `swatch.tsx` (copy buttons + `role="status"`); Step 4 `SwatchCopiesNameAndValue`                   |
| `Swatch` per-swatch usage note                                                                | ALREADY | The token's `description`, printed under the value                                                        |
| `Grid` auto-fit swatch grid                                                                   | ALREADY | `Swatches` (responsive grid)                                                                              |
| `Space` / `Radius` / `Shadow` / type `Row` specimens                                          | ALREADY | `SpacingScale`, `RadiusScale`, `ShadowLadder`, `TypeSpecimen`                                             |
| Duration track per step (hover)                                                               | ALREADY | `MotionDemo`, toggled by a button (keyboard-operable); its label now names the duration too (ADD, Step 7) |
| Old class names in the helpers (`rounded-3`, `text-body2`, `bg-brand-primary`, `max-w-(--…)`) | DROP    | D4 names; spec §11.2 `no-arbitrary-value` / R23 `no-arbitrary-shorthand`                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: Task 1 exports; `Button`, `Badge`, `Table*` from `@pink-paprikaa-web/ui`; `brand` from `@pink-paprikaa-web/content`.
- Produces (docs-kit, used by Tasks 3–9 and the kits): `token(name, surface?)`, `tokensWithPrefix(prefix, tier?)`, `surfaceOverrides(surface)`, `selectTokens(selection)`, `formatValue(value)`, `cssValue(name)`, `typographyOf(name)`, `rgbOf(name)`, `CATALOGUE`, types `TokenEntry`, `TokenSelection`, `Surface`, `Tier`; `requireElement(root, selector)`; components `Swatch`, `Swatches`, `TokenTable`, `TypeSpecimen`, `ContrastMatrix` (+ `contrastResults(groups?)`, `VERDICT_LABEL`), `SpacingScale`, `RadiusScale`, `ShadowLadder`, `MotionDemo`, `SpecimenRow`, `SpecimenTile`. Fixtures seed: `OUTLET`, `ORDER_STEPS`, `BUILD_YEAR`.

**Where the docs-kit tests run (decided):** as hidden stories with `play` functions in `docs-kit.stories.tsx`, run by the existing `storybook:test`. Not a jsdom config: the helpers exist to paint live CSS variables, and only a real browser with the real stylesheet can assert a swatch's computed colour or a bar's computed width. `@storybook/addon-vitest` overrides `test.include` with the stories globs, so a second unit suite would need a second Vitest project for no gain.

- [ ] **Step 1: Dependencies and targets**

```bash
pnpm add @pink-paprikaa-web/utils --workspace --filter @pink-paprikaa-web/storybook
pnpm add -D lucide-react --filter @pink-paprikaa-web/storybook
pnpm why lucide-react -r 2>&1 | grep -E "^lucide-react|lucide-react [0-9]" | sort -u
pnpm nx sync
```

If `pnpm why` shows two different `lucide-react` versions, run `pnpm update -r --latest lucide-react` so the workspace shares one (no hand-written version), and rerun `pnpm why`.

In `apps/storybook/package.json` → `nx.targets.serve`, add `"dependsOn": ["^build"]` (foundation pages read `design-tokens/dist`; the inferred `storybook`, `build-storybook` and `test` targets already depend on `^build`, the declared `serve` did not).

- [ ] **Step 2: Sidebar order inside each group**

In `apps/storybook/.storybook/preview.tsx`, replace the `options.storySort.order` array from Plan 1 Task 8 with:

```tsx
        order: [
          "Introduction",
          "Brand",
          ["Logo", "Pattern", "Company details", "Voice & content", "Iconography"],
          "Colors",
          ["Primary", "Ink", "Accents", "Heat", "Semantic", "Surfaces", "Status", "Contrast"],
          "Type",
          ["Display", "Headings", "Body", "Overline & mono", "Devanagari", "Fluid"],
          "Spacing",
          ["Scale", "Layout rhythm"],
          "Layout",
          ["Breakpoints", "AutoGrid", "Radii", "Borders", "Elevation", "Card anatomy", "Utility classes"],
          "Motion",
          ["Motion", "States", "Form states", "Section reveal"],
          "Marketing",
          ["Canvas formats", "Canvas type", "Kit", ["Feed", "Ads"]],
          "Atoms",
          "Molecules",
          "Organisms",
          "Layouts",
          "Website",
          "App",
        ],
```

(The page order is the design system's card order; atom/molecule/organism/layout stories stay alphabetical.)

- [ ] **Step 3: Type the two JSON files without parsing them**

Create `apps/storybook/src/docs-kit/token-files.d.ts`:

```ts
/**
 * Types for the JSON files the docs read from @pink-paprikaa-web/design-tokens. Vite loads them at
 * runtime; TypeScript never parses them (this project leaves `resolveJsonModule` off), so these
 * declarations are what it sees. Typecheck therefore never depends on `dist/` having been built,
 * and each file has one explicit shape owned by the package that writes it.
 */
declare module "@pink-paprikaa-web/design-tokens/tokens.json" {
  import type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

  const catalogue: readonly TokenEntry[];
  export default catalogue;
}

declare module "@pink-paprikaa-web/design-tokens/contrast-pairs.json" {
  import type { ContrastPolicy } from "@pink-paprikaa-web/design-tokens/contrast";

  const policy: ContrastPolicy;
  export default policy;
}
```

(If `tsc` still reports TS2732 for these imports, the ambient path is not being honoured: stop and report the exact error — do not enable `resolveJsonModule`, which would pull `dist/` into this composite project.)

- [ ] **Step 4: Write the failing docs-kit contract stories**

Create `apps/storybook/src/docs-kit/docs-kit.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, spyOn, within } from "storybook/test";

import { cssValue, formatValue, rgbOf, token, tokensWithPrefix, typographyOf } from "./catalogue";
import { ContrastMatrix, VERDICT_LABEL } from "./contrast-matrix";
import { requireElement } from "./dom";
import { MotionDemo } from "./motion-demo";
import { RadiusScale } from "./radius-scale";
import { ShadowLadder } from "./shadow-ladder";
import { SpacingScale } from "./spacing-scale";
import { Swatch } from "./swatch";
import { TokenTable } from "./token-table";
import { TypeSpecimen } from "./type-specimen";

/** Contract tests for the docs-only helpers. Hidden from the sidebar; run by storybook:test. */
const meta = {
  title: "Introduction/Docs kit",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const MissingTokenFailsLoudly: Story = {
  render: () => <span className="font-mono text-mono">Token lookups throw on unknown names.</span>,
  play: async () => {
    await expect(() => token("color-does-not-exist")).toThrow(/no token "color-does-not-exist"/);
    await expect(() => tokensWithPrefix("color-nope-")).toThrow(
      /no base token starts with "color-nope-"/
    );
    await expect(() => typographyOf("color-pink-500")).toThrow(/not a typography token/);
  },
};

export const NumericStepsSortByNumber: Story = {
  render: () => <span className="font-mono text-mono">Numeric steps list in numeric order.</span>,
  play: async () => {
    const ink = tokensWithPrefix("color-ink-", "primitive")
      .filter((entry) => entry.path.length === 3 && entry.path[1] === "ink")
      .map((entry) => entry.name);
    await expect(ink.at(0)).toBe("color-ink-000");
    await expect(ink.at(-1)).toBe("color-ink-900");
    const pink = tokensWithPrefix("color-pink-", "primitive").map((entry) => entry.name);
    await expect(pink.indexOf("color-pink-50")).toBeLessThan(pink.indexOf("color-pink-100"));
  },
};

export const SwatchPaintsItsToken: Story = {
  render: () => (
    <div className="grid max-w-150 grid-cols-2 gap-4">
      <Swatch name="color-pink-500" />
      <Swatch name="color-text-body" />
    </div>
  ),
  play: async ({ canvas }) => {
    const chip = canvas.getByRole("img", { name: token("color-pink-500").cssVar });
    await expect(getComputedStyle(chip).backgroundColor).toBe(rgbOf("color-pink-500"));
    await expect(
      canvas.getByText(`→ ${token("color-text-body").reference ?? "no reference"}`)
    ).toBeVisible();
  },
};

export const SwatchCopiesNameAndValue: Story = {
  render: () => <Swatch name="color-pink-500" />,
  play: async ({ canvas, userEvent }) => {
    // The play's userEvent (user-event setup()) stubs navigator.clipboard; the spy observes the write.
    const write = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const entry = token("color-pink-500");
    const value = formatValue(entry.value);
    await userEvent.click(canvas.getByRole("button", { name: entry.cssVar }));
    await expect(write).toHaveBeenLastCalledWith(entry.cssVar);
    await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${entry.cssVar}`);
    await userEvent.click(canvas.getByRole("button", { name: value }));
    await expect(write).toHaveBeenLastCalledWith(value);
    await expect(canvas.getByRole("status")).toHaveTextContent(`Copied ${value}`);
    write.mockRestore();
  },
};

export const TokenTableListsEveryMatch: Story = {
  render: () => <TokenTable caption="Durations" selection={{ prefix: "duration-" }} />,
  play: async ({ canvas }) => {
    const table = canvas.getByRole("table", { name: "Durations" });
    await expect(within(table).getAllByRole("row")).toHaveLength(
      tokensWithPrefix("duration-").length + 1
    );
    await expect(within(table).getByText(token("duration-fast").cssVar)).toBeVisible();
  },
};

export const TypeSpecimenUsesTheStep: Story = {
  render: () => (
    <TypeSpecimen step="h1" family="display">
      Our Menu
    </TypeSpecimen>
  ),
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByText("Our Menu")).fontSize).toBe(
      typographyOf("text-h1").fontSize
    );
    const h1 = token("text-h1");
    await expect(
      canvas.getByText(`${h1.cssVar} · ${formatValue(h1.value)} · ${token("font-display").cssVar}`)
    ).toBeVisible();
  },
};

export const ContrastMatrixRatesEachPair: Story = {
  render: () => <ContrastMatrix groups={["on-brand-fill", "on-inverse"]} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByText(VERDICT_LABEL.exception)).toBeVisible();
    await expect(canvas.getByText(VERDICT_LABEL.pass)).toBeVisible();
    await expect(canvas.queryByText(VERDICT_LABEL.fail)).toBeNull();
  },
};

export const SpacingScaleMultipliesTheUnit: Story = {
  render: () => <SpacingScale steps={[1, 6, 10]} />,
  play: async ({ canvasElement }) => {
    const unit = Number.parseFloat(cssValue("spacing"));
    for (const step of [1, 6, 10]) {
      const bar = requireElement(canvasElement, `[data-step="${String(step)}"]`);
      await expect(bar.getBoundingClientRect().width).toBe(step * unit);
    }
  },
};

export const RadiusScaleShowsEveryRadius: Story = {
  render: () => <RadiusScale />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByRole("listitem")).toHaveLength(
      tokensWithPrefix("radius-", "primitive").length
    );
    const card = requireElement(canvasElement, '[data-token="radius-lg"]');
    await expect(getComputedStyle(card).borderTopLeftRadius).toBe(cssValue("radius-lg"));
  },
};

export const ShadowLadderPaintsEachStep: Story = {
  render: () => <ShadowLadder names={["shadow-1", "shadow-3", "shadow-brand"]} />,
  play: async ({ canvas, canvasElement }) => {
    const raised = requireElement(canvasElement, '[data-token="shadow-3"]');
    await expect(getComputedStyle(raised).boxShadow).not.toBe("none");
    await expect(canvas.getByText(token("shadow-brand").description)).toBeVisible();
  },
};

export const MotionDemoRunsOnTheTokens: Story = {
  render: () => <MotionDemo ease="out" duration="base" use="state changes" />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const play = canvas.getByRole("button", {
      name: `Play ${token("ease-out").cssVar} over ${token("duration-base").cssVar}`,
    });
    await userEvent.click(play);
    await expect(play).toHaveAttribute("aria-pressed", "true");
    const dot = getComputedStyle(requireElement(canvasElement, '[data-token="ease-out"]'));
    await expect(dot.transitionTimingFunction).toBe(cssValue("ease-out"));
    await expect(Number.parseFloat(dot.transitionDuration) * 1000).toBe(
      Number.parseFloat(cssValue("duration-base"))
    );
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- docs-kit.stories 2>&1 | tail -12`
Expected: FAIL — `Failed to resolve import "./catalogue"`.

- [ ] **Step 5: The catalogue — the only door to token values**

Create `apps/storybook/src/docs-kit/catalogue.ts`:

```ts
import { parseColor } from "@pink-paprikaa-web/design-tokens/contrast";
import catalogue from "@pink-paprikaa-web/design-tokens/tokens.json";

import type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

export type { TokenEntry } from "@pink-paprikaa-web/design-tokens/catalogue";

/**
 * Foundation pages ask for tokens by name or prefix and never retype a value. Every lookup throws
 * when nothing matches, so a renamed or removed token fails `storybook:test` on the specimen that
 * asked for it — it can never render as an empty swatch.
 */
export const CATALOGUE: readonly TokenEntry[] = catalogue;

export type Surface = NonNullable<TokenEntry["surface"]>;
export type Tier = Exclude<TokenEntry["tier"], "unknown">;

/** Which tokens a helper shows: base tokens with a prefix, an explicit list, or a surface's overrides. */
export type TokenSelection =
  | { readonly prefix: string; readonly tier?: Tier }
  | { readonly names: readonly string[] }
  | { readonly surface: Surface };

export interface TypographyValue {
  readonly fontSize: string;
  readonly lineHeight?: number | string;
  readonly letterSpacing?: string;
  readonly fontWeight?: number | string;
}

function notFound(what: string): Error {
  return new Error(
    `docs-kit: ${what} in @pink-paprikaa-web/design-tokens/tokens.json. A token was renamed or removed — update the page that asks for it; never retype its value.`
  );
}

/** The token called `name` — its base value, or its override on `surface`. */
export function token(name: string, surface?: Surface): TokenEntry {
  const wanted = surface ?? null;
  const entry = CATALOGUE.find(
    (candidate) => candidate.name === name && candidate.surface === wanted
  );
  if (entry === undefined) {
    throw notFound(
      `no token "${name}"${surface === undefined ? "" : ` on the ${surface} surface`}`
    );
  }
  return entry;
}

const BUILD_ORDER = new Map(CATALOGUE.map((entry, index) => [entry, index]));
const INTEGER = /^\d+$/;

/**
 * Build order, except that sibling steps with numeric names sort by number. The catalogue lists
 * integer-like keys first (JavaScript object key order), so `ink-000` would follow `ink-900` and
 * `white-alpha-06` would follow `white-alpha-92` without this.
 */
function byStep(a: TokenEntry, b: TokenEntry): number {
  const depth = Math.min(a.path.length, b.path.length);
  for (let index = 0; index < depth; index += 1) {
    const left = a.path[index] ?? "";
    const right = b.path[index] ?? "";
    if (left === right) continue;
    if (INTEGER.test(left) && INTEGER.test(right)) return Number(left) - Number(right);
    break;
  }
  return (BUILD_ORDER.get(a) ?? 0) - (BUILD_ORDER.get(b) ?? 0);
}

/** Base tokens whose name starts with `prefix` (optionally one tier), numeric steps in order. */
export function tokensWithPrefix(prefix: string, tier?: Tier): readonly TokenEntry[] {
  const entries = CATALOGUE.filter(
    (entry) =>
      entry.surface === null &&
      entry.name.startsWith(prefix) &&
      (tier === undefined || entry.tier === tier)
  );
  if (entries.length === 0) {
    throw notFound(`no ${tier ?? "base"} token starts with "${prefix}"`);
  }
  return [...entries].sort(byStep);
}

/** Every token a surface redefines, numeric steps in order. */
export function surfaceOverrides(surface: Surface): readonly TokenEntry[] {
  const entries = CATALOGUE.filter((entry) => entry.surface === surface);
  if (entries.length === 0) {
    throw notFound(`the ${surface} surface overrides nothing`);
  }
  return [...entries].sort(byStep);
}

export function selectTokens(selection: TokenSelection): readonly TokenEntry[] {
  if ("names" in selection) return selection.names.map((name) => token(name));
  if ("surface" in selection) return surfaceOverrides(selection.surface);
  return tokensWithPrefix(selection.prefix, selection.tier);
}

function isTypography(value: unknown): value is TypographyValue {
  return typeof value === "object" && value !== null && "fontSize" in value;
}

/** A value as the docs print it; a typography composite as `size / line-height / tracking / weight`. */
export function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (isTypography(value)) {
    return [value.fontSize, value.lineHeight, value.letterSpacing, value.fontWeight]
      .filter((part) => part !== undefined)
      .map(String)
      .join(" / ");
  }
  throw new Error(`docs-kit: cannot print the token value ${JSON.stringify(value)}`);
}

/** A single-value token as a CSS string (colours, lengths, durations, easings). */
export function cssValue(name: string): string {
  const { value } = token(name);
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`docs-kit: "${name}" is a composite token, not a single CSS value`);
  }
  return String(value);
}

/** The composite of a `text-*` token. */
export function typographyOf(name: string): TypographyValue {
  const { value } = token(name);
  if (!isTypography(value)) {
    throw new Error(`docs-kit: "${name}" is not a typography token`);
  }
  return value;
}

/** An opaque colour token as the browser reports a computed colour: `rgb(r, g, b)`. */
export function rgbOf(name: string): string {
  const { r, g, b } = parseColor(cssValue(name));
  return `rgb(${String(r)}, ${String(g)}, ${String(b)})`;
}
```

Create `apps/storybook/src/docs-kit/dom.ts`:

```ts
/** The one element a specimen test inspects, or a failure naming the selector. */
export function requireElement(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector(selector);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`docs-kit test: nothing matches ${selector}`);
  }
  return found;
}
```

- [ ] **Step 6: Layout helpers for specimens**

Create `apps/storybook/src/docs-kit/specimen.tsx`:

```tsx
import type { ReactNode } from "react";

export interface SpecimenRowProps {
  /** Names the prop or token that produces the examples. */
  label: string;
  children: ReactNode;
}

/** A labelled, wrapping row of live examples. */
export function SpecimenRow({ label, children }: SpecimenRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-mono text-text-subtle">{label}</span>
      <div className="flex min-w-0 flex-wrap items-end gap-6">{children}</div>
    </div>
  );
}

export interface SpecimenTileProps {
  caption: string;
  /** Set when the tile floods a dark field, so what sits on it re-reads the tokens. */
  surface?: "brand" | "ink" | "soft";
  /** The tile's field, size, padding and alignment — token classes only (the base sets none, so nothing conflicts). */
  className: string;
  children: ReactNode;
}

/** One example on its own field, captioned with what produced it. */
export function SpecimenTile({ caption, surface, className, children }: SpecimenTileProps) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div data-surface={surface} className={`flex rounded-lg ${className}`}>
        {children}
      </div>
      <figcaption className="font-mono text-mono text-text-subtle">{caption}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 7: The eight helpers**

Create `apps/storybook/src/docs-kit/swatch.tsx`:

```tsx
import { useState } from "react";

import { formatValue, selectTokens, token, type TokenSelection } from "./catalogue";

export interface SwatchProps {
  /** Token name, e.g. `color-pink-500`. */
  name: string;
}

/**
 * One colour token: a chip painted with its CSS variable, then its name, value and reference. The
 * name and the value are buttons that copy themselves (the August port's Colour page did the
 * same); a status line confirms the copy.
 */
export function Swatch({ name }: SwatchProps) {
  const entry = token(name);
  const value = formatValue(entry.value);
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(text);
      },
      () => {
        setCopied(null);
      }
    );
  };
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        role="img"
        aria-label={entry.cssVar}
        className="h-16 rounded-sm border border-border-subtle"
        style={{ backgroundColor: `var(${entry.cssVar})` }}
      />
      <figcaption className="flex min-w-0 flex-col items-start font-mono text-mono">
        <button
          type="button"
          className="cursor-pointer text-left wrap-break-word text-text-heading hover:text-text-brand"
          onClick={() => {
            copy(entry.cssVar);
          }}
        >
          {entry.cssVar}
        </button>
        <button
          type="button"
          className="cursor-pointer text-left text-text-muted hover:text-text-brand"
          onClick={() => {
            copy(value);
          }}
        >
          {value}
        </button>
        <span role="status" className="font-body text-caption text-text-brand">
          {copied === null ? "" : `Copied ${copied}`}
        </span>
        {entry.reference === null ? null : (
          <span className="text-text-subtle">→ {entry.reference}</span>
        )}
        {entry.description === "" ? null : (
          <span className="font-body text-caption text-text-subtle">{entry.description}</span>
        )}
      </figcaption>
    </figure>
  );
}

export interface SwatchesProps {
  selection: TokenSelection;
}

export function Swatches({ selection }: SwatchesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {selectTokens(selection).map((entry) => (
        <Swatch key={entry.name} name={entry.name} />
      ))}
    </div>
  );
}
```

Create `apps/storybook/src/docs-kit/token-table.tsx`:

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pink-paprikaa-web/ui";

import { formatValue, selectTokens, type TokenSelection } from "./catalogue";

export interface TokenTableProps {
  /** Visible caption and the table's accessible name. */
  caption: string;
  selection: TokenSelection;
}

/** Tokens as a table: CSS variable, resolved value, the alias it points at, and its use. */
export function TokenTable({ caption, selection }: TokenTableProps) {
  return (
    <Table caption={caption} isCaptionVisible minWidth="md">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Token</TableHeaderCell>
          <TableHeaderCell>Value</TableHeaderCell>
          <TableHeaderCell>References</TableHeaderCell>
          <TableHeaderCell>Use</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {selectTokens(selection).map((entry) => (
          <TableRow key={`${entry.surface ?? "base"}:${entry.name}`}>
            <TableCell className="font-mono text-mono text-text-heading">{entry.cssVar}</TableCell>
            <TableCell className="font-mono text-mono">{formatValue(entry.value)}</TableCell>
            <TableCell className="font-mono text-mono text-text-muted">
              {entry.reference ?? "—"}
            </TableCell>
            <TableCell className="text-body-sm text-text-muted">{entry.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

Create `apps/storybook/src/docs-kit/type-specimen.tsx`:

```tsx
import type { ReactNode } from "react";

import { formatValue, token } from "./catalogue";

export type TypeFamily = "display" | "body" | "devanagari" | "mono";
export type TypeTone = "heading" | "body" | "muted" | "subtle" | "brand";

export interface TypeSpecimenProps {
  /** A `text-*` step without the prefix: `h1`, `body-sm`, `display-2-fluid`. */
  step: string;
  family: TypeFamily;
  tone?: TypeTone;
  isUppercase?: boolean;
  children: ReactNode;
}

/** A sample set in one type step, read from its tokens, captioned with the step's values. */
export function TypeSpecimen({
  step,
  family,
  tone = "heading",
  isUppercase = false,
  children,
}: TypeSpecimenProps) {
  const size = token(`text-${step}`);
  const font = token(`font-${family}`);
  const color = token(`color-text-${tone}`);
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        className={isUppercase ? "wrap-break-word uppercase" : "wrap-break-word"}
        style={{
          fontFamily: `var(${font.cssVar})`,
          fontSize: `var(${size.cssVar})`,
          lineHeight: `var(${size.cssVar}--line-height, normal)`,
          letterSpacing: `var(${size.cssVar}--letter-spacing, normal)`,
          fontWeight: `var(${size.cssVar}--font-weight, inherit)`,
          color: `var(${color.cssVar})`,
        }}
      >
        {children}
      </div>
      <figcaption className="font-mono text-mono text-text-muted">
        {size.cssVar} · {formatValue(size.value)} · {font.cssVar}
      </figcaption>
    </figure>
  );
}
```

Create `apps/storybook/src/docs-kit/contrast-matrix.tsx`:

```tsx
import {
  type ContrastPolicy,
  type ContrastResult,
  type ContrastVerdict,
  evaluateContrastPolicy,
} from "@pink-paprikaa-web/design-tokens/contrast";
import pairs from "@pink-paprikaa-web/design-tokens/contrast-pairs.json";
import {
  Badge,
  type BadgeProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@pink-paprikaa-web/ui";

import { CATALOGUE } from "./catalogue";

const POLICY: ContrastPolicy = pairs;

export const VERDICT_LABEL: Readonly<Record<ContrastVerdict, string>> = {
  pass: "Pass — AA",
  exception: "Exception — brand fill, AA-large",
  fail: "Fail",
};

const VERDICT_TONE: Readonly<Record<ContrastVerdict, NonNullable<BadgeProps["tone"]>>> = {
  pass: "success",
  exception: "warning",
  fail: "danger",
};

/** The policy measured on this build — the same call the contrast gate makes. */
export function contrastResults(groups?: readonly string[]): ContrastResult[] {
  const all = evaluateContrastPolicy(CATALOGUE, POLICY);
  return groups === undefined ? all : all.filter((result) => groups.includes(result.group));
}

function Sample({ result }: { result: ContrastResult }) {
  const chip = (
    <span
      aria-hidden
      className="inline-flex size-10 items-center justify-center rounded-sm font-display font-bold"
      style={{ backgroundColor: result.backgroundValue, color: result.foregroundValue }}
    >
      Aa
    </span>
  );
  if (result.backdropValue === null) return chip;
  return (
    <span
      aria-hidden
      className="inline-flex rounded-md p-1"
      style={{ backgroundColor: result.backdropValue }}
    >
      {chip}
    </span>
  );
}

export interface ContrastMatrixProps {
  /** Policy group ids to show; every group when omitted. */
  groups?: readonly string[];
}

/** Every declared text/background pair with its measured ratio, its minimum and its verdict. */
export function ContrastMatrix({ groups }: ContrastMatrixProps) {
  const results = contrastResults(groups);
  const count = (verdict: ContrastVerdict) =>
    results.filter((result) => result.verdict === verdict).length;
  return (
    <div className="flex flex-col gap-4">
      <div className="font-mono text-mono text-text-muted">
        {results.length} pairs · {count("pass")} pass AA · {count("exception")} declared exceptions
        · {count("fail")} fail
      </div>
      <Table
        caption="Every text and background pair the components paint, measured from this build's tokens"
        isCaptionVisible
        minWidth="lg"
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell>Sample</TableHeaderCell>
            <TableHeaderCell>Text</TableHeaderCell>
            <TableHeaderCell>Background</TableHeaderCell>
            <TableHeaderCell>Surface</TableHeaderCell>
            <TableHeaderCell>Ratio</TableHeaderCell>
            <TableHeaderCell>Needs</TableHeaderCell>
            <TableHeaderCell>Verdict</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result) => (
            <TableRow
              key={`${result.group}:${result.foreground}:${result.background}`}
              data-verdict={result.verdict}
            >
              <TableCell>
                <Sample result={result} />
              </TableCell>
              <TableCell className="font-mono text-mono">{result.foreground}</TableCell>
              <TableCell className="font-mono text-mono">
                {result.backdrop === null
                  ? result.background
                  : `${result.background} over ${result.backdrop}`}
              </TableCell>
              <TableCell>{result.surface ?? "light"}</TableCell>
              <TableCell className="font-mono text-mono tabular-nums">
                {result.ratio.toFixed(2)}:1
              </TableCell>
              <TableCell className="font-mono text-mono tabular-nums">{result.min}:1</TableCell>
              <TableCell>
                <Badge tone={VERDICT_TONE[result.verdict]}>{VERDICT_LABEL[result.verdict]}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

Create `apps/storybook/src/docs-kit/spacing-scale.tsx`:

```tsx
import { cssValue, token } from "./catalogue";

export interface SpacingScaleProps {
  steps: readonly number[];
}

/** Each step drawn at N × the spacing unit, labelled with its step and its pixel length. */
export function SpacingScale({ steps }: SpacingScaleProps) {
  const unit = token("spacing");
  const unitPx = Number.parseFloat(cssValue("spacing"));
  return (
    <ol aria-label="Spacing scale" className="flex flex-wrap items-end gap-3">
      {steps.map((step) => (
        <li key={step} className="flex flex-col items-center gap-1">
          <span
            aria-hidden
            data-step={step}
            className="h-15 rounded-xs bg-pink-500"
            style={{ width: `calc(var(${unit.cssVar}) * ${String(step)})` }}
          />
          <span className="font-mono text-mono text-text-heading">{step}</span>
          <span className="font-mono text-mono text-text-muted">{step * unitPx}px</span>
        </li>
      ))}
    </ol>
  );
}
```

Create `apps/storybook/src/docs-kit/radius-scale.tsx`:

```tsx
import { formatValue, tokensWithPrefix } from "./catalogue";

/** Every primitive radius on a sample tile; the pill on a button-shaped bar. */
export function RadiusScale() {
  return (
    <ul aria-label="Corner radii" className="flex flex-wrap items-end gap-4">
      {tokensWithPrefix("radius-", "primitive").map((entry) => {
        const isPill = entry.name === "radius-pill";
        return (
          <li key={entry.name} className="flex flex-col gap-2">
            <span
              aria-hidden
              data-token={entry.name}
              className={
                isPill ? "h-10 w-28 bg-pink-500" : "h-15 w-18 border border-pink-200 bg-pink-100"
              }
              style={{ borderRadius: `var(${entry.cssVar})` }}
            />
            <span className="font-mono text-mono text-text-muted">
              {entry.name.replace("radius-", "")} · {formatValue(entry.value)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
```

Create `apps/storybook/src/docs-kit/shadow-ladder.tsx`:

```tsx
import { token } from "./catalogue";

export interface ShadowLadderProps {
  /** Shadow tokens in ladder order. */
  names: readonly string[];
}

/** The depth ladder: each shadow on a card-sized block, with the use its token describes. */
export function ShadowLadder({ names }: ShadowLadderProps) {
  return (
    <ul aria-label="Depth ladder" className="flex flex-wrap gap-6 py-2">
      {names.map((name) => {
        const entry = token(name);
        return (
          <li key={name} className="flex w-28 flex-col gap-2">
            <span
              aria-hidden
              data-token={name}
              className={
                name === "shadow-brand"
                  ? "h-16 rounded-lg bg-pink-500"
                  : "h-16 rounded-lg border border-border-subtle bg-surface-card"
              }
              style={{ boxShadow: `var(${entry.cssVar})` }}
            />
            <span className="font-mono text-mono text-text-heading">{entry.name}</span>
            <span className="text-caption text-text-subtle">{entry.description}</span>
          </li>
        );
      })}
    </ul>
  );
}
```

Create `apps/storybook/src/docs-kit/motion-demo.tsx`:

```tsx
import { Button } from "@pink-paprikaa-web/ui";
import { useState } from "react";

import { formatValue, token } from "./catalogue";

export interface MotionDemoProps {
  /** Easing step: `out`, `in-out`, `entrance`, `pop`. */
  ease: string;
  /** Duration step: `instant`, `fast`, `base`, `slow`, `page`. */
  duration: string;
  /** Where the design system uses this pairing. */
  use: string;
}

/** A dot that travels its track on one easing and one duration, toggled by a button. */
export function MotionDemo({ ease, duration, use }: MotionDemoProps) {
  const easing = token(`ease-${ease}`);
  const time = token(`duration-${duration}`);
  const unit = token("spacing");
  const [isAtEnd, setIsAtEnd] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        variant="secondary"
        size="sm"
        aria-pressed={isAtEnd}
        onClick={() => {
          setIsAtEnd((current) => !current);
        }}
      >
        Play {easing.cssVar} over {time.cssVar}
      </Button>
      <div className="relative h-2.5 w-full max-w-75 rounded-pill bg-ink-200">
        <span
          aria-hidden
          data-token={easing.name}
          className="absolute inset-y-0 w-8 rounded-pill bg-pink-500"
          style={{
            left: isAtEnd ? `calc(100% - var(${unit.cssVar}) * 8)` : "0px",
            transitionProperty: "left",
            transitionDuration: `var(${time.cssVar})`,
            transitionTimingFunction: `var(${easing.cssVar})`,
          }}
        />
      </div>
      <span className="font-mono text-mono text-text-muted">
        {time.cssVar} {formatValue(time.value)} · {use}
      </span>
    </div>
  );
}
```

- [ ] **Step 8: Seed the shared fixtures**

Create `apps/storybook/src/kits/fixtures.ts` (Task 10 replaces it with the full kit fixtures — these three exports stay identical):

```ts
import { brand } from "@pink-paprikaa-web/content";

import type { TrackerStep } from "@pink-paprikaa-web/ui";

const [flagship] = brand.outlets;
if (flagship === undefined) {
  throw new Error("storybook: the brand facts list no outlet (packages/content)");
}

/** The outlet every specimen, kit and pattern names. */
export const OUTLET = flagship;

/** The year the legal lines print — read once when Storybook is built, as an app does at build. */
export const BUILD_YEAR = new Date().getFullYear();

/** Order steps from the design system's OrderTracker. */
export const ORDER_STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];
```

- [ ] **Step 9: Run to green, then probe the loud failure**

Run:

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- docs-kit.stories 2>&1 | tail -15
```

Expected: 11 stories pass (axe included).

Probe (Review Focus 1): in `docs-kit.stories.tsx`, change `<Swatch name="color-pink-500" />` to `<Swatch name="color-pink-501" />`; rerun; expect FAIL with `docs-kit: no token "color-pink-501" in @pink-paprikaa-web/design-tokens/tokens.json`. Revert; rerun green. Paste both.

- [ ] **Step 10: Gate and commit**

```bash
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check && pnpm nx sync:check
git add apps/storybook pnpm-lock.yaml tsconfig.json
git commit -m "feat(storybook): docs-kit helpers that read tokens and fail loudly

Swatch, TokenTable, TypeSpecimen, ContrastMatrix, SpacingScale, RadiusScale,
ShadowLadder and MotionDemo read every value from the token catalogue; a
missing name throws, so a renamed token fails storybook:test on the page that
asked for it. Contract tests are hidden stories in a real browser, where a
computed colour or width can actually be asserted.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

