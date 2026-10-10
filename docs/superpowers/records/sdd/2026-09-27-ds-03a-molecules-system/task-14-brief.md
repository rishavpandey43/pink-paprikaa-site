### Task 14: SectionHeader

Design-system sources: `components/molecules/SectionHeader.*`; handoff (every page section; `on="brand"` on pink and ink sections becomes a surface). Card rows: with action · lede · centred · `on="brand"`.

**Files:**

- Create: `packages/design-tokens/tokens/component/section-header.json`
- Create: `packages/ui/src/molecules/section-header/section-header.tsx`, `section-header.test.tsx`, `section-header.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/section-header/section-header.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                          | Ruling  | Where / why                                                                               |
| ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| every heading level 1, 3–6 renders, keeping the h2 look           | ADD     | `it.each` level test                                                                      |
| overline and lede omitted when not given (no stray top margin)    | ADD     | test "omits the overline and the lede…"                                                   |
| caller `className` merges                                         | ADD     | test "merges a caller className…"                                                         |
| `HeadingLevels` and `Narrow` (360px, action wraps) stories        | ADD     | `HeadingLevels`, `Narrow` stories                                                         |
| `on="brand"` (eyebrow, heading, lede to white)                    | DROP    | spec D5 — semantic text tokens follow the surface; `OnBrand` / `Surfaces` stories show it |
| lede at a fluid body step (`text-body1-fluid`)                    | DROP    | spec D4 / D2: the design system's lede is `--fs-body-lg` (`text-body-lg`)                 |
| default level 2 at the fluid h2 step; overline + lede; action     | ALREADY | tests "titles a section…", "sets the overline…", "renders its action…"                    |
| action dropped and prose centred when `align="center"`            | ALREADY | test "drops the action when centred"                                                      |
| `Default`, `WithAction`, `WithLede`, `Centred`, `OnBrand` stories | ALREADY | `Playground`, `WithLede`, `Centred`, `OnBrand`, `Surfaces`                                |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `headingTag` / `HeadingLevel`; `Button` (stories); `OnSurfaces` (Plan 2a, stories).
- Produces: `SectionHeader`, `SectionHeaderProps` — contract §5. No `on` prop (spec D5): the overline, heading and lede are semantic text tokens and turn light on a pink or ink field. The action is dropped when centred (design system: "Ignored when centred").

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/section-header.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "section-header-measure": {
      "$value": "48ch",
      "$description": "Width of the overline, title and lede when the header is start-aligned."
    },
    "section-header-measure-centered": {
      "$value": "56ch",
      "$description": "Width of the overline, title and lede when the header is centred."
    }
  }
}
```

