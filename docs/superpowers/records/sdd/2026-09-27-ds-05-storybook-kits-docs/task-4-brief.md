### Task 4: The Colors group and the Contrast page

Sources: `guidelines/{color-primary,color-ink,color-accents,color-heat,color-semantic,color-surfaces,color-status}.card.html`, readme §3.1/§3.8, spec §5.

**Files:**

- Create: `apps/storybook/src/foundations/colors/{colors.stories.tsx,primary.mdx,ink.mdx,accents.mdx,heat.mdx,semantic.mdx,surfaces.mdx,status.mdx,contrast.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/colour.mdx`

**Dev parity:**

| Dev item                                                                                         | Ruling  | Where / spec clause                                                               |
| ------------------------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------- |
| One primary at full strength; flat pink fields with white type; the soft pink does the calm work | ALREADY | `primary.mdx`                                                                     |
| Click any swatch name or value to copy it                                                        | ADD     | Task 2 `Swatch` (every `Swatches` here inherits it)                               |
| Neutrals warm, tinted toward pink — never blue-grey                                              | ALREADY | `ink.mdx`                                                                         |
| Max one spice accent per screen; max two backgrounds per composition                             | ALREADY | `accents.mdx`                                                                     |
| Only two gradients, both legibility scrims                                                       | ALREADY | `accents.mdx` + Layout → Utility classes                                          |
| Brand swatches with notes (primary, hover, active, soft, tint)                                   | ALREADY | `PinkRamp` + `SemanticTokens` "Interaction" table (`color-brand-hover`/`-active`) |
| Surface swatches (page, page-alt, card, sunken, brand, brand-soft, inverse, overlay, glass)      | ALREADY | `SemanticTokens` "Surfaces" (every `color-surface-*`) + `FourGrounds`             |
| "Text colours carry the family name: `text-text-heading`, not `text-heading`"                    | ADD     | Step 2 `semantic.mdx`                                                             |
| Border swatches (subtle, default, strong, brand, brand-soft)                                     | ALREADY | `SemanticTokens` "Borders"                                                        |
| Status pairs; never a status colour without a message                                            | ALREADY | `status.mdx`                                                                      |
| Heat: in order, used only by `SpiceLevel`                                                        | ALREADY | `heat.mdx`                                                                        |
| Primitives: prefer a semantic token                                                              | ALREADY | `semantic.mdx` ("a component never names a ramp step")                            |
| August token names (`brand-primary`, `ink-0`, `heat-1`, `border-brand-soft`)                     | DROP    | D4                                                                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: docs-kit (`Swatches`, `TokenTable`, `ContrastMatrix`, `contrastResults`, `VERDICT_LABEL`, `rgbOf`), `Alert`, `Card`, `SpiceLevel` (ui), `brand`, `OUTLET`.
- Produces: `Colors/Specimens` → `PinkRamp`, `InkRamp`, `Accents`, `TextCompanions`, `HeatScale`, `SemanticPanels`, `SemanticTokens`, `FourGrounds`, `LightIsland`, `SurfaceOverrides`, `StatusAlerts`, `StatusSwatches`, `Contrast`; eight pages under `Colors/`.

- [ ] **Step 1: Write the failing specimens (Contrast is Review Focus 4)**

