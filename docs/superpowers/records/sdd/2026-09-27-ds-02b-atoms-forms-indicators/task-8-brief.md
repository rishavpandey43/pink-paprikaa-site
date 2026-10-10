### Task 8: Spinner

**Files:**

- Create: `packages/design-tokens/tokens/component/spinner.json`
- Create: `packages/ui/src/atoms/spinner/spinner.tsx`, `spinner.test.tsx`, `spinner.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/spinner/spinner.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                        | Ruling  | Where / clause                                                                                                                          |
| ----------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| no `label` → `aria-hidden`, no status           | DROP    | contract §3 + `Spinner.jsx`: `label` = "Loading", always `role="status"`; in-control loaders (Input, Button) draw `SymbolMark` directly |
| labelled → announced politely                   | ALREADY | Step 2                                                                                                                                  |
| pulses the brand mark, never a ring             | ALREADY | Step 2                                                                                                                                  |
| paints with `currentColor`                      | ALREADY | `SymbolMark` (R19 `mask-symbol`, `currentColor`)                                                                                        |
| sizes xs–xl (16–64), default 32                 | DROP    | `Spinner.card.html` 24 / 36 / 52 → contract sm / md / lg (plan "Decisions"; spec §8.2)                                                  |
| tones muted / subtle / onBrand / current        | DROP    | contract §3 tone brand / ink / inverse; D5 (a surface, not an `onBrand` tone)                                                           |
| brand tone by default                           | ALREADY | Step 2                                                                                                                                  |
| caller `className` merges and wins              | ADD     | Step 2 new test                                                                                                                         |
| axe                                             | ALREADY | Step 2                                                                                                                                  |
| stories default / sizes / labelled              | ALREADY | Step 6                                                                                                                                  |
| story: inverse on an ink panel as well as brand | ADD     | Step 6 `Inverse`                                                                                                                        |
| story: inheriting the parent colour             | DROP    | goes with `tone="current"`                                                                                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `SymbolMark` (Plan 2a — inline SVG in `currentColor`, so the tone is a `text-*` class), `animate-mark-pulse` (Plan 1), `componentVariants`.
- Produces: `Spinner`, `SpinnerProps` as contract §3 (`role="status"`, `label` default "Loading", size sm/md/lg = 24/36/52, tone brand/ink/inverse).

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/spinner.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "spinner-sm": { "$value": "24px" },
    "spinner-md": { "$value": "36px", "$description": "The default loader." },
    "spinner-lg": { "$value": "52px", "$description": "A full-page load." }
  }
}
```

Append to `SPACING`: `"spinner-sm", "spinner-md", "spinner-lg"`. No contrast pair (no text; the mark is decorative).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/spinner/spinner.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ARTWORK } from "../../lib/brand-artwork";
import { Spinner } from "./spinner";

const markIn = (root: HTMLElement) =>
  root.querySelector(`svg[viewBox="${ARTWORK.symbol.viewBox}"]`);

describe("Spinner", () => {
  it("is a status named Loading by default", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("takes its own label", () => {
    render(<Spinner label="Finding your outlet" />);
    expect(screen.getByRole("status", { name: "Finding your outlet" })).toBeInTheDocument();
  });

  it("draws the brand mark, pulsing only when motion is allowed", () => {
    const { container } = render(<Spinner />);
    const mark = markIn(container);
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("motion-safe:animate-mark-pulse");
  });

  it.each([
    ["sm", "size-spinner-sm"],
    ["md", "size-spinner-md"],
    ["lg", "size-spinner-lg"],
  ] as const)("renders size %s at %s", (size, sizeClass) => {
    const { container } = render(<Spinner size={size} />);
    expect(markIn(container)).toHaveClass(sizeClass);
  });

  it.each([
    ["brand", "text-pink-500"],
    ["ink", "text-ink-900"],
    ["inverse", "text-ink-000"],
  ] as const)("paints tone %s with %s", (tone, colour) => {
    const { container } = render(<Spinner tone={tone} />);
    expect(markIn(container)).toHaveClass(colour);
  });

  it("merges a caller className onto the status, replacing a conflicting class", () => {
    render(<Spinner className="flex" />);
    const status = screen.getByRole("status");
    expect(status).toHaveClass("flex");
    expect(status).not.toHaveClass("inline-flex");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Spinner label="Loading the menu" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './spinner'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/spinner/spinner.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

/** The loader is the bare brand mark, pulsing at 1.2s — never a gradient ring (readme §3.8). */
const spinner = componentVariants({
  slots: {
    root: "inline-flex",
    mark: "block shrink-0 motion-safe:animate-mark-pulse",
  },
  variants: {
    size: {
      sm: { mark: "size-spinner-sm" },
      md: { mark: "size-spinner-md" },
      lg: { mark: "size-spinner-lg" },
    },
    tone: {
      brand: { mark: "text-pink-500" },
      ink: { mark: "text-ink-900" },
      inverse: { mark: "text-ink-000" },
    },
  },
  defaultVariants: { size: "md", tone: "brand" },
});

export interface SpinnerProps extends ComponentProps<"span"> {
  size?: "sm" | "md" | "lg" | undefined;
  /** `inverse` is the white mark, for pink or ink panels. */
  tone?: "brand" | "ink" | "inverse" | undefined;
  /** The status announced to assistive tech. = "Loading" */
  label?: string | undefined;
}

/** Whole-view loading. For content with a known shape, Skeleton is the better default. */
export function Spinner({
  size = "md",
  tone = "brand",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  const styles = spinner({ size, tone });
  return (
    <span role="status" aria-label={label} className={styles.root({ className })} {...props}>
      <SymbolMark className={styles.mark()} />
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Spinner.card.html`; docs from `Spinner.prompt.md`)**

`packages/ui/src/atoms/spinner/spinner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./spinner";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'Whole-view loading state — the brand mark, pulsing. `md` (36px) by default; `lg` (52px) for a full-page load. `tone="inverse"` paints the white mark on pink or ink. With reduced motion the mark stays still. For content with a known shape use Skeleton instead — it is the better default.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" label="Loading, small" />
      <Spinner size="md" label="Loading, medium" />
      <Spinner size="lg" label="Loading, large" />
    </div>
  ),
};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner tone="brand" label="Loading, brand" />
      <Spinner tone="ink" label="Loading, ink" />
    </div>
  ),
};

export const Inverse: Story = {
  name: "inverse",
  render: () => (
    <div className="flex gap-4">
      <div data-surface="brand" className="rounded-lg bg-surface-brand p-4">
        <Spinner tone="inverse" label="Loading, on brand" />
      </div>
      <div data-surface="ink" className="rounded-lg bg-surface-inverse p-4">
        <Spinner tone="inverse" label="Loading, on ink" />
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Spinner, type SpinnerProps } from "./atoms/spinner/spinner";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/spinner packages/design-tokens/tokens/component/spinner.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Spinner atom — the pulsing brand mark

The loader is the shared SymbolMark in three sizes and three tones, a
status named Loading by default, still under reduced motion.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

