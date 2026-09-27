### Task 13: Pagination

Design-system sources: `components/molecules/Pagination.*`. Card rows: many pages (4 of 12) · first page (1 of 5) · 3 pages (2 of 3).

**Files:**

- Create: `packages/ui/src/molecules/pagination/pagination.tsx`, `pagination.test.tsx`, `pagination.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/pagination/pagination.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / why                                                                                                   |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| the pages are an ordered list (`<ol>`)                                 | ADD     | `<ol>` (was `<ul>`) + landmark test                                                                           |
| caller `className` merges with its own                                 | ADD     | test "merges a caller className…"                                                                             |
| `ManyPages` (6 of 24) and `Narrow` stories                             | ADD     | `ManyPages`, `Narrow` stories                                                                                 |
| `onPageChange(page, event)` for a client router                        | DROP    | contracts §5 "links, not callbacks", spec §8.2 (`onClick` for navigation → `href`); `linkAs` takes the router |
| a single page still renders (layout does not jump); `SinglePage` story | DROP    | deviation 13: `pages < 2` renders nothing — a plan ruling, not a spec clause (see audit concern)              |
| 44px pills (`h-11 min-w-11`)                                           | DROP    | spec D2: the design system's `Pagination.jsx` pills are 40px; §5.5 floor ≥24px holds                          |
| optional `page` / `pages` (default 1)                                  | ALREADY | required by contracts §5                                                                                      |
| real links; current flooded + `aria-current`; ±1 collapse; clamp       | ALREADY | tests "links each page…", "shows the first, the last…", "keeps an out-of-range page…"                         |
| no previous on page 1, no next on the last (inert spans)               | ALREADY | test "has no previous link…"                                                                                  |
| Enter on Next follows it                                               | ALREADY | native `<a href>` (no callback to observe)                                                                    |
| `Default`, `FirstPage`, `LastPage`, `ThreePages` stories               | ALREADY | `Playground`, `FirstPage`, `LastPage`, `ThreePages`                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `LinkAs`, `LinkAsProps` (Plan 2a).
- Produces: `Pagination`, `PaginationProps` — contract §5 (deviation 13). Links, not callbacks: `getPageHref(page)` builds each href. Pages shown: the first, the last and one either side of the current page; each hidden run collapses to one `…`.

- [ ] **Step 1: No new tokens**

Pills are `h-10 min-w-10` (40px, a spacing step), labels `text-body-sm` Poppins 700. The idle label `ink-700` on white is added to the contrast policy by Task 6; the current pill is Plan 1's `on-brand-fill` pair. The list is a light island so the pills stay white on any field.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/pagination/pagination.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Pagination } from "./pagination";

const hrefFor = (page: number) => `/press?page=${String(page)}`;

function pageNames(): string[] {
  return within(screen.getByRole("navigation"))
    .getAllByRole("link")
    .map((link) => link.textContent ?? "");
}

function RouterLink({ href, className, children, "aria-current": ariaCurrent }: LinkAsProps) {
  return (
    <a href={href} className={className} aria-current={ariaCurrent} data-router="">
      {children}
    </a>
  );
}

describe("Pagination", () => {
  it("is a navigation landmark named Pagination, holding an ordered list", () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(container.querySelector("nav > ol")).toBeInTheDocument();
  });

  it("merges a caller className and keeps its own", () => {
    render(<Pagination page={1} pages={3} getPageHref={hrefFor} className="max-w-96" />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toHaveClass(
      "max-w-96",
      "min-w-0"
    );
  });

  it("shows the first, the last and one either side of the current page, with gaps between", () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(pageNames()).toEqual([
      "Previous page",
      "Page 1",
      "Page 3",
      "Page 4",
      "Page 5",
      "Page 12",
      "Next page",
    ]);
    expect(container.querySelectorAll("li[aria-hidden='true']")).toHaveLength(2);
  });

  it("links each page by the href it is given and marks the current one", () => {
    render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("link", { name: "Page 5" })).toHaveAttribute("href", "/press?page=5");
    const current = screen.getByRole("link", { name: "Page 4" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("bg-surface-brand");
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/press?page=3"
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/press?page=5"
    );
  });

  it("has no previous link on the first page and no next link on the last", () => {
    const { rerender } = render(<Pagination page={1} pages={5} getPageHref={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument();
    rerender(<Pagination page={5} pages={5} getPageHref={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("shows every page when there are three", () => {
    render(<Pagination page={2} pages={3} getPageHref={hrefFor} />);
    expect(pageNames()).toEqual(["Previous page", "Page 1", "Page 2", "Page 3", "Next page"]);
  });

  it("keeps an out-of-range page inside the list", () => {
    render(<Pagination page={40} pages={12} getPageHref={hrefFor} />);
    expect(screen.getByRole("link", { name: "Page 12" })).toHaveAttribute("aria-current", "page");
  });

  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} pages={1} getPageHref={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders page links through linkAs", () => {
    const { container } = render(
      <Pagination page={2} pages={3} getPageHref={hrefFor} linkAs={RouterLink} />
    );
    expect(container.querySelectorAll("a[data-router]")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Pagination page={4} pages={12} getPageHref={hrefFor} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/pagination 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./pagination`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/pagination/pagination.tsx`:

```tsx
import type { ComponentProps } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const pagination = componentVariants({
  slots: {
    root: "min-w-0",
    list: "m-0 flex list-none flex-wrap items-center gap-2 p-0",
    item: "grid h-10 min-w-10 place-items-center rounded-pill px-2.5 font-display text-body-sm font-bold no-underline",
  },
  variants: {
    state: {
      idle: {
        item: "border border-border-default bg-surface-card text-ink-700 transition-colors duration-fast ease-out hover:bg-surface-page-alt",
      },
      current: { item: "bg-surface-brand text-text-on-brand" },
      gap: { item: "text-ink-400" },
      inert: { item: "border border-border-subtle bg-surface-card text-ink-400" },
    },
  },
  defaultVariants: { state: "idle" },
});

