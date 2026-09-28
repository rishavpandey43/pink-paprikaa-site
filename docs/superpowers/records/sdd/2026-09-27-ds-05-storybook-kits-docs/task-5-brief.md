### Task 5: The Type group

Sources: `guidelines/{type-display,type-headings,type-body,type-overline-mono,type-devanagari,fluid-type}.card.html`, readme §3.2, §3.10.

**Files:**

- Create: `apps/storybook/src/foundations/type/{type.stories.tsx,display.mdx,headings.mdx,body.mdx,overline-and-mono.mdx,devanagari.mdx,fluid.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/typography.mdx`

**Dev parity:**

| Dev item                                                                                          | Ruling  | Where / spec clause                                                                      |
| ------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Poppins structural (carries Devanagari), DM Sans body/UI, Space Mono codes only; final, no swaps  | ALREADY | `display.mdx`, `overline-and-mono.mdx`                                                   |
| "Every piece of text goes through `Text`, which locks each step's size, line-height and tracking" | ADD     | Step 2 `headings.mdx`                                                                    |
| The 12-step ramp, each captioned with size / line-height / tracking / family                      | ALREADY | The six pages' specimens; `TypeSpecimen` prints each step's composite from `tokens.json` |
| Step names `display1`, `subtitle1`, `subtitle2`, `body1`, `body2`                                 | DROP    | D4 (`display-1`, `h4`, `body-lg`, `body`, `body-sm`)                                     |
| Seven fluid twins                                                                                 | ALREADY | `FluidTokens`                                                                            |
| "Set `isFluid` in every responsive layout" + the `<Text isFluid variant="h1">` example            | ADD     | Step 2 `fluid.mdx`                                                                       |
| Why the small end has no fluid twin (already comfortable; would crowd the hit-target floor)       | ADD     | Step 2 `fluid.mdx`                                                                       |
| "Resize the panel" h1-fluid demo                                                                  | ALREADY | `FluidSteps` at `floor360`, with a `play` proving the clamp minimum — stronger           |
| Display: negative tracking, line-height near 1.0; body stays generous                             | ALREADY | `display.mdx`, `body.mdx`                                                                |
| ALL CAPS only for overlines and heat labels                                                       | ALREADY | `overline-and-mono.mdx`                                                                  |
| Headlines ≤ 6 words; body avg 12 / max 24; menu descriptions ≤ 14, ingredient-led                 | ALREADY | `headings.mdx`, `body.mdx`, Brand → Voice & content                                      |
| Line length: `measure` prose for long-form, narrow for pull quotes                                | ADD     | Step 2 `body.mdx` (narrow was missing; `Text measure="prose" \| "narrow"`)               |
| Headings balance, running text avoids orphans — `Text` does it                                    | ALREADY | `headings.mdx` (`isBalanced`), `body.mdx` (`text-wrap: pretty`)                          |
| Devanagari only for the logo, display moments, dish names — never a control                       | ALREADY | `devanagari.mdx`                                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `TypeSpecimen`, `TokenTable`, `typographyOf` (docs-kit); `brand`, `OUTLET`; `formatRupees` (utils).
- Produces: `Type/Specimens` → `DisplaySteps`, `FamiliesAndWeights`, `HeadingSteps`, `BodySteps`, `OverlineAndMono`, `Devanagari`, `FluidSteps`, `FluidTokens`; six pages under `Type/`.

- [ ] **Step 1: The Type specimens**