Create `apps/storybook/src/foundations/colors/colors.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { brand } from "@pink-paprikaa-web/content";
import { Alert, Card, SpiceLevel } from "@pink-paprikaa-web/ui";

import { rgbOf } from "../../docs-kit/catalogue";
import { ContrastMatrix, contrastResults, VERDICT_LABEL } from "../../docs-kit/contrast-matrix";
import { SpecimenTile } from "../../docs-kit/specimen";
import { Swatches } from "../../docs-kit/swatch";
import { TokenTable } from "../../docs-kit/token-table";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Colors pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Colors/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const PINK_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800].map(
  (step) => `color-pink-${String(step)}`
);
const INK_RAMP = ["900", "800", "700", "600", "500", "400", "300", "200", "100", "000"].map(
  (step) => `color-ink-${step}`
);
const ACCENTS = [
  "color-turmeric",
  "color-turmeric-soft",
  "color-tandoor",
  "color-tandoor-soft",
  "color-mint",
  "color-mint-soft",
  "color-kesar",
  "color-kesar-soft",
];
const TEXT_COMPANIONS = [
  "color-turmeric-strong",
  "color-mint-strong",
  "color-kesar-strong",
  "color-veg",
];
const HEAT = ["color-heat-1", "color-heat-2", "color-heat-3", "color-heat-4"];
const STATUS = ["success", "warning", "danger", "info"].flatMap((status) => [
  `color-status-${status}`,
  `color-status-${status}-soft`,
]);
const LEVELS = [1, 2, 3, 4] as const;

/** The same markup on every ground — only the ground's surface changes. */
function SurfaceSample() {
  return (
    <>
      <h2>Find a Paprikaa</h2>
      <p>{`${OUTLET.name}, ${OUTLET.city}. Open ${brand.hours.display}.`}</p>
      <a href="#directions">Get directions</a>
    </>
  );
}

export const PinkRamp: Story = { render: () => <Swatches selection={{ names: PINK_RAMP }} /> };

export const InkRamp: Story = { render: () => <Swatches selection={{ names: INK_RAMP }} /> };

export const Accents: Story = { render: () => <Swatches selection={{ names: ACCENTS }} /> };

export const TextCompanions: Story = {
  render: () => <Swatches selection={{ names: TEXT_COMPANIONS }} />,
};

export const HeatScale: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-8">
        {LEVELS.map((level) => (
          <SpiceLevel key={level} level={level} hasLabel />
        ))}
      </div>
      <Swatches selection={{ names: HEAT }} />
    </div>
  ),
};

export const SemanticPanels: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-page p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-page</span>
        <span className="font-display text-h4 text-text-heading">Heading</span>
        <span className="text-body-sm text-text-body">--color-text-body</span>
        <span className="text-body-sm text-text-muted">--color-text-muted</span>
      </div>
      <div className="flex flex-col gap-1 rounded-md bg-surface-page-alt p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-page-alt</span>
        <span className="font-display text-h4 text-text-brand">--color-text-brand</span>
        <span className="text-body-sm text-text-body">Tinted section</span>
      </div>
      <div data-surface="brand" className="flex flex-col gap-1 rounded-md bg-surface-brand p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-brand</span>
        <span className="font-display text-h4 text-text-heading">--color-text-on-brand</span>
        <span className="text-body-sm text-text-muted">Flooded pink panel</span>
      </div>
      <div data-surface="ink" className="flex flex-col gap-1 rounded-md bg-surface-inverse p-3">
        <span className="font-mono text-mono text-text-muted">--color-surface-inverse</span>
        <span className="font-display text-h4 text-text-heading">--color-text-on-inverse</span>
        <span className="text-body-sm text-text-muted">Footer / ink panel</span>
      </div>
    </div>
  ),
};

export const SemanticTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Surfaces" selection={{ prefix: "color-surface-", tier: "semantic" }} />
      <TokenTable caption="Text" selection={{ prefix: "color-text-", tier: "semantic" }} />
      <TokenTable caption="Borders" selection={{ prefix: "color-border-", tier: "semantic" }} />
      <TokenTable
        caption="Interaction"
        selection={{
          names: [
            "color-brand-hover",
            "color-brand-active",
            "color-focus",
            "shadow-focus-ring",
            "shadow-focus-ring-inverse",
          ],
        }}
      />
    </div>
  ),
};

export const FourGrounds: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SpecimenTile
        caption="page · no attribute"
        className="min-h-38 flex-col items-start border border-border-subtle bg-surface-page p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="soft"'
        surface="soft"
        className="min-h-38 flex-col items-start bg-surface-brand-soft p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="brand"'
        surface="brand"
        className="min-h-38 flex-col items-start bg-surface-brand p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
      <SpecimenTile
        caption='data-surface="ink"'
        surface="ink"
        className="min-h-38 flex-col items-start bg-surface-inverse p-4"
      >
        <SurfaceSample />
      </SpecimenTile>
    </div>
  ),
};

export const LightIsland: Story = {
  render: () => (
    <div data-surface="ink" className="flex flex-col gap-4 rounded-xl bg-surface-inverse p-6">
      <span className="font-mono text-mono text-text-muted">data-surface=&quot;ink&quot;</span>
      <div data-surface="brand" className="flex flex-col gap-4 rounded-lg bg-surface-brand p-5">
        <span className="font-mono text-mono text-text-muted">data-surface=&quot;brand&quot;</span>
        <Card>
          <h2>Light island</h2>
          <p>A white card inside pink inside ink reads dark again: Card sets its own surface.</p>
          <a href="#light-island">A link on the island</a>
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const heading = canvas.getByRole("heading", { name: "Light island" });
    await expect(getComputedStyle(heading).color).toBe(rgbOf("color-ink-900"));
  },
};

export const SurfaceOverrides: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption='data-surface="brand"' selection={{ surface: "brand" }} />
      <TokenTable caption='data-surface="ink"' selection={{ surface: "ink" }} />
      <TokenTable caption='data-surface="soft"' selection={{ surface: "soft" }} />
      <TokenTable
        caption='data-surface="light" — the light island'
        selection={{ surface: "light" }}
      />
    </div>
  ),
};

export const StatusAlerts: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-2">
      <Alert tone="success" title="Order confirmed">
        Order in. Kitchen&apos;s on it.
      </Alert>
      <Alert tone="warning" title="Kitchen is busy">
        Pickup may take a little longer tonight.
      </Alert>
      <Alert tone="danger" title="Payment failed">
        That card didn&apos;t go through. Try another?
      </Alert>
      <Alert tone="info" title="Table held 10 min">
        We&apos;ll text you the confirmation.
      </Alert>
    </div>
  ),
};

export const StatusSwatches: Story = { render: () => <Swatches selection={{ names: STATUS }} /> };

export const Contrast: Story = {
  render: () => <ContrastMatrix />,
  play: async ({ canvas }) => {
    const results = contrastResults();
    await expect(results.filter((result) => result.verdict === "fail")).toEqual([]);

    const onBrand = results.find(
      (result) =>
        result.foreground === "color-text-on-brand" && result.background === "color-surface-brand"
    );
    if (onBrand === undefined)
      throw new Error("the policy no longer declares white on the brand pink");
    await expect(onBrand.verdict).toBe("exception");
    await expect(onBrand.ratio).toBeCloseTo(4.04, 2); // spec §5.2, measured

    const exceptionRows = canvas
      .getAllByRole("row")
      .filter((row) => row.getAttribute("data-verdict") === "exception");
    await expect(exceptionRows).toHaveLength(
      results.filter((result) => result.verdict === "exception").length
    );
    const row = exceptionRows.find(
      (candidate) =>
        within(candidate).queryByText("color-text-on-brand") !== null &&
        within(candidate).queryByText("color-surface-brand") !== null
    );
    if (row === undefined)
      throw new Error("white on the brand pink is not rendered as an exception");
    await expect(within(row).getByText(VERDICT_LABEL.exception)).toBeVisible();
    await expect(within(row).getByText(`${onBrand.ratio.toFixed(2)}:1`)).toBeVisible();
    await expect(within(row).queryByText(VERDICT_LABEL.pass)).toBeNull();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- colors.stories 2>&1 | tail -15`
