### Task 10: EmptyState

Design-system sources: `components/molecules/EmptyState.*`. Card rows: symbol · icon · `size="lg"`.

**Files:**

- Create: `packages/design-tokens/tokens/component/empty-state.json`
- Create: `packages/ui/src/molecules/empty-state/empty-state.tsx`, `empty-state.test.tsx`, `empty-state.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/empty-state/empty-state.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                   | Ruling  | Where / why                                                                       |
| ---------------------------------------------------------- | ------- | --------------------------------------------------------------------------------- |
| glyph drawn at 32px in pink-300                            | ADD     | assertions in the glyph test                                                      |
| `md` padding (`py-10`) as well as `lg`                     | ADD     | size test                                                                         |
| caller `className` merges                                  | ADD     | test "merges a caller className…"                                                 |
| `InCart` story (inside a cart panel, one action)           | ADD     | `InCart` story                                                                    |
| default title "Nothing here yet." / body "Let's fix that." | DROP    | spec D9 (no content defaults); contracts §5 makes `title` required                |
| `hasSymbol` boolean                                        | ALREADY | `variant="symbol"` (spec §8.2, contracts §5)                                      |
| title as a `<p>`                                           | ALREADY | a real heading at `headingLevel` (default 3, deviation 14)                        |
| caller copy; symbol hidden from AT; one action; axe        | ALREADY | tests "titles itself…", "shows the brand diamond…", "renders its one action", axe |
| `Default`, `Symbol`, `WithIcon`, `Sizes` stories           | ALREADY | `Playground` (symbol + action), `WithIcon`, `Large`                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `SymbolMark` (Plan 2a, `lib/symbol-mark.tsx` — the brand symbol as the shared `mask-symbol` CSS mask in `currentColor`, always decorative; ruling R19); `headingTag` / `HeadingLevel`; `Button` (stories).
- Produces: `EmptyState`, `EmptyStateProps` — contract §5 (deviations 8, 14). No default copy: `title` is required (spec D9).

- [ ] **Step 1: Component token**

`packages/design-tokens/tokens/component/empty-state.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "empty-state-symbol-lg": {
      "$value": "52px",
      "$description": "EmptyState size=\"lg\" brand symbol box (md is 40px, a spacing step)."
    }
  }
}
```

Append `"empty-state-symbol-lg"` to `SPACING`. Rebuild tokens and run the variant spec.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/empty-state/empty-state.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Search } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("titles itself with a level-3 heading by default and says what to do next", () => {
    render(<EmptyState title="Nothing here yet." body="Let's fix that." />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Nothing here yet." })
    ).toBeInTheDocument();
    expect(screen.getByText("Let's fix that.")).toHaveClass(
      "text-text-muted",
      "max-w-text-measure-narrow"
    );
  });

  it("takes the heading level its page needs", () => {
    render(<EmptyState title="No orders yet." headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "No orders yet." })).toBeInTheDocument();
  });

  it("shows the utensils glyph by default, or the glyph it is given, at 32px in pink-300", () => {
    const { container, rerender } = render(<EmptyState title="Nothing here yet." />);
    expect(container.querySelector("svg.lucide-utensils")).toBeInTheDocument();
    rerender(<EmptyState title="Nothing matches that yet." icon={Search} />);
    const glyph = container.querySelector("svg.lucide-search");
    expect(glyph).toBeInTheDocument();
    expect(glyph?.parentElement).toHaveClass("size-icon-xl", "text-pink-300");
  });

  it("shows the brand diamond, hidden from assistive tech, for the symbol variant", () => {
    const { container } = render(<EmptyState title="Nothing here yet." variant="symbol" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    const symbol = container.querySelector(".mask-symbol");
    expect(symbol).toHaveAttribute("aria-hidden", "true");
    expect(symbol).toHaveClass("text-pink-500", "size-10");
    expect(container.innerHTML).not.toContain("<path");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders its one action", () => {
    render(<EmptyState title="Nothing here yet." action={<a href="/menu">Browse the Menu</a>} />);
    expect(screen.getByRole("link", { name: "Browse the Menu" })).toBeInTheDocument();
  });

  it("merges a caller className over its padding", () => {
    const { container } = render(<EmptyState title="Nothing here yet." className="py-2" />);
    expect(container.firstElementChild).toHaveClass("py-2");
    expect(container.firstElementChild).not.toHaveClass("py-10");
  });

  it("grows for size lg", () => {
    const { container, rerender } = render(<EmptyState title="No orders yet." variant="symbol" />);
    expect(container.firstElementChild).toHaveClass("py-10");
    rerender(<EmptyState title="No orders yet." size="lg" variant="symbol" />);
    expect(container.firstElementChild).toHaveClass("py-16");
    expect(screen.getByRole("heading")).toHaveClass("text-h3");
    expect(container.querySelector(".mask-symbol")).toHaveClass("size-empty-state-symbol-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <EmptyState
        variant="symbol"
        title="Nothing here yet."
        body="Let's fix that."
        action={<a href="/menu">Browse the Menu</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/empty-state 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./empty-state`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/empty-state/empty-state.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Utensils } from "lucide-react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { SymbolMark } from "../../lib/symbol-mark";

