### Task 13: StatusDot

> **CONTROLLER DELTA (routed from batch A review):** `SymbolMark` (Task 1, done) renders `<span aria-hidden="true" className="…mask-symbol…">` — query `.mask-symbol`, not `svg`, in this task's test. Also: use the shared `radius.diamond` token (2px) as `rounded-diamond` — do NOT create a new `radius-status-dot` token; that name is retired (ruling in the plan's "Controller amendments — ruling R19" section).

**Dev reference:** `git show dev:packages/ui/src/atoms/status-dot/status-dot.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                                                  | Ruling  | Where / reason                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| Sizes `xs`/`sm`/`md`/`lg`                                                                                                 | DROP    | contracts §2 (`sm`/`md`; plan deviation 4)                        |
| The whole dot throbs (`animate-pp-pulse`)                                                                                 | ALREADY | the pulse ring (`animate-dot-pulse`), hidden under reduced motion |
| A bare danger dot is named "Unavailable"                                                                                  | ALREADY | named "Attention"; a bare dot is always named                     |
| `rounded-1`, `size-2…5`, `text-body2`                                                                                     | DROP    | D4; `status-dot-*` tokens                                         |
| Tests: label beside the dot, dot hidden when labelled, bare dot named by tone, tones, diamond, pulse only when asked, axe | ALREADY | Step 2                                                            |
| Test: caller className replaces the gap                                                                                   | ADD     | Step 2                                                            |
| Story `Tones` includes a labelled `danger`                                                                                | ADD     | Step 6                                                            |
| Story `Sizes` (labelled dots side by side)                                                                                | ADD     | Step 6                                                            |
| Stories `Default`, `Live`, `Bare`                                                                                         | ALREADY | `Playground`, `Pulse`, `Bare`                                     |
| Story `OutletStrip`                                                                                                       | ADD     | Step 6                                                            |

Implementer: copy this table into your report, extended with anything the plan missed.

Source: `components/atoms/StatusDot.{jsx,d.ts,card.html,prompt.md}`, readme §3.4 ("every small diamond … is a rotated square with the brand mark inside it").

**Visuals:**

- A 14px (sm, default) or 16px (md) square, rotated 45°, with a 2px radius, in the tone colour: open mint, busy turmeric, closed ink-400, live pink-500, danger danger.
- Inside it, the white brand symbol counter-rotated at 80% of the box and 66% opacity (the zip's mark scale for 14–19px dots).
- The label sits 8px away in DM Sans 500 at 13.5px, text-body.
- The pulse is a same-colour diamond animated by `pp-dot-pulse`.

**Two traps pinned by tests:**

- The `pp-dot-pulse` keyframes set `transform: rotate(45deg) scale(…)` themselves, so the pulse element must **not** also carry `rotate-45`, or it spins to 90° and shows as a square.
- Under reduced motion Plan 1 collapses animations to a single 0.01ms run. The unfilled pulse would then sit on screen as a solid square, so it is `motion-reduce:hidden`.

**Semantics:** with `label`, the dot is decorative and the text carries the state. Without one, the root is `role="img"` named by its tone ("Open"). State is never colour alone (spec §5.5).

**Files:**

- Create: `packages/design-tokens/tokens/component/status-dot.json`
- Create: `packages/ui/src/atoms/status-dot/status-dot.tsx`, `status-dot.test.tsx`, `status-dot.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `RADIUS`, `TEXT`), `packages/ui/src/index.ts`
- `contrast-pairs.json`: unchanged. The label is `text-body` (semantic), and the dot is not text: its state is carried by the label or the accessible name.

**Interfaces:**

- Consumes: `SymbolMark`, `componentVariants`; `bg-current`, `animate-dot-pulse`, `text-status-{success,warning,danger}`.
- Produces: `StatusDot`, `interface StatusDotProps extends ComponentProps<"span">` (contracts §2); tokens `spacing-status-dot-{sm,md}`, `radius-status-dot`, `text-status-dot-label`.

- [ ] **Step 1: Component tokens**

(If Task 0 Step 4 found a `radius-diamond` token from Plan 2b, drop `radius.status-dot` below and use `rounded-diamond` in Step 4.)

`packages/design-tokens/tokens/component/status-dot.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "status-dot-sm": { "$value": "14px", "$description": "The default dot, beside a label." },
    "status-dot-md": { "$value": "16px", "$description": "A bare dot." }
  },
  "radius": {
    "$type": "dimension",
    "status-dot": { "$value": "2px", "$description": "Corner of the rotated diamond." }
  },
  "text": {
    "$type": "typography",
    "status-dot-label": { "$value": { "fontSize": "13.5px", "fontWeight": "{font-weight.medium}" } }
  }
}
```