Expected: PASS on first run is acceptable here only because the docs-kit already exists (Task 2) — the Review Focus test is proved by the probe in Step 3, not by a red run.

- [ ] **Step 2: The Colors pages**

Create `apps/storybook/src/foundations/colors/primary.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Primary" />

{/* source: guidelines/color-primary.card.html */}

# Brand pink

The primary ramp. `--color-pink-500` is the logo pink, given by the client; its hex exists in one
file only — `packages/design-tokens/tokens/primitive/color.json` — and everything else refers to
it by name.

<Canvas of={Specimens.PinkRamp} meta={Specimens} sourceState="none" />

- **One primary, used at full strength.** Large flat fields of `pink-500` — full-bleed hero panels,
  footers, CTA bars — with white type on top are the signature move.
- **`pink-100`**, the client's light pink, is the calm counterpart: page tints, soft badges, card
  fills, section backgrounds. Together with white it does most of the work.
- **As text, pink is one step darker.** `--color-text-brand` is `pink-600`: `pink-500` text on white
  falls short of AA for body sizes (Colors → Contrast has the measured ratio). Fills never change;
  only text tokens moved (spec §5.3).
```

Create `apps/storybook/src/foundations/colors/ink.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Ink" />

{/* source: guidelines/color-ink.card.html */}

# Warm ink neutrals

Neutrals are tinted warm toward the pink — never blue-grey, never a flat grey.

<Canvas of={Specimens.InkRamp} meta={Specimens} sourceState="none" />

`ink-900` carries headings, `ink-800` body text and `ink-600` muted and subtle text; `ink-200` and
`ink-300` are borders, `ink-100` the sunken fill, `ink-000` white. The design system set subtle
text in `ink-500`, which falls below AA on white, so subtle text moved up to `ink-600` (spec §3.2).
```