Create `apps/storybook/src/foundations/type/type.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { brand } from "@pink-paprikaa-web/content";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { typographyOf } from "../../docs-kit/catalogue";
import { TokenTable } from "../../docs-kit/token-table";
import { TypeSpecimen } from "../../docs-kit/type-specimen";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Type pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Type/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FLUID_TOKENS = ["display-1", "display-2", "h1", "h2", "h3", "h4", "body"].map(
  (step) => `text-${step}-fluid`
);

export const DisplaySteps: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TypeSpecimen step="display-1" family="display">
        {brand.statement}
      </TypeSpecimen>
      <TypeSpecimen step="display-2" family="display">
        {brand.statement}
      </TypeSpecimen>
    </div>
  ),
};

export const FamiliesAndWeights: Story = {
  render: () => <TokenTable caption="Families and weights" selection={{ prefix: "font-" }} />,
};

export const HeadingSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="h1" family="display">
        Our Menu
      </TypeSpecimen>
      <TypeSpecimen step="h2" family="display">
        Chai &amp; Coffee
      </TypeSpecimen>
      <TypeSpecimen step="h3" family="display">
        Small Plates
      </TypeSpecimen>
      <TypeSpecimen step="h4" family="display">
        Add-ons
      </TypeSpecimen>
    </div>
  ),
};

export const BodySteps: Story = {
  render: () => (
    <div className="flex max-w-text-measure-prose flex-col gap-4">
      <TypeSpecimen step="body-lg" family="body" tone="body">
        We roast our own masala every morning, then build the rest of the day around it.
      </TypeSpecimen>
      <TypeSpecimen step="body" family="body" tone="body">
        Amritsari paneer, burnt chilli mayo, potato brioche. Served with masala fries.
      </TypeSpecimen>
      <TypeSpecimen step="body-sm" family="body" tone="muted">
        Contains dairy and gluten. Ask us about swaps.
      </TypeSpecimen>
      <TypeSpecimen step="caption" family="body" tone="subtle">
        {brand.billing.taxNote}
      </TypeSpecimen>
    </div>
  ),
};

export const OverlineAndMono: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="overline" family="display" tone="brand" isUppercase>
        {brand.tagline}
      </TypeSpecimen>
      <TypeSpecimen step="overline" family="display" tone="muted" isUppercase>
        {`Now Serving · ${OUTLET.name}, ${OUTLET.city}`}
      </TypeSpecimen>
      <TypeSpecimen step="mono" family="mono">
        {`ORDER #${brand.billing.invoicePrefix}-4821 · 26 JUL 2026 · ${formatRupees(1240)}`}
      </TypeSpecimen>
    </div>
  ),
};

export const Devanagari: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="h1" family="devanagari" tone="brand">
        {brand.nameDevanagari}
      </TypeSpecimen>
      <div className="flex flex-wrap items-baseline gap-7">
        <TypeSpecimen step="h2" family="devanagari">
          छोले
        </TypeSpecimen>
        <TypeSpecimen step="h2" family="devanagari">
          कुल्फी
        </TypeSpecimen>
        <TypeSpecimen step="h2" family="devanagari">
          मसाला चाय
        </TypeSpecimen>
      </div>
    </div>
  ),
};

export const FluidSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TypeSpecimen step="display-2-fluid" family="display">
        Desi at heart.
      </TypeSpecimen>
      <TypeSpecimen step="h1-fluid" family="display">
        Most ordered this week
      </TypeSpecimen>
      <TypeSpecimen step="h3-fluid" family="display">
        Small Plates
      </TypeSpecimen>
    </div>
  ),
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    // At the 360px floor a fluid step sits at its clamp() minimum and still fits the screen.
    const sample = canvas.getByText("Most ordered this week");
    const minimum = /clamp\((?<min>[\d.]+)px/.exec(typographyOf("text-h1-fluid").fontSize)?.groups
      ?.min;
    if (minimum === undefined) throw new Error("text-h1-fluid is not a clamp() with a px minimum");
    await expect(getComputedStyle(sample).fontSize).toBe(`${minimum}px`);
    await expect(sample.scrollWidth).toBeLessThanOrEqual(sample.clientWidth);
  },
};

export const FluidTokens: Story = {
  render: () => <TokenTable caption="Fluid steps" selection={{ names: FLUID_TOKENS }} />,
};
```

(Note on the Devanagari sample: the card sets the name in `pink-500`; this page sets it in `--color-text-brand` (`pink-600`) because text tokens, not fills, carry pink as type — spec §5.3.)

- [ ] **Step 2: The Type pages**

Create `apps/storybook/src/foundations/type/display.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Display" />

{/* source: guidelines/type-display.card.html */}

# Display

Poppins at the black weight, tight negative tracking and a line-height near 1.0 — for the one loud
line on a hero or a board.

<Canvas of={Specimens.DisplaySteps} meta={Specimens} sourceState="none" />

