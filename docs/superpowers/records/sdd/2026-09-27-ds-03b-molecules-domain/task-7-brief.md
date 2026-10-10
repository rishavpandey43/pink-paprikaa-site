### Task 7: LogoLockup

**Files:**

- Create: `packages/ui/src/molecules/logo-lockup/logo-lockup.tsx`, `logo-lockup.test.tsx`, `logo-lockup.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/logo-lockup/logo-lockup.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                | Ruling  | Where, or the spec clause                                                                         |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Mark named for assistive tech                                           | ALREADY | test "signs the artwork…" (Logo's default title)                                                  |
| Tagline set once, beside the wordmark as text                           | ALREADY | the tagline is drawn into the lockup artwork (spec §7.1), so it scales with the mark              |
| `tagline` override; story `AlternateTagline`                            | DROP    | spec §7.1 / §9.2 — the tagline is supplied artwork, not copy; contract §6 has no `tagline`        |
| `hasTagline={false}` → bare wordmark                                    | ALREADY | test "drops to the wordmark…"                                                                     |
| `label=""` hides the mark when the artwork already names the brand      | ADD     | `isDecorative` (deviation 18); test "hides the logo from assistive tech…"                         |
| Mark re-heighted per size; 140px wordmark floor                         | ALREADY | widths 200 / 240 / 280 / 360 (deviation 12); 200 is the lockup minimum                            |
| Clear space per size                                                    | ALREADY | `it.each` size test (`p-8` … `p-15`)                                                              |
| `hasClearSpace={false}` when the parent already reserves it             | ALREADY | `className="p-0"` replaces the padding (merge); test "drops its clear space…"; story `ClearSpace` |
| `white` tone; `align="center"`                                          | ALREADY | tests "signs the artwork…", "centres the signature…"                                              |
| Default tone `brand`                                                    | DROP    | D2 — the design system's default is `white` (deviation 12)                                        |
| Caller `className` merges                                               | ADD     | test "drops its clear space…" (`p-0` replaces `p-10`)                                             |
| axe on pink, white-centred-lg and decorative wordmark                   | ADD     | last test renders all three                                                                       |
| Stories `Default`, `Sizes`, `OnBrand`, `CentredOnInk`, `WithoutTagline` | ALREADY | `Playground` / `Pink`, `Sizes`, `White`, `Centred`, `Wordmark`                                    |
| Story `ClearSpace`                                                      | ADD     | story `ClearSpace`                                                                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Logo` (`variant="lockup" | "wordmark"`, `tone`, `isDecorative`, width via `className` — Plan 1 Task 7 proves a consumer width class replaces `w-logo-lockup`).
- Produces: `LogoLockup`, `type LogoLockupProps` (contract §6 + deviations 12 and 18). Defaults: `tone = "white"`, `size = "md"`, `hasTagline = true`, `align = "start"`, `isDecorative = false`.

- [ ] **Step 1: Tokens** — none new. Widths and clear space are 4px-scale steps:

| `size` | width (kits)        | class  | clear space ≈ width ÷ 6 | class  |
| ------ | ------------------- | ------ | ----------------------- | ------ |
| `sm`   | 200 (the minimum)   | `w-50` | 33 → 32                 | `p-8`  |
| `md`   | 240 (Logo default)  | `w-60` | 40                      | `p-10` |
| `lg`   | 280 (feed/ad kits)  | `w-70` | 47 → 48                 | `p-12` |
| `xl`   | 360 (wide canvases) | `w-90` | 60                      | `p-15` |

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/logo-lockup/logo-lockup.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LogoLockup } from "./logo-lockup";