Create `apps/storybook/src/foundations/colors/accents.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Accents" />

{/* source: guidelines/color-accents.card.html */}

# Spice accents

Secondary only. Turmeric, tandoor, mint and kesar exist for heat scales, status and the occasional
data point. **At most one accent per screen beside the pink**, and at most two background colours
per composition: white or `pink-50`, plus one flooded pink or ink panel.

<Canvas of={Specimens.Accents} meta={Specimens} sourceState="none" />

## Text companions

An accent is a fill. Where status needs _text_, the system uses the strong companions, which pass
AA on white and on their soft fills; `veg` is the statutory mark's green.

<Canvas of={Specimens.TextCompanions} meta={Specimens} sourceState="none" />

Gradients: essentially none. The only two are the legibility scrims over photography
(Layout → Utility classes) — no pink-to-orange, no purple, no mesh.
```

Create `apps/storybook/src/foundations/colors/heat.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Heat" />

{/* source: guidelines/color-heat.card.html */}

# Spice heat scale

Heat is shown with diamonds on the heat ramp, never with emoji. The labels are plain English —
Mild, Medium, Hot, Extra Hot — because a guest should never have to decode a control.

<Canvas of={Specimens.HeatScale} meta={Specimens} sourceState="none" />

`SpiceLevel` draws it (`level` 1–4, `hasLabel`). The ramp is semantic: each step references an
accent, and the hottest is the brand's own `pink-600`.
```