Fixed display sizes are for specimens and fixed moments; responsive layouts use the fluid twins
(Type → Fluid). **Poppins, DM Sans and Space Mono are the brand's final typefaces** — Poppins for
display and headings (it carries Devanagari), DM Sans for body and UI, Space Mono for order and
promo codes. Do not substitute.

## Families & weights

<Canvas of={Specimens.FamiliesAndWeights} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/type/headings.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Headings" />

{/* source: guidelines/type-headings.card.html */}

# Headings

Poppins bold for every structural heading, h1 to h4 — geometric and circular, matching the
wordmark's bowls.

<Canvas of={Specimens.HeadingSteps} meta={Specimens} sourceState="none" />

Set every piece of text through the `Text` atom (`variant`): each step owns its size, line-height,
tracking and weight together — one decision, never mixed by hand.

The visual step and the document outline are separate decisions: every titled component takes
`headingLevel`, so a card title can look like an h4 and still be the page's third-level heading.
Headlines stay at six words or fewer and use `text-wrap: balance` (`Text isBalanced`).
```

Create `apps/storybook/src/foundations/type/body.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Body" />

{/* source: guidelines/type-body.card.html */}

# Body

DM Sans for running text and interface copy, regular and medium, at a generous line-height.

<Canvas of={Specimens.BodySteps} meta={Specimens} sourceState="none" />

Body sentences stay short — about 12 words on average, never more than 24. Prose uses
`text-wrap: pretty` and the prose measure (`max-w-text-measure-prose`); helper text drops to `body-sm` in the
muted tone and fine print to `caption` in the subtle tone. Cap line length with `Text measure`:
`prose` for long-form, `narrow` for pull quotes (Spacing → Layout rhythm lists both widths).
```

Create `apps/storybook/src/foundations/type/overline-and-mono.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Overline & mono" />

{/* source: guidelines/type-overline-mono.card.html */}

# Overline & mono

Poppins bold in capitals with wide tracking for eyebrows; Space Mono for order codes, promo codes
and receipt lines — nowhere else.

<Canvas of={Specimens.OverlineAndMono} meta={Specimens} sourceState="none" />

ALL CAPS is only ever an overline or a heat label, never a full sentence.
```

Create `apps/storybook/src/foundations/type/devanagari.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Devanagari" />

{/* source: guidelines/type-devanagari.card.html */}

# Devanagari

Poppins carries Devanagari, so the Devanagari name sets in the same family as everything else. It
is reserved for the logo, dish names on the menu and big display moments — never for controls,
labels or status lines.

<Canvas of={Specimens.Devanagari} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/type/fluid.mdx`:

````mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./type.stories";

<Meta title="Type/Fluid" />

{/* source: guidelines/fluid-type.card.html */}

# Fluid type

`clamp()` sizes for layouts — headings never overflow a 360px screen. Type is fluid in layouts and
fixed only in specimens and on marketing canvases. The design system's `.pp-fluid-*` classes are
the `text-*-fluid` utilities here (`text-h1-fluid`), each carrying its line-height, tracking and
weight.

<Canvas of={Specimens.FluidSteps} meta={Specimens} sourceState="none" />

**Set `isFluid` in every responsive layout:**

```tsx
<Text variant="h1" isFluid>
  Desi at heart. Urban by nature.
</Text>
```

Only the display steps, h1–h4 and body have a twin. The small end — `body-sm`, `caption`,
`overline`, `mono` — is already comfortable at any width, and scaling it down would crowd the
hit-target floor.

<Canvas of={Specimens.FluidTokens} meta={Specimens} sourceState="none" />
````

- [ ] **Step 3: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- type.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
```

Expected: 8 Type specimens pass, including `FluidSteps` at 360px (computed size = the clamp minimum). Visually confirm each Canvas in `storybook:serve`; Devanagari must render in Poppins (the Devanagari subset loads — compare with the glyph shapes on the card).

```bash
git add apps/storybook/src/foundations/type
git commit -m "feat(storybook): the Type foundation pages

Display, Headings, Body, Overline and mono, Devanagari and Fluid, each step
set from its own tokens and captioned with the values the build emits. The
fluid specimen proves a heading sits at its clamp minimum on a 360px screen.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

