### Task 5: LoyaltyCard

**Files:**

- Create: `packages/ui/src/molecules/loyalty-card/loyalty-card.tsx`, `loyalty-card.test.tsx`, `loyalty-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/loyalty-card/loyalty-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                     | Ruling  | Where, or the spec clause                                                                               |
| ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------- |
| Generated sentence: many / one / none left                   | ALREADY | `it.each` "reads naturally at %i of %i visits"                                                          |
| Reads naturally with an article-first reward ("a kulfi")     | ADD     | test "reads naturally with an article-first reward"                                                     |
| One stamp per goal visit (segmented, never a percentage)     | ALREADY | test "shows the stamps as a segmented progress bar" (`aria-valuemax` = goal); ProgressBar owns segments |
| Track named for AT without printing a caption                | ADD     | same test: the "3 of 6 visits" name is `sr-only`                                                        |
| Stale count clamps to the goal                               | ALREADY | test "never shows more stamps than the goal"                                                            |
| Negative count clamps to zero                                | ALREADY | throws `RangeError` instead (deviation 11) — test "rejects an impossible count…"                        |
| Content defaults `goal = 6`, `reward = "chai"`, `visits = 0` | DROP    | D9 (no content inside the system); contract §6 makes them required                                      |
| `feature` skin on the light-pink card                        | ADD     | test "sits on the light-pink feature card by default" (`data-surface="soft"`)                           |
| `brand` skin flips the ink and the stamps                    | ALREADY | test "floods pink for the brand variant"                                                                |
| Brand symbol hidden from assistive tech                      | ADD     | test "hides the brand symbol from assistive tech…"                                                      |
| Caller `className` replaces the card radius                  | ADD     | test "lets a caller className replace the card radius"                                                  |
| axe on in-progress, complete and brand                       | ADD     | last test renders all three                                                                             |
| `min-w-0` so a long reward shrinks the copy column           | ALREADY | `body` slot; story `LongReward`                                                                         |
| Stories `Default`, `Progress`, `OnBrand`, `Skins`            | ALREADY | `Playground`, `InProgress` / `OneLeft` / `Complete`, `Brand`                                            |
| Stories `Empty`, `LongReward`                                | ADD     | stories `Empty`, `LongReward`                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Card` (`variant="feature" | "brand"`, `padding="sm"`), `Logo` (`variant="symbol"`, `isDecorative`), `ProgressBar` (`segments`, `tone="brand" | "inverse"`, `size="sm"` = 6px, `label` + `isLabelHidden` — Plan 2b deviation 3: the name stays, the words are not printed).
- Produces: `LoyaltyCard`, `type LoyaltyCardProps` (contract §6 + deviation 11). Documented defaults: `variant = "feature"`; headline "N more visit(s) and {reward} is on us." / "Your {reward} is on us."; progress label "N of M visits". Throws `RangeError` when `goal` is not a whole number ≥ 1 or `visits` not a whole number ≥ 0.

