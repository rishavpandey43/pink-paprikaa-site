### Task 6: The Spacing group

Sources: `guidelines/{spacing-scale,spacing-layout}.card.html`, readme §3.3, spec §4 C8.

**Files:**

- Create: `apps/storybook/src/foundations/spacing/{spacing.stories.tsx,scale.mdx,layout-rhythm.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/space-shape-motion.mdx` (§ Spacing, § Layout)

**Dev parity:**

| Dev item                                                                         | Ruling  | Where / spec clause                                                                                |
| -------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| 4px base; the step number is the multiple (`p-6` = 24px)                         | ALREADY | `scale.mdx` + `Scale` play (unit is 4, step 6 is 24px)                                             |
| Steps 1–12, then 14 · 16 · 18 · 20 · 24 · 32; half steps for optical nudges only | ALREADY | `scale.mdx`; `SPACE_STEPS` checked against `StackProps["space"]` at compile time                   |
| "16 / 24 / 40 do most of the work"                                               | ALREADY | `scale.mdx` ("steps 4, 6 and 10")                                                                  |
| Container max, fluid gutter, fluid section rhythm                                | ALREADY | `RhythmTokens` (values per C8)                                                                     |
| Layout table row `--layout-header-h` 72px (SiteHeader)                           | DROP    | C1: header is `spacing-header` (default) / `spacing-header-compact`, both listed in `ChromeTokens` |
| Layout table rows tab bar height and hit minimum ("every interactive target")    | ADD     | Step 1 `ChromeTokens` + `layout-rhythm.mdx`                                                        |
| Layout table row card minimum (AutoGrid track)                                   | ALREADY | Layout → AutoGrid `AutoGridTokens`                                                                 |
| `--layout-*` token names                                                         | DROP    | D4 (`spacing-*`, `container-*`)                                                                    |
| Grids are honest grids with `gap`, never masonry; columns 1 → 2 → 3 → 4 → 4      | ALREADY | Layout → AutoGrid, Layout → Breakpoints (`COLUMNS`)                                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `SpacingScale`, `TokenTable`, `cssValue`, `requireElement` (docs-kit); `AutoGrid`, `Card`, `Section`, `type StackProps` (ui).
- Produces: `Spacing/Specimens` → `Scale`, `Rhythm`, `RhythmTokens`, `ChromeTokens`; pages `Spacing/Scale`, `Spacing/Layout rhythm`.

- [ ] **Step 1: The Spacing specimens**

Create `apps/storybook/src/foundations/spacing/spacing.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { AutoGrid, Card, Section, type StackProps } from "@pink-paprikaa-web/ui";

import { cssValue } from "../../docs-kit/catalogue";
import { requireElement } from "../../docs-kit/dom";
import { SpacingScale } from "../../docs-kit/spacing-scale";
import { TokenTable } from "../../docs-kit/token-table";

/** Live visuals for the Spacing pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Spacing/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type SpaceStep = NonNullable<StackProps["space"]>;

/** Every step of the scale in order — checked against the layouts' `space` type in both directions. */
const SPACE_STEPS = [
  0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32,
] as const satisfies readonly SpaceStep[];

/** Compile-time: a step the system gains but this page does not show fails typecheck. */
const _isEveryStepShown: [Exclude<SpaceStep, (typeof SPACE_STEPS)[number]>] extends [never]
  ? true
  : false = true;

const RHYTHM_TOKENS = [
  "spacing-gutter",
  "spacing-gutter-mobile",
  "spacing-gutter-desktop",
  "spacing-section",
  "spacing-section-mobile",
  "spacing-section-desktop",
  "spacing-grid-gap",
];

const CHROME_TOKENS = [
  "spacing-header",
  "spacing-header-compact",
  "spacing-tabbar",
  "spacing-dock-clearance",
  "spacing-hit",
];

export const Scale: Story = {
  render: () => <SpacingScale steps={SPACE_STEPS} />,
  play: async ({ canvasElement }) => {
    // Design-system rule: step N is N × 4px, so step 6 is always 24px.
    const unit = Number.parseFloat(cssValue("spacing"));
    await expect(unit).toBe(4);
    const six = requireElement(canvasElement, '[data-step="6"]');
    await expect(six.getBoundingClientRect().width).toBe(24);
  },
};

export const Rhythm: Story = {
  render: () => (
    <Section tone="alt" space="tight">
      <AutoGrid min="xs">
        {["card 1", "card 2", "card 3", "card 4"].map((label) => (
          <Card key={label} padding="sm">
            <span className="font-mono text-mono text-text-muted">{label}</span>
          </Card>
        ))}
      </AutoGrid>
    </Section>
  ),
};

export const RhythmTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Containers" selection={{ prefix: "container-" }} />
      <TokenTable
        caption="Gutters, section rhythm and grid gap"
        selection={{ names: RHYTHM_TOKENS }}
      />
    </div>
  ),
};

export const ChromeTokens: Story = {
  render: () => (
    <TokenTable caption="Fixed chrome and the touch target" selection={{ names: CHROME_TOKENS }} />
  ),
};
```

- [ ] **Step 2: The Spacing pages**

Create `apps/storybook/src/foundations/spacing/scale.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./spacing.stories";

<Meta title="Spacing/Scale" />

{/* source: guidelines/spacing-scale.card.html */}

# Spacing scale

Step N is N × the spacing unit, so the step number _is_ the multiple: `p-6` is the design system's
`--space-6`, `gap-10` its `--space-10`.

<Canvas of={Specimens.Scale} meta={Specimens} sourceState="none" />

Steps run from 1 to 12 one at a time, then 14, 16, 18, 20, 24 and 32; half steps 0.5 and 1.5 exist
for optical nudges. Steps 4, 6 and 10 do most of the work. Layouts take `space` as a step
(`Stack space={6}`), never as a length.
```

Create `apps/storybook/src/foundations/spacing/layout-rhythm.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./spacing.stories";

<Meta title="Spacing/Layout rhythm" />

{/* source: guidelines/spacing-layout.card.html */}

# Layout rhythm

A content container, a fluid gutter, a fluid grid gap and fluid section spacing set the page's
rhythm. `Container` and `Section` apply them; the `container-page` and `section-y` utilities do the
same for raw markup.

<Canvas of={Specimens.Rhythm} meta={Specimens} sourceState="none" />

<Canvas of={Specimens.RhythmTokens} meta={Specimens} sourceState="none" />

The gutter and section values are the handoff's (spec C8) — newer than the design system's and used
on every handoff page; the difference is at most a few pixels of gutter at 360px. Sections breathe:
never less than the mobile section value, never more than the desktop one.

The fixed chrome — the sticky site header (default and the handoff's compact row), the bottom tab
bar and the clearance sticky bars keep above the mobile dock — and the minimum touch target every
interactive element meets:

<Canvas of={Specimens.ChromeTokens} meta={Specimens} sourceState="none" />
```

- [ ] **Step 3: Probe the compile-time step check, then gate and commit**

Probe: delete `32` from `SPACE_STEPS`; run `pnpm nx typecheck @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -5`; expect `Type 'true' is not assignable to type 'false'` on `_isEveryStepShown`. Restore; rerun green.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- spacing.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/spacing
git commit -m "feat(storybook): the Spacing foundation pages

The scale is drawn from the spacing unit and asserted (step 6 is 24px); the
step list is checked against the layouts' space type in both directions, so a
new step cannot be left off the page.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