Create `apps/storybook/src/foundations/colors/semantic.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Semantic" />

{/* source: guidelines/color-semantic.card.html */}

# Semantic surfaces & text

The aliases to reach for in components. A component never names a ramp step for its field or its
text — it names what the colour means, and the semantic token points at the step.

Utilities carry the family name twice: `text-text-heading`, not `text-heading`; `border-border-subtle`,
not `border-subtle`; `bg-surface-card`.

<Canvas of={Specimens.SemanticPanels} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.SemanticTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/colors/surfaces.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Surfaces" />

{/* source: guidelines/color-surfaces.card.html */}

# Text on surfaces

`data-surface` remaps every text token — the same `h2`, `p` and link on four grounds, with no
overrides.

<Canvas of={Specimens.FourGrounds} meta={Specimens} sourceState="none" />

Identical markup in all four. Card, Section, PatternField, SiteFooter, HeroBanner, CtaBand,
StatBand, QuotePanel, PricingCard (flooded) and PostFrame set the attribute themselves; in raw
HTML add it (or `.pp-on-brand` / `.pp-on-ink` / `.pp-on-soft`) to the flooded container. Never
hard-code white on a heading — put the heading on a surface.

## Light islands

A white surface nested inside a dark one restores the light tokens. Every white-filled component —
Card `default`, the form controls, QuotePanel `light` — sets `data-surface="light"` itself.

<Canvas of={Specimens.LightIsland} meta={Specimens} sourceState="none" />

## What each surface redefines

Surfaces override semantic and component tokens only, never primitives, so the remap cascades.
`light` restores, to its exact base value, every token the other three change.

<Canvas of={Specimens.SurfaceOverrides} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/colors/status.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Status" />

{/* source: guidelines/color-status.card.html */}

# Status colors

Success, warning, danger and info — each with a soft fill. Status is never colour alone: it always
carries a message and a glyph.

<Canvas of={Specimens.StatusAlerts} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.StatusSwatches} meta={Specimens} sourceState="none" />

The fills are accents. Status **text** uses the strong companions — `--color-text-success` is
`mint-strong`, `--color-text-warning` is `turmeric-strong` — which pass AA on white and on the soft
fills.
```

Create `apps/storybook/src/foundations/colors/contrast.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./colors.stories";

<Meta title="Colors/Contrast" />

{/* source: spec §5 — the accessibility balance policy */}

# Contrast

WCAG 2.2 AA everywhere **except** the one pairing the brand cannot give up: white text on the brand
pink fill. That pair is held to the AA-large floor (3:1) and is declared, tested and shown here as
the sole exception (spec §5, owner decision D3). Everything else about accessibility — semantics,
names, keyboard, focus, targets, motion — is uncompromised and gated.

<Canvas of={Specimens.Contrast} meta={Specimens} sourceState="none" />

The matrix is computed on this build from `tokens.json` and
`packages/design-tokens/contrast-pairs.json` by the same evaluator the gate runs
(`design-tokens:test`), so this page cannot disagree with CI. A pair below its minimum fails the
build; a pair between 3:1 and AA is allowed only in a group tagged `brand-fill`, over the brand
pink.

## Why axe does not check contrast

axe cannot scope an exception to one pair, so its `color-contrast` rule is off in the component
tests and the story tests. The token policy replaces it and measures every pair the components
paint. A component that paints a new text-on-background pair adds that pair to
`contrast-pairs.json` in the same change.

## Changing it

Change a **text** token, never a fill. Lowering a group's minimum is a decision-log event.
```

- [ ] **Step 3: Probe the Contrast test (Review Focus 4)**

In `docs-kit/contrast-matrix.tsx`, temporarily replace `{VERDICT_LABEL[result.verdict]}` inside the verdict `Badge` with `{VERDICT_LABEL.pass}` (every row now claims a pass); run the Step 1 command; expect FAIL on `Contrast` (the exception row shows the pass label) and on the docs-kit `ContrastMatrixRatesEachPair` story. Revert; rerun green. Paste both.

- [ ] **Step 4: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- colors.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
```

Expected: 13 Colors specimens pass; eight Colors pages build. Visually confirm in `storybook:serve` that each Canvas renders.

```bash
git add apps/storybook/src/foundations/colors
git commit -m "feat(storybook): the Colors foundation pages and the Contrast matrix

Primary, Ink, Accents, Heat, Semantic, Surfaces and Status from the design
system's cards, every swatch painted from its token. The Contrast page renders
the gate's own evaluator: white on the brand pink shows as the declared
exception with its measured ratio, and no pair fails.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

