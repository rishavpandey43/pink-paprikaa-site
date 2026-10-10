### Task 8: The Motion group

Sources: `guidelines/{motion,states,form-states}.card.html`, readme §3.7, §3.8, spec §3.2.4 (section reveal), D15.

**Files:**

- Create: `apps/storybook/src/foundations/motion/{motion.stories.tsx,motion.mdx,states.mdx,form-states.mdx,section-reveal.mdx}`

**Dev reference:** `git show dev:packages/ui/src/docs/space-shape-motion.mdx` (§ Motion, § Reduced motion)

**Dev parity:**

| Dev item                                                                                 | Ruling  | Where / spec clause                                                                                     |
| ---------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Short and matter-of-fact; fades always pair with a small translate                       | ALREADY | `motion.mdx`                                                                                            |
| Duration table with "used for" (press, hover, state changes, sheets/pages)               | ALREADY | `MotionTokens` (token descriptions) + `motion.mdx` / `states.mdx` prose                                 |
| Easing table with "used for"; `ease-pop` has one overshoot, add-to-cart and rewards only | ALREADY | `MotionTokens`, `motion.mdx`                                                                            |
| "Durations, side by side": one curve, four durations, the same distance                  | ADD     | Step 1 `Durations` + `motion.mdx`                                                                       |
| "Easings, side by side"                                                                  | ALREADY | `Easings` (each curve on the duration it ships with)                                                    |
| "Animations, running": every keyframe live, captioned by utility and use                 | ADD     | Step 1 `Animations` (play asserts each block runs its keyframe) + `motion.mdx`                          |
| August keyframes `pp-spin`, `pp-pulse`, `pp-shimmer`, `pp-rise`, `pp-fade`               | DROP    | D1 / spec §6.5: the design system's seven (`pp-rotate`, `pp-mark-pulse`, `pp-skeleton`, …) replace them |
| Entrance animations play once on mount — reload to see them again                        | ADD     | Step 2 `motion.mdx`                                                                                     |
| Reduced motion is global in the base layer; keep the fade, drop the movement             | ALREADY | `motion.mdx`, `section-reveal.mdx`                                                                      |
| How to check it: turn on the OS "Reduce motion" setting and reload                       | ADD     | Step 2 `motion.mdx`                                                                                     |
| Tracks animate on hover                                                                  | ALREADY | `MotionDemo` is a button toggle — keyboard-operable, `aria-pressed`                                     |
| Class names `duration-(--duration-*)`, `translate-x-[calc(…)]`, `rounded-6`              | DROP    | Spec §11.2 `no-arbitrary-value` / R23; D4                                                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `MotionDemo`, `TokenTable`, `requireElement` (docs-kit); `Button`, `Field`, `Input`, `RevealObserver` (ui); `OUTLET`.
- Produces: `Motion/Specimens` → `Durations`, `Easings`, `Animations`, `MotionTokens`, `States`, `StateTokens`, `FormStates`, `SectionReveal`; four pages under `Motion/`.

- [ ] **Step 1: The Motion specimens**