- [ ] **Step 1: Tokens** — none new (`w-8.5` = the design system's 34px mark).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/loyalty-card/loyalty-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { LoyaltyCard } from "./loyalty-card";

describe("LoyaltyCard", () => {
  it.each([
    [3, 6, "3 more visits and chai is on us."],
    [5, 6, "1 more visit and chai is on us."],
    [6, 6, "Your chai is on us."],
  ])("reads naturally at %i of %i visits", (visits, goal, headline) => {
    render(<LoyaltyCard visits={visits} goal={goal} reward="chai" />);
    expect(screen.getByText(headline)).toBeInTheDocument();
  });

  it("reads naturally with an article-first reward", () => {
    render(<LoyaltyCard visits={2} goal={6} reward="a kulfi" />);
    expect(screen.getByText("4 more visits and a kulfi is on us.")).toBeInTheDocument();
  });

  it("lets the page replace the generated headline", () => {
    render(<LoyaltyCard visits={2} goal={6} reward="a kulfi" headline="Two down, four to go." />);
    expect(screen.getByText("Two down, four to go.")).toBeInTheDocument();
  });

  it("shows the stamps as a segmented progress bar", () => {
    render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    const stamps = screen.getByRole("progressbar", { name: "3 of 6 visits" });
    expect(stamps).toHaveAttribute("aria-valuenow", "3");
    expect(stamps).toHaveAttribute("aria-valuemax", "6");
    // The name is announced, never printed: the sentence above already says it.
    expect(screen.getByText("3 of 6 visits")).toHaveClass("sr-only");
  });

  it("never shows more stamps than the goal", () => {
    render(<LoyaltyCard visits={9} goal={6} reward="chai" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "6");
    expect(screen.getByText("Your chai is on us.")).toBeInTheDocument();
  });

  it("sits on the light-pink feature card by default", () => {
    const { container } = render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "soft");
  });

  it("hides the brand symbol from assistive tech — the sentence carries the meaning", () => {
    const { container } = render(<LoyaltyCard visits={3} goal={6} reward="chai" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("lets a caller className replace the card radius", () => {
    const { container } = render(
      <LoyaltyCard visits={3} goal={6} reward="chai" className="rounded-lg" />
    );
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-xl");
  });

  it("floods pink for the brand variant", () => {
    const { container } = render(
      <LoyaltyCard visits={2} goal={6} reward="a kulfi" variant="brand" />
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "brand");
  });

  it.each([[{ visits: 1, goal: 0 }], [{ visits: 1, goal: 2.5 }], [{ visits: -1, goal: 6 }]])(
    "rejects an impossible count %o instead of drawing nonsense",
    (counts) => {
      // A server component is a plain function: call it to see the throw without a React error boundary.
      expect(() => LoyaltyCard({ ...counts, reward: "chai" })).toThrow(RangeError);
    }
  );

  it("has no accessibility violations in progress, complete and on brand", async () => {
    const { container } = render(
      <>
        <LoyaltyCard visits={3} goal={6} reward="chai" />
        <LoyaltyCard visits={6} goal={6} reward="chai" />
        <LoyaltyCard visits={2} goal={6} reward="a kulfi" variant="brand" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- loyalty-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./loyalty-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/loyalty-card/loyalty-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { ProgressBar } from "../../atoms/progress-bar/progress-bar";
import { componentVariants } from "../../lib/component-variants";

const loyaltyCard = componentVariants({
  slots: {
    root: "flex items-center gap-3.5",
    mark: "w-8.5 shrink-0",
    body: "grid min-w-0 flex-1 gap-2",
    headline: "m-0 max-w-none font-display text-body-sm font-bold text-text-heading",
  },
});

export interface LoyaltyCardProps extends ComponentProps<"div"> {
  visits: number;
  goal: number;
  /** What the guest earns, lowercase: "chai", "a kulfi". */
  reward: string;
  variant?: "feature" | "brand" | undefined;
  /** Replaces the generated sentence. */
  headline?: ReactNode | undefined;
}

function assertCount(value: number, minimum: number, name: string): void {
  if (!Number.isInteger(value) || value < minimum) {
    throw new RangeError(
      `LoyaltyCard: ${name} must be a whole number ≥ ${String(minimum)}, got ${String(value)}`
    );
  }
}

/** Design-system copy: reads naturally at many, one and zero visits left. */
function defaultHeadline(remaining: number, reward: string): string {
  if (remaining === 0) return `Your ${reward} is on us.`;
  const visits = remaining === 1 ? "visit" : "visits";
  return `${String(remaining)} more ${visits} and ${reward} is on us.`;
}

/** The loyalty stamp card on the app home and account screen. Segmented progress only. */
export function LoyaltyCard({
  visits,
  goal,
  reward,
  variant = "feature",
  headline,
  className,
  ...props
}: LoyaltyCardProps) {
  assertCount(goal, 1, "goal");
  assertCount(visits, 0, "visits");
  const stamped = Math.min(visits, goal);
  const isBrand = variant === "brand";
  const styles = loyaltyCard();

  return (
    <Card variant={variant} padding="sm" className={styles.root({ className })} {...props}>
      <Logo
        variant="symbol"
        tone={isBrand ? "white" : "pink"}
        isDecorative
        className={styles.mark()}
      />
      <div className={styles.body()}>
        <p className={styles.headline()}>{headline ?? defaultHeadline(goal - stamped, reward)}</p>
        <ProgressBar
          value={stamped}
          max={goal}
          segments={goal}
          label={`${String(stamped)} of ${String(goal)} visits`}
          isLabelHidden
          tone={isBrand ? "inverse" : "brand"}
          size="sm"
        />
      </div>
    </Card>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- loyalty-card 2>&1 | tail -8`
Expected: PASS (15 tests).

- [ ] **Step 6: Stories — the four `LoyaltyCard.card.html` rows**

`packages/ui/src/molecules/loyalty-card/loyalty-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoyaltyCard } from "./loyalty-card";

const meta = {
  title: "Molecules/LoyaltyCard",
  component: LoyaltyCard,
  args: { visits: 3, goal: 6, reward: "chai" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The loyalty stamp card on the app home and account screen. The sentence is generated so it always reads naturally at many, one and zero visits left (`headline` replaces it). Segmented ProgressBar only — never a percentage bar here.",
      },
    },
  },
} satisfies Meta<typeof LoyaltyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "in progress". */
export const InProgress: Story = {};

/** Card row "one left" — the copy adapts. */
export const OneLeft: Story = { args: { visits: 5 } };

/** Card row "complete". */
export const Complete: Story = { args: { visits: 6 } };

/** Card row `variant="brand"`. */
export const Brand: Story = { args: { variant: "brand", visits: 2, reward: "a kulfi" } };

/** Nothing earned yet: every stamp empty, and the sentence still reads plainly. */
export const Empty: Story = { args: { visits: 0 } };

/** A longer reward shrinks the copy column instead of pushing the stamps off the card. */
export const LongReward: Story = { args: { visits: 4, goal: 8, reward: "a gulkand kulfi" } };
```

- [ ] **Step 7: Export**

```ts
export { LoyaltyCard, type LoyaltyCardProps } from "./molecules/loyalty-card/loyalty-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/loyalty-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/loyalty-card packages/ui/src/index.ts
git commit -m "feat(ui): LoyaltyCard molecule

Stamp card with segmented progress and the design system's generated
sentence (many / one / zero left), overridable by headline. Impossible
counts throw instead of drawing nonsense.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