In `component-variants.ts`, append to `SPACING`: `"status-dot-sm", "status-dot-md",`; to `RADIUS`: `"status-dot",`; to `TEXT`: `"status-dot-label",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "status-dot" packages/design-tokens/dist/theme.css`
Expected: `--spacing-status-dot-sm: 14px;`, `--spacing-status-dot-md: 16px;`, `--radius-status-dot: 2px;`, `--text-status-dot-label: 13.5px;` and its weight.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/status-dot/status-dot.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("shows a visible label beside a decorative dot", () => {
    render(<StatusDot label="Open till 11:30pm" />);
    const label = screen.getByText("Open till 11:30pm");
    expect(label).toHaveClass("font-body", "text-status-dot-label", "text-text-body");
    const root = label.parentElement;
    expect(root).not.toHaveAttribute("role");
    expect(root).toHaveClass("inline-flex", "items-center", "gap-2");
    expect(root?.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["open", "Open"],
    ["busy", "Busy"],
    ["closed", "Closed"],
    ["live", "Live"],
    ["danger", "Attention"],
  ] as const)(
    "announces a bare %s dot as %s — never colour alone (Review Focus 2)",
    (tone, name) => {
      render(<StatusDot tone={tone} />);
      expect(screen.getByRole("img", { name })).toBeInTheDocument();
    }
  );

  it("lets a consumer name a bare dot", () => {
    render(<StatusDot tone="open" aria-label="Sector 57 is open" />);
    expect(screen.getByRole("img", { name: "Sector 57 is open" })).toBeInTheDocument();
  });

  it.each([
    ["open", "text-status-success"],
    ["busy", "text-status-warning"],
    ["closed", "text-ink-400"],
    ["live", "text-pink-500"],
    ["danger", "text-status-danger"],
  ] as const)("colours the %s diamond with %s", (tone, colour) => {
    const { container } = render(<StatusDot tone={tone} />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass(colour);
  });

  it("draws a rotated diamond carrying the counter-rotated brand mark", () => {
    const { container } = render(<StatusDot />);
    const diamond = container.firstElementChild?.firstElementChild?.lastElementChild;
    expect(diamond).toHaveClass("rotate-45", "rounded-status-dot", "bg-current", "overflow-hidden");
    expect(diamond?.querySelector("svg")).toHaveClass(
      "size-4/5",
      "-rotate-45",
      "text-ink-000",
      "opacity-66"
    );
  });

  it.each([
    ["sm", "size-status-dot-sm"],
    ["md", "size-status-dot-md"],
  ] as const)("sizes %s with %s", (size, sizeClass) => {
    const { container } = render(<StatusDot size={size} />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass(sizeClass);
  });

  it("is 14px (sm) by default", () => {
    const { container } = render(<StatusDot />);
    expect(container.firstElementChild?.firstElementChild).toHaveClass("size-status-dot-sm");
  });

  it("pulses only when isPulsing — unrotated (the keyframes rotate it) and hidden under reduced motion", () => {
    const { container, rerender } = render(<StatusDot tone="live" label="On the tandoor" />);
    const dot = () => container.firstElementChild?.firstElementChild;
    expect(dot()?.children).toHaveLength(1);
    rerender(<StatusDot tone="live" label="On the tandoor" isPulsing />);
    expect(dot()?.children).toHaveLength(2);
    const pulse = dot()?.firstElementChild;
    expect(pulse).toHaveClass("animate-dot-pulse", "motion-reduce:hidden", "bg-current");
    expect(pulse).not.toHaveClass("rotate-45");
  });

  it("merges a consumer className", () => {
    render(<StatusDot label="Opens 9am" className="ml-2" />);
    expect(screen.getByText("Opens 9am").parentElement).toHaveClass("ml-2", "gap-2");
  });

  it("lets a consumer className replace the gap", () => {
    render(<StatusDot tone="closed" label="Opens 9am" className="gap-4" />);
    const root = screen.getByText("Opens 9am").parentElement;
    expect(root).toHaveClass("gap-4");
    expect(root).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <StatusDot tone="open" label="Open till 11:30pm" />
        <StatusDot tone="live" label="On the tandoor" isPulsing />
        <StatusDot tone="closed" size="md" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: FAIL — `Failed to resolve import "./status-dot"`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/status-dot/status-dot.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

export interface StatusDotProps extends ComponentProps<"span"> {
  tone?: "open" | "busy" | "closed" | "live" | "danger";
  /** Visible state text. Without it the dot is announced by its tone ("Open"). */
  label?: string;
  /** The expanding pulse — live orders only. Hidden under reduced motion. */
  isPulsing?: boolean;
  /** sm 14px (default) · md 16px. */
  size?: "sm" | "md";
}

/** A bare dot's accessible name: state is never conveyed by colour alone (spec §5.5). */
const TONE_NAME = {
  open: "Open",
  busy: "Busy",
  closed: "Closed",
  live: "Live",
  danger: "Attention",
} as const;

/*
 * The dot sets the tone as `currentColor`; the diamond and the pulse paint `bg-current`, the mark
 * inside is white. The pulse carries no rotate class: `pp-dot-pulse` rotates it in its keyframes.
 */
const statusDot = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    dot: "relative shrink-0",
    pulse: "rounded-status-dot absolute inset-0 animate-dot-pulse bg-current motion-reduce:hidden",
    diamond:
      "rounded-status-dot absolute inset-0 grid rotate-45 place-items-center overflow-hidden bg-current",
    mark: "size-4/5 -rotate-45 text-ink-000 opacity-66",
    label: "text-status-dot-label font-body text-text-body",
  },
  variants: {
    tone: {
      open: { dot: "text-status-success" },
      busy: { dot: "text-status-warning" },
      closed: { dot: "text-ink-400" },
      live: { dot: "text-pink-500" },
      danger: { dot: "text-status-danger" },
    },
    size: { sm: { dot: "size-status-dot-sm" }, md: { dot: "size-status-dot-md" } },
  },
  defaultVariants: { tone: "open", size: "sm" },
});

/** Outlet open/closed and live-order state: a brand diamond with the mark inside it. */
export function StatusDot({
  tone = "open",
  label,
  isPulsing = false,
  size,
  className,
  ...props
}: StatusDotProps) {
  const slots = statusDot({ tone, size });
  const bareName = label === undefined ? { role: "img", "aria-label": TONE_NAME[tone] } : undefined;
  return (
    <span className={slots.root({ className })} {...bareName} {...props}>
      <span aria-hidden className={slots.dot()}>
        {isPulsing ? <span className={slots.pulse()} /> : null}
        <span className={slots.diamond()}>
          <SymbolMark className={slots.mark()} />
        </span>
      </span>
      {label === undefined ? null : <span className={slots.label()}>{label}</span>}
    </span>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -6`
Expected: PASS.

- [ ] **Step 6: Stories**

Card rows (`StatusDot.card.html`): `tone` (open "Open till 11:30pm", busy "Kitchen is busy", closed "Opens 9am"), `pulse` (→ `isPulsing`, live "On the tandoor"), `bare` (size 16 → `size="md"`: open, busy, closed, danger). Dev parity adds a labelled `danger` row, `Sizes` and `OutletStrip`.

`packages/ui/src/atoms/status-dot/status-dot.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusDot } from "./status-dot";

const meta = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  args: { tone: "open", label: "Open till 11:30pm", size: "sm" },
  parameters: {
    docs: {
      description: {
        component:
          'Outlet open/closed state and live order state. A rotated diamond with the brand mark inside, not a circle — the brand shape carries all the way down. `isPulsing` is for live orders only (and stops under reduced motion). State is never colour alone: give a `label`, or a bare dot is announced by its tone ("Open"), which `aria-label` can override.',
      },
    },
  },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  name: "tone",
  render: () => (
    <div className="grid gap-2.5">
      <StatusDot tone="open" label="Open till 11:30pm" />
      <StatusDot tone="busy" label="Kitchen is busy" />
      <StatusDot tone="closed" label="Opens 9am" />
      <StatusDot tone="danger" label="Not taking orders" />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <StatusDot size="sm" label="Small (14px)" />
      <StatusDot size="md" label="Medium (16px)" />
    </div>
  ),
};

export const Pulse: Story = {
  name: "isPulsing",
  args: { tone: "live", label: "On the tandoor", isPulsing: true },
};

export const Bare: Story = {
  name: 'bare (size="md", no label)',
  render: () => (
    <div className="flex items-center gap-3">
      <StatusDot tone="open" size="md" />
      <StatusDot tone="busy" size="md" />
      <StatusDot tone="closed" size="md" />
      <StatusDot tone="danger" size="md" />
    </div>
  ),
};

/** In context: the outlet strip under the header. */
export const OutletStrip: Story = {
  name: "in context: outlet strip",
  render: () => (
    <div className="grid justify-items-start gap-3 rounded-lg bg-surface-sunken p-4">
      <StatusDot tone="open" label="Sector 57 — open till 11:30pm" />
      <StatusDot tone="busy" label="Kitchen is busy — about 25 minutes" />
      <StatusDot tone="live" label="Your order is on the tandoor" isPulsing />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { StatusDot, type StatusDotProps } from "./atoms/status-dot/status-dot";
```

- [ ] **Step 8: Gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/status-dot packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/status-dot.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static
pnpm nx run @pink-paprikaa-web/storybook:build
```

Expected: green; Storybook builds.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the StatusDot atom, the brand diamond as a state marker

Five tones, two sizes and the live pulse. The pulse is left unrotated
because its keyframes rotate it, and hidden under reduced motion so it never
lingers as a square. A bare dot is announced by its tone, so state is never
colour alone.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