Create `apps/storybook/src/foundations/motion/motion.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone, Search } from "lucide-react";
import { expect, waitFor } from "storybook/test";

import { Button, Field, Input, RevealObserver } from "@pink-paprikaa-web/ui";

import { requireElement } from "../../docs-kit/dom";
import { MotionDemo } from "../../docs-kit/motion-demo";
import { TokenTable } from "../../docs-kit/token-table";
import { OUTLET } from "../../kits/fixtures";

/** Live visuals for the Motion pages. Hidden from the sidebar; rendered by the MDX; run by storybook:test. */
const meta = {
  title: "Motion/Specimens",
  tags: ["!dev", "!autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const REVEAL_SECTIONS = [1, 2, 3, 4, 5, 6];

/** The design system's seven keyframes (packages/ui styles.css), by the utility that runs each. */
const ANIMATIONS = [
  ["animate-rotate", "Button isLoading"],
  ["animate-mark-pulse", "Spinner, loading fields"],
  ["animate-spin-pulse", "the diamond pulse"],
  ["animate-dot-pulse", "StatusDot isPulsing"],
  ["animate-skeleton", "Skeleton blocks"],
  ["animate-sheet-in", "sheets, dialogs, snackbars — once"],
  ["animate-toast-pop", "Toast isPop — once"],
] as const;

export const Durations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MotionDemo ease="out" duration="instant" use="press" />
      <MotionDemo ease="out" duration="fast" use="hovers" />
      <MotionDemo ease="out" duration="base" use="state changes" />
      <MotionDemo ease="out" duration="slow" use="sheets, page transitions, section reveal" />
    </div>
  ),
};

export const Easings: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <MotionDemo ease="out" duration="fast" use="hovers and anything entering" />
      <MotionDemo ease="in-out" duration="base" use="moves and state changes" />
      <MotionDemo ease="entrance" duration="slow" use="sheets" />
      <MotionDemo ease="pop" duration="base" use="add-to-cart and rewards only" />
    </div>
  ),
};

export const Animations: Story = {
  render: () => (
    <ul aria-label="Animations" className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {ANIMATIONS.map(([utility, use]) => (
        <li key={utility} className="flex flex-col items-center gap-2 text-center">
          <span
            aria-hidden
            data-animation={utility}
            className={`size-10 rounded-md bg-pink-500 ${utility}`}
          />
          <span className="font-mono text-mono text-text-heading">{utility}</span>
          <span className="text-caption text-text-subtle">{use}</span>
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    // A renamed utility or keyframe would leave its block still; fail instead.
    for (const [utility] of ANIMATIONS) {
      const block = requireElement(canvasElement, `[data-animation="${utility}"]`);
      await expect(getComputedStyle(block).animationName).toBe(utility.replace("animate-", "pp-"));
    }
  },
};

export const MotionTokens: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TokenTable caption="Durations" selection={{ prefix: "duration-" }} />
      <TokenTable caption="Easings" selection={{ prefix: "ease-" }} />
      <TokenTable caption="Press, lift and reveal" selection={{ prefix: "motion-" }} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button>Order Now</Button>
      <Button variant="secondary">See Full Menu</Button>
      <Button disabled>Order Now</Button>
    </div>
  ),
};

export const StateTokens: Story = {
  render: () => (
    <TokenTable
      caption="Hover, press and disabled"
      selection={{
        names: [
          "color-brand-hover",
          "color-brand-active",
          "motion-press-scale",
          "duration-instant",
          "duration-fast",
          "color-ink-200",
          "color-ink-400",
        ],
      }}
    />
  ),
};

export const FormStates: Story = {
  render: () => (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Mobile number" hint="We text your pickup code here.">
        {(control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />}
      </Field>
      <Field label="Mobile number" status="error" message="Enter a 10-digit mobile number.">
        {(control) => (
          <Input {...control} type="tel" icon={Phone} status="error" defaultValue="98765" />
        )}
      </Field>
      <Field label="Coupon" status="success" message="PAPRIKAA50 applied to your order.">
        {(control) => <Input {...control} status="success" defaultValue="PAPRIKAA50" />}
      </Field>
      <Field
        label="Pickup time"
        status="warning"
        message="The kitchen is busy — pickup may take longer."
      >
        {(control) => <Input {...control} status="warning" defaultValue="8:30pm" />}
      </Field>
      <Field label="Outlet">
        {(control) => (
          <Input {...control} defaultValue={`${OUTLET.name}, ${OUTLET.city}`} disabled />
        )}
      </Field>
      <Field label="Order code">
        {(control) => <Input {...control} defaultValue="PPK-4821" readOnly />}
      </Field>
      <Field label="Search the menu">
        {(control) => (
          <Input {...control} type="search" icon={Search} defaultValue="paneer" isLoading />
        )}
      </Field>
    </div>
  ),
};

function RevealDemo() {
  return (
    <div data-reveal-demo className="flex flex-col gap-4">
      <RevealObserver selector="[data-reveal-demo] > section" />
      {REVEAL_SECTIONS.map((index) => (
        <section
          key={index}
          aria-label={`Section ${String(index)}`}
          className="flex h-60 items-center justify-center rounded-lg bg-surface-page-alt"
        >
          <span className="font-display text-h3 text-text-heading">Section {index}</span>
        </section>
      ))}
    </div>
  );
}

export const SectionReveal: Story = {
  render: () => <RevealDemo />,
  play: async ({ canvasElement }) => {
    const first = requireElement(canvasElement, "[data-reveal-demo] > section:first-of-type");
    const last = requireElement(canvasElement, "[data-reveal-demo] > section:last-of-type");
    // Below the fold: hidden until it scrolls in. Above the fold: never touched (no LCP cost).
    await waitFor(() => expect(last).toHaveAttribute("data-pp-reveal"));
    await expect(first).not.toHaveAttribute("data-pp-reveal");
    last.scrollIntoView();
    await waitFor(() => expect(last).toHaveAttribute("data-pp-revealed"));
  },
};
```

- [ ] **Step 2: The Motion pages**

