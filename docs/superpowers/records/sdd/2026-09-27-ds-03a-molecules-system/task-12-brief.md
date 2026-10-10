### Task 12: Breadcrumb

Design-system sources: `components/molecules/Breadcrumb.*`. Card rows: 3 levels · 2 levels · long (wraps, never clips).

**Files:**

- Create: `packages/design-tokens/tokens/component/breadcrumb.json`
- Create: `packages/ui/src/molecules/breadcrumb/breadcrumb.tsx`, `breadcrumb.test.tsx`, `breadcrumb.stories.tsx`
- Modify: `packages/design-tokens/tokens/surface/{brand,ink,light}.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/breadcrumb/breadcrumb.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / why                                                                                   |
| ---------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| caller `className` merges with its own                                 | ADD     | test "merges a caller className…"                                                             |
| `UnlinkedLevel` story                                                  | ADD     | `UnlinkedLevel` story                                                                         |
| `tone="inverse"` (white trail on brand / ink)                          | DROP    | spec D5, deviation 7 — the chevron is a surface-overridden token; `OnSurfaces` story shows it |
| `label` prop for the landmark name                                     | ALREADY | native `aria-label` (default "Breadcrumb", deviation 15)                                      |
| named nav + `<ol>`; links all but current; last current even with href | ALREADY | tests "is a named navigation landmark…", "links every crumb…", "marks the last crumb…"        |
| mid crumb without href is text; chevrons between, none after the last  | ALREADY | tests "writes a middle crumb…", "separates crumbs…"                                           |
| `Default`, `TwoLevels`, `LongTrail`, `OnBrand`, `Narrow` stories       | ALREADY | `Playground`, `TwoLevels`, `Long` (360px viewport), `OnSurfaces`                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `LinkAs`, `LinkAsProps` (Plan 2a); `OnSurfaces` (Plan 2a, stories).
- Produces: `Breadcrumb`, `BreadcrumbProps`, `BreadcrumbItem` — contract §5 without `tone` (deviation 7). `<nav aria-label="Breadcrumb"><ol>`; the last item is the current page (`aria-current="page"`, never a link); a middle item without `href` is plain text, never `href="#"`.

- [ ] **Step 1: Component tokens and the surface skin**

`packages/design-tokens/tokens/component/breadcrumb.json`:

```json
{
  "color": {
    "$type": "color",
    "breadcrumb-chevron": {
      "$value": "{color.ink.400}",
      "$description": "Decorative chevron between crumbs; white at 50% on brand and ink fields."
    }
  },
  "text": {
    "$type": "typography",
    "breadcrumb": {
      "$value": { "fontSize": "13.5px", "lineHeight": 1.6 },
      "$description": "Breadcrumb links and current page (DM Sans)."
    }
  }
}
```

Add, inside `surface-brand` → `color` of `tokens/surface/brand.json` **and** inside `surface-ink` → `color` of `tokens/surface/ink.json`:

```json
"breadcrumb-chevron": { "$value": "{color.white-alpha.50}" }
```

and inside `surface-light` → `color` of `tokens/surface/light.json` (the light island restores it):

```json
"breadcrumb-chevron": { "$value": "{color.ink.400}" }
```

Append `"breadcrumb"` to `TEXT`. Rebuild and run the token tests (`theme.spec`'s light-restore test covers the new override). Text colours are semantic (`text-muted`, `text-heading`), already in Plan 1's groups on every surface; the chevron is decorative.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/breadcrumb/breadcrumb.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const MENU_TRAIL: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Small Plates" },
];

function RouterLink({ href, className, children }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router="">
      {children}
    </a>
  );
}

describe("Breadcrumb", () => {
  it("is a named navigation landmark with an ordered trail", () => {
    render(<Breadcrumb items={MENU_TRAIL} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(3);
  });

  it("links every crumb but the current page, which it marks", () => {
    render(<Breadcrumb items={MENU_TRAIL} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/menu");
    expect(screen.queryByRole("link", { name: "Small Plates" })).not.toBeInTheDocument();
    expect(screen.getByText("Small Plates")).toHaveAttribute("aria-current", "page");
  });

  it("marks the last crumb current even when it has an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Outlets", href: "/outlets" },
        ]}
      />
    );
    expect(screen.queryByRole("link", { name: "Outlets" })).not.toBeInTheDocument();
    expect(screen.getByText("Outlets")).toHaveAttribute("aria-current", "page");
  });

  it("writes a middle crumb without an href as plain text, never a dead link", () => {
    render(
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Company" }, { label: "Franchise" }]}
      />
    );
    expect(screen.queryByRole("link", { name: "Company" })).not.toBeInTheDocument();
    expect(screen.getByText("Company")).not.toHaveAttribute("aria-current");
  });

  it("separates crumbs with chevrons hidden from assistive tech", () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} />);
    const chevrons = container.querySelectorAll("svg.lucide-chevron-right");
    expect(chevrons).toHaveLength(2);
    for (const chevron of chevrons) expect(chevron.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("renders links through linkAs, so an app can pass its router link", () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} linkAs={RouterLink} />);
    expect(container.querySelectorAll("a[data-router]")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveClass("text-text-muted");
  });

  it("takes another name for its landmark", () => {
    render(<Breadcrumb items={MENU_TRAIL} aria-label="You are here" />);
    expect(screen.getByRole("navigation", { name: "You are here" })).toBeInTheDocument();
  });

  it("merges a caller className and keeps its own", () => {
    render(<Breadcrumb items={MENU_TRAIL} className="max-w-96" />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toHaveClass("max-w-96", "min-w-0");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Breadcrumb items={MENU_TRAIL} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/breadcrumb 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./breadcrumb`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/breadcrumb/breadcrumb.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ChevronRight } from "lucide-react";