const emptyState = componentVariants({
  slots: {
    root: "grid justify-items-center gap-2.5 text-center",
    symbol: "mb-1 text-pink-500 opacity-85",
    icon: "mb-1 text-pink-300",
    title: "m-0 font-display text-text-heading",
    body: "max-w-text-measure-narrow m-0 text-body-sm text-text-muted",
    action: "mt-2",
  },
  variants: {
    size: {
      md: { root: "px-5 py-10", symbol: "size-10", title: "text-h4" },
      lg: {
        root: "px-6 py-16",
        symbol: "size-empty-state-symbol-lg",
        icon: "size-10",
        title: "text-h3",
      },
    },
  },
  defaultVariants: { size: "md" },
});

export interface EmptyStateProps extends Omit<ComponentProps<"div">, "title"> {
  /** Short and plain: "Nothing here yet." */
  title: ReactNode;
  /** One line that says what to do next. */
  body?: ReactNode;
  /** Lucide glyph for the icon variant (default Utensils). */
  icon?: IconComponent | undefined;
  /** `symbol` uses the brand diamond instead of a glyph — the warmer option. */
  variant?: "icon" | "symbol" | undefined;
  /** Exactly one action, usually a Button — never two. */
  action?: ReactNode;
  size?: "md" | "lg" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** Empty cart, no search results, no orders yet. Always says what to do next; never apologetic. */
export function EmptyState({
  title,
  body,
  icon = Utensils,
  variant = "icon",
  action,
  size = "md",
  headingLevel = 3,
  className,
  ...props
}: EmptyStateProps) {
  const Heading = headingTag(headingLevel);
  const styles = emptyState({ size });

  return (
    <div className={styles.root({ className })} {...props}>
      {variant === "symbol" ? (
        <SymbolMark className={styles.symbol()} />
      ) : (
        <Icon icon={icon} size="xl" className={styles.icon()} />
      )}
      <Heading className={styles.title()}>{title}</Heading>
      {body === undefined || body === null ? null : <p className={styles.body()}>{body}</p>}
      {action === undefined || action === null ? null : (
        <div className={styles.action()}>{action}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/empty-state 2>&1 | tail -8`
Expected: PASS (8 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/empty-state/empty-state.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Search, ShoppingBag } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  args: {
    variant: "symbol",
    title: "Nothing here yet.",
    body: "Let's fix that.",
    action: <Button>Browse the Menu</Button>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Empty cart, no search results, no orders yet. Copy is two short sentences and never apologetic — the title says what is missing, the body what to do next. Exactly one action, never two. `variant="symbol"` uses the brand diamond (the warmer option); otherwise a Lucide glyph (default Utensils). `headingLevel` (default 3) fits the page\'s outline.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "symbol". */
export const Playground: Story = {};

/** Card row "icon". */
export const WithIcon: Story = {
  args: {
    variant: "icon",
    icon: Search,
    title: "Nothing matches that yet.",
    body: "Try another category.",
    action: undefined,
  },
};

/** Card row `size="lg"`. */
export const Large: Story = {
  args: {
    size: "lg",
    title: "No orders yet.",
    body: "Your first order will show up here.",
    action: undefined,
  },
};

/** Dev parity: in place — inside a cart panel, with the single action that fills it. */
export const InCart: Story = {
  args: {
    title: "Your cart is empty.",
    body: "Add something from the menu and it will show up here.",
    action: <Button icon={ShoppingBag}>Browse the Menu</Button>,
  },
  render: (args) => (
    <div className="max-w-90 rounded-lg border border-border-subtle bg-surface-card">
      <EmptyState {...args} />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { EmptyState, type EmptyStateProps } from "./molecules/empty-state/empty-state";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/empty-state packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/empty-state packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/empty-state.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): EmptyState molecule

Brand diamond or Lucide glyph, a titled heading at the page's level, one
line of what to do next and a single action. No default copy.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