Create `apps/storybook/src/foundations/motion/motion.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/Motion" />

{/* source: guidelines/motion.card.html */}

# Duration & easing

Short and matter-of-fact. Hovers run on `duration-fast`, state changes on `duration-base`, sheets
and page transitions on `duration-slow`.

One curve, four durations — each dot travels the same track, so the difference is something you
feel rather than read:

<Canvas of={Specimens.Durations} meta={Specimens} sourceState="none" />

Each curve on the duration it ships with:

<Canvas of={Specimens.Easings} meta={Specimens} sourceState="none" />

- `ease-out` for anything entering, `ease-in-out` for moves, `ease-entrance` for sheets.
- **`ease-pop` — one overshoot — is reserved for add-to-cart and reward confirmations** (`Toast
isPop`). Nowhere else; no bouncing UI.
- Fades always pair with a small translate (8–12px) — never opacity alone.
- `prefers-reduced-motion` is honoured globally: durations collapse, and reveals keep the fade but
  drop the translate.
- **CSS does every animation.** The system ships no motion library (spec D15); adding one needs a
  decision-log entry naming the component and the CSS limit it hit.

<Canvas of={Specimens.MotionTokens} meta={Specimens} sourceState="none" />

## Animations

The system's seven keyframes, running — the loader really is the brand mark pulsing, not a
borrowed ring. `animate-sheet-in` and `animate-toast-pop` are entrances: they play once on mount,
so reload the page to see them again.

<Canvas of={Specimens.Animations} meta={Specimens} sourceState="none" />

To check reduced motion, turn on the operating system's **Reduce motion** setting (macOS: System
Settings → Accessibility → Display) and reload: every specimen on this page goes still, and nothing
breaks.
```

Create `apps/storybook/src/foundations/motion/states.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/States" />

{/* source: guidelines/states.card.html */}

# Interaction states

Rest → hover (darken) → press (scale down **and** darken) → disabled (a real grey). Hover and press
the live buttons.

<Canvas of={Specimens.States} meta={Specimens} sourceState="none" />

- **Hover:** darken pink one step (`--color-brand-hover`); on white surfaces tint toward `pink-50`;
  on imagery, lift the scrim slightly. **Never fade a button on hover.**
- **Press:** `press-scale` and `--color-brand-active`, both together, on the instant duration.
- **Focus:** a 2px pink outline with a 2px offset (fields use the 3px focus ring).
- **Disabled:** an `ink-200` fill, `ink-400` text, no shadow, `cursor: not-allowed` — a real fill,
  not reduced opacity.
- **Loading:** the pink diamond symbol pulsing, or a soft pink skeleton block — never a spinner with
  a gradient.

<Canvas of={Specimens.StateTokens} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/motion/form-states.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/Form states" />

{/* source: guidelines/form-states.card.html */}

# Form states

One status system across every control: default, error, success, warning, disabled, read-only and
loading.

| State      | Border                                        | Message              | Applies to                                                               |
| ---------- | --------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `default`  | default width, `border-default`               | hint, subtle         | all                                                                      |
| `focus`    | strong width, `border-brand` + the focus ring | —                    | all                                                                      |
| `error`    | strong width, danger                          | says what to do next | Input, Select, SearchField, OtpInput, Checkbox, Radio, SlotPicker, Field |
| `success`  | strong width, mint                            | confirms the result  | Input, Select, SearchField, OtpInput, Field                              |
| `warning`  | strong width, turmeric                        | flags a caveat       | Input, Select, SearchField, Field                                        |
| `disabled` | `ink-100` fill, `ink-400` text                | —                    | all — a real fill, never opacity                                         |
| `readOnly` | sunken fill + lock glyph                      | —                    | Input, Select                                                            |
| `loading`  | unchanged                                     | trailing Spinner     | Input, SearchField                                                       |

A status raises the border, tints the leading icon, shows the matching glyph and **replaces the
hint with its message** — never a status colour without a message. The control carries `status`;
`Field` renders the message and wires `aria-describedby` and `aria-invalid`.

<Canvas of={Specimens.FormStates} meta={Specimens} sourceState="none" />
```

Create `apps/storybook/src/foundations/motion/section-reveal.mdx`:

```mdx
import { Canvas, Meta } from "@storybook/addon-docs/blocks";

import * as Specimens from "./motion.stories";

<Meta title="Motion/Section reveal" />

{/* source: spec §3.2.4 — handoff section reveal */}

# Section reveal

Sections below the fold fade and rise into view once, as they scroll in — the handoff's page
motion, shipped as CSS (`[data-pp-reveal]`) plus the tiny client `RevealObserver`. Scroll the demo.

<Canvas of={Specimens.SectionReveal} meta={Specimens} sourceState="none" />

- Mount `RevealObserver` once near the root; by default it watches every `<section>`.
- **It never hides a section already on screen**, so there is no flash and no LCP or CLS cost.
- Without `IntersectionObserver` nothing is hidden; reduced motion keeps the fade and drops the
  rise; print always shows everything.
```

- [ ] **Step 3: Gate and commit**

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- motion.stories 2>&1 | tail -12
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/foundations/motion
git commit -m "feat(storybook): the Motion foundation pages and the section reveal demo

Duration and easing demos run on the tokens, the interaction states use the
live Button, form states show every status on real Fields, and the reveal
demo proves a section below the fold waits for the scroll while one above it
is never touched.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