Append `"section-header-measure"`, `"section-header-measure-centered"` to `SPACING`. Rebuild tokens and run the variant spec.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/section-header/section-header.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("titles a section with a fluid level-2 heading by default", () => {
    render(<SectionHeader title="Most ordered this week" />);
    expect(screen.getByRole("heading", { level: 2, name: "Most ordered this week" })).toHaveClass(
      "text-h2-fluid"
    );
  });

  it.each([1, 3, 4, 5, 6] as const)(
    "takes heading level %i when its page needs it, keeping the look",
    (level) => {
      render(<SectionHeader title="Starters, platters and snacks." headingLevel={level} />);
      expect(screen.getByRole("heading", { level })).toHaveClass("text-h2-fluid");
    }
  );

  it("omits the overline and the lede when they are not given", () => {
    const { container } = render(<SectionHeader title="Most ordered this week" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(screen.getByRole("heading")).not.toHaveClass("mt-2.5");
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(
      <SectionHeader title="Most ordered this week" className="gap-2" />
    );
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("sets the overline right above the title and the lede below it", () => {
    render(
      <SectionHeader
        overline="Our Story"
        title="A cafe that tastes like where it's from"
        lede="We started in one Gurgaon market with a chai counter and a grinder."
      />
    );
    const heading = screen.getByRole("heading");
    expect(screen.getByText("Our Story").nextElementSibling).toBe(heading);
    expect(heading.nextElementSibling).toHaveTextContent(/chai counter/);
    expect(screen.getByText("Our Story")).toHaveClass("uppercase", "text-text-brand");
  });

  it("renders its action beside the title when start-aligned", () => {
    render(<SectionHeader title="Most ordered this week" action={<a href="/menu">See All</a>} />);
    expect(screen.getByRole("link", { name: "See All" })).toBeInTheDocument();
  });

  it("drops the action when centred", () => {
    const { container } = render(
      <SectionHeader
        align="center"
        title="Find a Paprikaa"
        action={<a href="/outlets">See All</a>}
      />
    );
    expect(screen.queryByRole("link", { name: "See All" })).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("text-center");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SectionHeader
        overline="The Menu"
        title="Most ordered this week"
        lede="What Sector 57 ordered most."
        action={<a href="/menu">See All</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/section-header 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./section-header`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/section-header/section-header.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

const sectionHeader = componentVariants({
  slots: {
    root: "flex flex-wrap items-end gap-6",
    copy: "min-w-0",
    overline: "m-0 font-display text-overline text-text-brand uppercase",
    title: "m-0 font-display text-h2-fluid text-pretty text-text-heading",
    lede: "m-0 mt-3 text-body-lg text-text-muted",
    action: "shrink-0",
  },
  variants: {
    align: {
      start: { root: "justify-between text-start", copy: "max-w-section-header-measure" },
      center: {
        root: "justify-center text-center",
        copy: "max-w-section-header-measure-centered mx-auto",
      },
    },
    hasOverline: { true: { title: "mt-2.5" } },
  },
  defaultVariants: { align: "start", hasOverline: false },
});

function isShown(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

export interface SectionHeaderProps extends Omit<ComponentProps<"div">, "title"> {
  /** Uppercase eyebrow. */
  overline?: ReactNode;
  title: ReactNode;
  headingLevel?: HeadingLevel | undefined;
  /** One sentence, at most about 20 words. */
  lede?: ReactNode;
  /** Trailing element, usually a ghost Button. Not rendered when centred. */
  action?: ReactNode;
  align?: "start" | "center" | undefined;
}

/** The standard section opener — every page section starts with one. */
export function SectionHeader({
  overline,
  title,
  headingLevel = 2,
  lede,
  action,
  align = "start",
  className,
  ...props
}: SectionHeaderProps) {
  const Heading = headingTag(headingLevel);
  const hasOverline = isShown(overline);
  const styles = sectionHeader({ align, hasOverline });

  return (
    <div className={styles.root({ className })} {...props}>
      <div className={styles.copy()}>
        {hasOverline ? <p className={styles.overline()}>{overline}</p> : null}
        <Heading className={styles.title()}>{title}</Heading>
        {isShown(lede) ? <p className={styles.lede()}>{lede}</p> : null}
      </div>
      {isShown(action) && align === "start" ? (
        <div className={styles.action()}>{action}</div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/section-header 2>&1 | tail -8`
Expected: PASS (12 tests, the heading-level table included).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/section-header/section-header.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRight } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { SectionHeader } from "./section-header";

const meta = {
  title: "Molecules/SectionHeader",
  component: SectionHeader,
  args: {
    overline: "The Menu",
    title: "Most ordered this week",
    action: (
      <Button variant="ghost" size="sm" iconAfter={ArrowRight}>
        See All
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        component:
          "The standard section opener — every page section starts with one. Uppercase overline, a fluid `h2-fluid` heading (so it never overflows on mobile), an optional one-sentence lede and a trailing action (usually a ghost Button; not rendered when centred). `headingLevel` (default 2) sets the element, never the look. On a pink or ink section it follows the surface — there is no `on` prop.",
      },
    },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "with action". */
export const Playground: Story = {};

/** Card row "lede". */
export const WithLede: Story = {
  args: {
    overline: "Our Story",
    title: "A cafe that tastes like where it's from",
    lede: "We started in one Gurgaon market with a chai counter and a grinder.",
    action: undefined,
  },
};

/** Card row "centred". */
export const Centred: Story = {
  args: { align: "center", overline: "Outlets", title: "Find a Paprikaa", action: undefined },
};

/** Card row `on="brand"` — now a brand surface. */
export const OnBrand: Story = {
  args: { overline: "Franchise", title: "Bring us to your city", action: undefined },
  render: (args) => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
      <SectionHeader {...args} />
    </div>
  ),
};

export const Surfaces: Story = {
  args: { lede: "What Sector 57 ordered most." },
  render: (args) => (
    <OnSurfaces>
      <SectionHeader {...args} />
    </OnSurfaces>
  ),
};

/** Dev parity: the outline changes, the type step never does — no skipping from h1 to h3. */
export const HeadingLevels: Story = {
  render: (args) => (
    <div className="grid gap-10">
      <SectionHeader {...args} headingLevel={2} title="Rendered as an h2" />
      <SectionHeader {...args} headingLevel={3} title="Rendered as an h3" />
      <SectionHeader {...args} headingLevel={4} title="Rendered as an h4" />
    </div>
  ),
};

/** Dev parity: at 360px the action wraps under the heading rather than squeezing it. */
export const Narrow: Story = {
  args: { lede: "One kitchen, one grinder and a menu that changes with the season." },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { SectionHeader, type SectionHeaderProps } from "./molecules/section-header/section-header";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/section-header packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/section-header packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/section-header.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): SectionHeader molecule

Overline, fluid heading at any level, lede and a trailing action that is
dropped when centred. Semantic text tokens follow the surface, so the
design system's on=\"brand\" prop is not needed.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