import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const breadcrumb = componentVariants({
  slots: {
    root: "min-w-0",
    list: "m-0 flex list-none flex-wrap items-center gap-2 p-0",
    item: "flex min-w-0 items-center gap-2",
    link: "text-breadcrumb text-text-muted no-underline transition-colors duration-fast ease-out hover:text-text-heading hover:underline",
    text: "text-breadcrumb text-text-muted",
    current: "text-breadcrumb font-medium text-text-heading",
    chevron: "text-breadcrumb-chevron",
  },
});

export interface BreadcrumbItem {
  label: string;
  /** Omit for plain text; the last item is always the current page. */
  href?: string | undefined;
}

export interface BreadcrumbProps extends ComponentProps<"nav"> {
  items: BreadcrumbItem[];
  /** The link component for each crumb (default `"a"`; pass `next/link` in an app). */
  linkAs?: LinkAs | undefined;
}

/**
 * Path trail for website sub-pages (menu category, outlet, careers) — not used in the app.
 * Chevron separators, muted links, the current page in heading ink at 500 weight. Follows the
 * surface: on pink or ink fields every colour turns light.
 */
export function Breadcrumb({
  items,
  linkAs: LinkComponent = "a",
  "aria-label": ariaLabel = "Breadcrumb",
  className,
  ...props
}: BreadcrumbProps) {
  const styles = breadcrumb();
  const lastIndex = items.length - 1;

  return (
    <nav aria-label={ariaLabel} className={styles.root({ className })} {...props}>
      <ol className={styles.list()}>
        {items.map((item, index) => {
          const isCurrent = index === lastIndex;
          let crumb;
          if (isCurrent) {
            crumb = (
              <span aria-current="page" className={styles.current()}>
                {item.label}
              </span>
            );
          } else if (item.href === undefined) {
            crumb = <span className={styles.text()}>{item.label}</span>;
          } else {
            crumb = (
              <LinkComponent href={item.href} className={styles.link()}>
                {item.label}
              </LinkComponent>
            );
          }
          return (
            <li key={`${String(index)}-${item.label}`} className={styles.item()}>
              {crumb}
              {isCurrent ? null : (
                <Icon icon={ChevronRight} size="xs" className={styles.chevron()} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/breadcrumb 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/breadcrumb/breadcrumb.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [{ label: "Home", href: "#" }, { label: "Menu", href: "#" }, { label: "Small Plates" }],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Path trail for website sub-pages (menu category, outlet, careers). Not used in the app. Chevron separators, muted links, current page in heading ink at 500 weight (`aria-current="page"`, never a link). Wraps, never clips. `linkAs` renders each crumb with the app\'s router link. On a pink or ink field it follows the surface — no `tone` prop.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "3 levels". */
export const Playground: Story = {};

/** Card row "2 levels". */
export const TwoLevels: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Outlets" }] },
};

/** Card row "long" — wraps, never clips. */
export const Long: Story = {
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Company", href: "#" },
      { label: "Franchise", href: "#" },
      { label: "Apply for a 2027 city" },
    ],
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

/** Dev parity: a grouping level with no page of its own stays plain text. */
export const UnlinkedLevel: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Company" }, { label: "Press" }] },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <Breadcrumb {...args} />
    </OnSurfaces>
  ),
};
```

(If Task 0 found Plan 1's viewport ids differ from `mobile1`, use the 360px id from `apps/storybook/.storybook/preview.tsx`.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  Breadcrumb,
  type BreadcrumbItem,
  type BreadcrumbProps,
} from "./molecules/breadcrumb/breadcrumb";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/breadcrumb packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/breadcrumb packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/breadcrumb.json packages/design-tokens/tokens/surface
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Breadcrumb molecule

Ordered trail in a named nav; the last crumb is the current page, a crumb
without href is text, never a dead link. Router links via linkAs. The
chevron is a surface-aware component token, so there is no tone prop.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