describe("LogoLockup", () => {
  it("signs the artwork with the white lockup, tagline included, by default", () => {
    render(<LogoLockup />);
    const logo = screen.getByRole("img", { name: "Pink Paprikaa — India's First Desi Urban Café" });
    expect(logo).toHaveClass("text-ink-000", "w-60");
  });

  it("drops to the wordmark when the tagline cannot read", () => {
    render(<LogoLockup hasTagline={false} />);
    expect(screen.getByRole("img", { name: "Pink Paprikaa" })).toBeInTheDocument();
  });

  it.each([
    ["sm", "w-50", "p-8"],
    ["md", "w-60", "p-10"],
    ["lg", "w-70", "p-12"],
    ["xl", "w-90", "p-15"],
  ] as const)("at size %s is %s wide with %s of clear space", (size, width, padding) => {
    const { container } = render(<LogoLockup size={size} />);
    expect(container.firstElementChild).toHaveClass(padding);
    expect(screen.getByRole("img")).toHaveClass(width);
  });

  it("paints the pink tone on light artwork", () => {
    render(<LogoLockup tone="pink" />);
    expect(screen.getByRole("img")).toHaveClass("text-pink-500");
  });

  it("centres the signature when asked", () => {
    const { container } = render(<LogoLockup align="center" />);
    expect(container.firstElementChild).toHaveClass("justify-items-center");
  });

  it("hides the logo from assistive tech when the artwork already names the brand", () => {
    render(<LogoLockup isDecorative />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("drops its clear space when the parent already reserves it", () => {
    const { container } = render(<LogoLockup className="p-0" />);
    expect(container.firstElementChild).toHaveClass("p-0");
    expect(container.firstElementChild).not.toHaveClass("p-10");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <LogoLockup tone="pink" />
        <LogoLockup tone="white" align="center" size="lg" />
        <LogoLockup tone="pink" size="sm" hasTagline={false} isDecorative />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- logo-lockup 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./logo-lockup`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/logo-lockup/logo-lockup.tsx`:

```tsx
import type { ComponentProps } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants } from "../../lib/component-variants";

const logoLockup = componentVariants({
  slots: { root: "grid", logo: "" },
  variants: {
    // Clear space around the logo = the height of its "P" ≈ one sixth of the lockup's width.
    size: {
      sm: { root: "p-8", logo: "w-50" },
      md: { root: "p-10", logo: "w-60" },
      lg: { root: "p-12", logo: "w-70" },
      xl: { root: "p-15", logo: "w-90" },
    },
    align: {
      start: { root: "justify-items-start" },
      center: { root: "justify-items-center" },
    },
  },
});

export interface LogoLockupProps extends ComponentProps<"div"> {
  /** `white` on pink, ink or photography; `pink` on light artwork; `badge` on its own plate. */
  tone?: "pink" | "white" | "badge" | undefined;
  /** Lockup width: 200 / 240 / 280 / 360px. Never below 200 with the tagline. */
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  /** `false` drops to the wordmark — only where the tagline cannot read. */
  hasTagline?: boolean | undefined;
  align?: "start" | "center" | undefined;
  /** Hide the logo from assistive tech when the artwork already names the brand in text nearby. */
  isDecorative?: boolean | undefined;
}

/**
 * The signature that closes a piece of marketing artwork. The tagline is part of the supplied
 * artwork, so it scales with the mark and can never drift out of sync.
 */
export function LogoLockup({
  tone = "white",
  size = "md",
  hasTagline = true,
  align = "start",
  isDecorative = false,
  className,
  ...props
}: LogoLockupProps) {
  const styles = logoLockup({ size, align });
  return (
    <div className={styles.root({ className })} {...props}>
      <Logo
        variant={hasTagline ? "lockup" : "wordmark"}
        tone={tone}
        isDecorative={isDecorative}
        className={styles.logo()}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- logo-lockup 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories — `LogoLockup.card.html` rows pink / white on brand / centred on ink / `hasTagline={false}`, plus Sizes**

`packages/ui/src/molecules/logo-lockup/logo-lockup.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { LogoLockup } from "./logo-lockup";

const meta = {
  title: "Molecules/LogoLockup",
  component: LogoLockup,
  args: { tone: "pink", size: "sm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The signature that closes a piece of marketing artwork — a post, a story, an ad. The tagline is part of the supplied logo artwork, so it scales with the mark and can never drift out of sync. Keep the lockup at 200px or wider; below that pass `hasTagline={false}` for the wordmark. On a coloured field use `tone="white"`; on light artwork `tone="pink"`. The padding is the brand\'s clear space (the height of the "P"); pass `className="p-0"` only where the parent already reserves it (a PostFrame\'s canvas pad). `isDecorative` hides the logo from assistive tech when the artwork names the brand in text nearby.',
      },
    },
  },
} satisfies Meta<typeof LogoLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "pink". */
export const Pink: Story = {};

/** Card row "white", on the brand field. */
export const White: Story = {
  args: { tone: "white" },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Card row "centred", on ink (the card's 180px snaps to the 200px minimum). */
export const Centred: Story = {
  args: { tone: "white", align: "center" },
  render: (args) => (
    <div data-surface="ink" className="w-full rounded-lg bg-surface-inverse">
      <LogoLockup {...args} />
    </div>
  ),
};

/** Card row `hasTagline={false}` — the wordmark. */
export const Wordmark: Story = { args: { hasTagline: false } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="grid justify-items-start gap-2">
          <LogoLockup
            {...args}
            size={size}
            className="border border-dashed border-border-default"
          />
          <span className="font-mono text-mono text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

/** The clear space made visible, then dropped with `className="p-0"` where the parent reserves it. */
export const ClearSpace: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-4">
      <div className="rounded-lg bg-surface-page-alt">
        <LogoLockup {...args} />
      </div>
      <div className="rounded-lg bg-surface-page-alt">
        <LogoLockup {...args} className="p-0" />
      </div>
    </div>
  ),
};
```

- [ ] **Step 7: Calibrate the clear space against the artwork**

Run `pnpm nx run @pink-paprikaa-web/storybook:serve`, open `Molecules/LogoLockup` → `Sizes`, and with DevTools measure the rendered height of the lockup's "P" (cap top to baseline) at `md`. If it is not within 10% of 40px (width ÷ 6), replace the four padding classes with the nearest 4px steps for the measured ratio (e.g. ÷ 5 → `p-10 / p-12 / p-14 / p-18`) in both the component and the test, and record the measurement in the commit body.

- [ ] **Step 8: Export**

```ts
export { LogoLockup, type LogoLockupProps } from "./molecules/logo-lockup/logo-lockup";
```

- [ ] **Step 9: Gate** — `<paths>` = `packages/ui/src/molecules/logo-lockup packages/ui/src/index.ts`.

- [ ] **Step 10: Commit**

```bash
git add packages/ui/src/molecules/logo-lockup packages/ui/src/index.ts
git commit -m "feat(ui): LogoLockup molecule

Canvas signature: the lockup artwork (tagline drawn in) at 200/240/280/
360px with the brand's clear space as padding, the wordmark below the
tagline's legible size.

<paste the P-height measurement from Step 7>

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