type PageSlot = number | "gap";

/** The first, the last and one either side of `page`; each hidden run becomes one gap. */
function pageSlots(page: number, pages: number): PageSlot[] {
  const slots: PageSlot[] = [];
  for (let candidate = 1; candidate <= pages; candidate += 1) {
    if (candidate === 1 || candidate === pages || Math.abs(candidate - page) <= 1) {
      slots.push(candidate);
    } else if (slots.at(-1) !== "gap") {
      slots.push("gap");
    }
  }
  return slots;
}

export interface PaginationProps extends ComponentProps<"nav"> {
  page: number;
  pages: number;
  /** The href of a page — paging is navigation, not a callback. */
  getPageHref: (page: number) => string;
  /** The link component (default `"a"`; pass `next/link` in an app). */
  linkAs?: LinkAs | undefined;
  /** The landmark's name. */
  label?: string | undefined;
}

/** Paging for press, blog and careers listings. Wraps rather than overflowing on mobile. */
export function Pagination({
  page,
  pages,
  getPageHref,
  linkAs: LinkComponent = "a",
  label = "Pagination",
  className,
  ...props
}: PaginationProps) {
  if (pages < 2) return null;

  const current = Math.min(Math.max(1, Math.round(page)), pages);
  const styles = pagination();

  return (
    <nav aria-label={label} className={styles.root({ className })} {...props}>
      {/* An ordered list: the pages are a sequence (dev parity). */}
      <ol data-surface="light" className={styles.list()}>
        {current > 1 ? (
          <li>
            <LinkComponent href={getPageHref(current - 1)} className={styles.item()}>
              <Icon icon={ChevronLeft} size="sm" label="Previous page" />
            </LinkComponent>
          </li>
        ) : (
          <li aria-hidden="true">
            <span className={styles.item({ state: "inert" })}>
              <Icon icon={ChevronLeft} size="sm" />
            </span>
          </li>
        )}
        {pageSlots(current, pages).map((slot, index) =>
          slot === "gap" ? (
            <li key={`gap-${String(index)}`} aria-hidden="true">
              <span className={styles.item({ state: "gap" })}>…</span>
            </li>
          ) : (
            <li key={slot}>
              <LinkComponent
                href={getPageHref(slot)}
                className={styles.item({ state: slot === current ? "current" : "idle" })}
                aria-current={slot === current ? "page" : undefined}
              >
                <span className="sr-only">Page </span>
                {slot}
              </LinkComponent>
            </li>
          )
        )}
        {current < pages ? (
          <li>
            <LinkComponent href={getPageHref(current + 1)} className={styles.item()}>
              <Icon icon={ChevronRight} size="sm" label="Next page" />
            </LinkComponent>
          </li>
        ) : (
          <li aria-hidden="true">
            <span className={styles.item({ state: "inert" })}>
              <Icon icon={ChevronRight} size="sm" />
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
```

(`LinkAsProps["aria-current"]` accepts `undefined` — ruling R13. If Task 0 found it does not, spread it conditionally instead: `{...(slot === current ? { "aria-current": "page" as const } : {})}`.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/pagination 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/pagination/pagination.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./pagination";

const meta = {
  title: "Molecules/Pagination",
  component: Pagination,
  args: { page: 4, pages: 12, getPageHref: (page) => `#page-${String(page)}` },
  parameters: {
    docs: {
      description: {
        component:
          "Paging for press, blog and careers listings — real links (`getPageHref`), so every page is crawlable and back-button friendly. The current page is a flooded pink pill; the rest are white with a 1px border. Gaps appear past ±1 of the current page. Previous/Next disappear into inert placeholders at the ends; a single page renders nothing. Wraps rather than overflowing on mobile. `linkAs` renders the app's router link.",
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "many pages". */
export const Playground: Story = {};

/** Card row "first page". */
export const FirstPage: Story = { args: { page: 1, pages: 5 } };

/** Card row "3 pages". */
export const ThreePages: Story = { args: { page: 2, pages: 3 } };

/** The last page — Next is inert. */
export const LastPage: Story = { args: { page: 12, pages: 12 } };

/** Dev parity: deep in a long listing — both runs collapse to a gap. */
export const ManyPages: Story = { args: { page: 6, pages: 24 } };

/** Dev parity: the smallest supported width — the row wraps onto two lines. */
export const Narrow: Story = {
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
export { Pagination, type PaginationProps } from "./molecules/pagination/pagination";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/pagination packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/pagination packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): Pagination molecule with real links

First, last and one either side of the current page, gaps between; every
page is a link from getPageHref, the current one marked aria-current.
Nothing renders for a single page.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

