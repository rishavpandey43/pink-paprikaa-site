### Task 19: AnnouncementBar

**Files:**

- Create: `packages/ui/src/molecules/announcement-bar/announcement-bar.tsx`, `announcement-expiry.tsx`, `announcement-bar.test.tsx`, `announcement-bar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `Countdown` (`endsAt`, `label`; renders `<time>` in its mono pill), `type LinkAs`; React's `useSyncExternalStore` (server snapshot on the server and during hydration, the live snapshot afterwards — no hydration mismatch, no `setState` in an effect).
- Produces: `AnnouncementBar`, `type AnnouncementBarProps` (contract §6 + deviation 9). Server component; `announcement-expiry.tsx` is the client leaf (not exported from the barrel). Throws `RangeError` for an `endsAt` that is not a date. The handoff strip's gap: it never disappeared after the offer ended — this one renders **nothing** after `endsAt`, including when it passes while the page is open.

- [ ] **Step 1: Tokens** — none new (`bg-surface-brand` strip, `text-caption`, `px-4 py-2`).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/announcement-bar/announcement-bar.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AnnouncementBar } from "./announcement-bar";

const DAY_MS = 86_400_000;
const inDays = (days: number) => new Date(Date.now() + days * DAY_MS).toISOString();

function RouterLink(props: LinkAsProps) {
  return <a data-router="" {...props} />;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("AnnouncementBar", () => {
  it("shows its message on the brand strip", () => {
    const { container } = render(
      <AnnouncementBar>Launch price: Classic at ₹130 a meal</AnnouncementBar>
    );
    expect(screen.getByText("Launch price: Classic at ₹130 a meal")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("data-surface", "brand");
  });

  it("makes the whole strip one link when given an href", () => {
    render(
      <AnnouncementBar href="/homely-meals">Launch price: Classic at ₹130 a meal</AnnouncementBar>
    );
    expect(screen.getByRole("link", { name: /Launch price/ })).toHaveAttribute(
      "href",
      "/homely-meals"
    );
  });

  it("renders the link through the app's router link", () => {
    render(
      <AnnouncementBar href="/homely-meals" linkAs={RouterLink}>
        Launch price
      </AnnouncementBar>
    );
    expect(screen.getByRole("link", { name: /Launch price/ })).toHaveAttribute("data-router");
  });

  it("counts down to endsAt", () => {
    const endsAt = inDays(3);
    const { container } = render(<AnnouncementBar endsAt={endsAt}>Launch price</AnnouncementBar>);
    expect(container.querySelector("time")).toHaveAttribute("datetime", endsAt);
  });

  it("stays up, with no countdown, when there is no endsAt", () => {
    const { container } = render(<AnnouncementBar>Launch price</AnnouncementBar>);
    expect(container.querySelector("time")).toBeNull();
    expect(screen.getByText("Launch price")).toBeInTheDocument();
  });

  it("renders nothing once endsAt has passed — no empty strip left above the header", () => {
    const { container } = render(
      <AnnouncementBar endsAt="2025-01-01T00:00:00+05:30" href="/homely-meals">
        Launch price
      </AnnouncementBar>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disappears the moment it expires while the page is open", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T23:59:58+05:30"));
    const { container } = render(
      <AnnouncementBar endsAt="2026-10-31T23:59:59+05:30">Launch price</AnnouncementBar>
    );
    expect(screen.getByText("Launch price")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("rejects an endsAt it cannot read instead of never expiring", () => {
    // A server component is a plain function: call it to see the throw directly.
    expect(() => AnnouncementBar({ endsAt: "end of October", children: "Launch price" })).toThrow(
      RangeError
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AnnouncementBar
        href="/homely-meals"
        endsAt={inDays(3)}
        countdownLabel="Launch price closes in"
      >
        Launch price: Classic at ₹130 a meal · closes in
      </AnnouncementBar>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- announcement-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./announcement-bar`.

- [ ] **Step 4: Implement the client expiry gate**

`packages/ui/src/molecules/announcement-bar/announcement-expiry.tsx`:

```tsx
"use client";

import { type ReactNode, useCallback, useSyncExternalStore } from "react";

/** setTimeout's ceiling (~24.8 days). A longer wait re-arms until the moment arrives. */
const MAX_TIMEOUT_MS = 2_147_483_647;

function hasPassed(endsAtMs: number): boolean {
  return Date.now() >= endsAtMs;
}

/** Calls `onPass` once `endsAtMs` has passed, however far away it is. */
function subscribeUntil(endsAtMs: number, onPass: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const wait = () => {
    const remaining = endsAtMs - Date.now();
    if (remaining <= 0) {
      onPass();
      return;
    }
    timer = setTimeout(wait, Math.min(remaining, MAX_TIMEOUT_MS));
  };
  wait();
  return () => {
    clearTimeout(timer);
  };
}

/** The server (and hydration) always renders the announcement; the client then decides. */
const getServerSnapshot = () => false;

export interface AnnouncementExpiryProps {
  /** Epoch milliseconds. */
  endsAt: number;
  children: ReactNode;
}

/**
 * Renders its children until `endsAt`, then nothing. Re-checked on the client, so a static page
 * served after the date still hides it (spec §16: time-bound content is never checked only at build).
 */
export function AnnouncementExpiry({ endsAt, children }: AnnouncementExpiryProps) {
  const subscribe = useCallback((onPass: () => void) => subscribeUntil(endsAt, onPass), [endsAt]);
  const getSnapshot = useCallback(() => hasPassed(endsAt), [endsAt]);
  const hasEnded = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return hasEnded ? null : children;
}
```

- [ ] **Step 5: Implement the bar**

`packages/ui/src/molecules/announcement-bar/announcement-bar.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";

import { Countdown } from "../../atoms/countdown/countdown";
import { componentVariants } from "../../lib/component-variants";
import { AnnouncementExpiry } from "./announcement-expiry";

const announcementBar = componentVariants({
  slots: {
    root: "bg-surface-brand text-text-body",
    content: "flex flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-caption",
    link: "text-inherit no-underline hover:underline",
  },
});

export interface AnnouncementBarProps extends Omit<ComponentProps<"div">, "children"> {
  /** The message. Bold the offer with `<strong>`. */
  children: ReactNode;
  /** Makes the whole strip one link. */
  href?: string | undefined;
  /** ISO 8601 with an offset. Shows a countdown, and the bar renders nothing once it passes. */
  endsAt?: string | undefined;
  /** Accessible prefix for the countdown, e.g. "Launch price closes in". */
  countdownLabel?: string | undefined;
  linkAs?: LinkAs | undefined;
}

function toEpochMs(endsAt: string): number {
  const time = Date.parse(endsAt);
  if (Number.isNaN(time)) {
    throw new RangeError(
      `AnnouncementBar: endsAt "${endsAt}" is not a date — use ISO 8601 with an offset`
    );
  }
  return time;
}

/** The brand launch strip above the site header, optionally counting down to its end. */
export function AnnouncementBar({
  children,
  href,
  endsAt,
  countdownLabel,
  linkAs: LinkComponent = "a",
  className,
  ...props
}: AnnouncementBarProps) {
  const styles = announcementBar();
  const content = (
    <>
      <span>{children}</span>
      {endsAt === undefined ? null : <Countdown endsAt={endsAt} label={countdownLabel} />}
    </>
  );
  const bar = (
    <div data-surface="brand" className={styles.root({ className })} {...props}>
      {href === undefined ? (
        <div className={styles.content()}>{content}</div>
      ) : (
        <LinkComponent href={href} className={styles.content({ className: styles.link() })}>
          {content}
        </LinkComponent>
      )}
    </div>
  );

  if (endsAt === undefined) return bar;
  return <AnnouncementExpiry endsAt={toEpochMs(endsAt)}>{bar}</AnnouncementExpiry>;
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- announcement-bar 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 7: Stories — the handoff launch strip, no countdown, and the expired strip (with its no-gap check)**

Stories use an `endsAt` relative to now, so the launch story never expires in the catalogue.

`packages/ui/src/molecules/announcement-bar/announcement-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { AnnouncementBar } from "./announcement-bar";

const IN_THREE_DAYS = new Date(Date.now() + 3 * 86_400_000).toISOString();

const LAUNCH_COPY = (
  <>
    Launch price: <strong>Classic at {formatRupees(130)} a meal</strong> for the first 50
    subscribers · closes in
  </>
);

const meta = {
  title: "Molecules/AnnouncementBar",
  component: AnnouncementBar,
  args: {
    children: LAUNCH_COPY,
    href: "#homely-meals",
    endsAt: IN_THREE_DAYS,
    countdownLabel: "Launch price closes in",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The brand strip above the site header (the handoff's launch price bar). `href` makes the whole strip one link; `endsAt` adds the Countdown and — unlike the handoff — removes the bar entirely once the moment passes, re-checked on the client so a cached static page never shows an expired offer. Only the expiry gate ships JavaScript; the bar itself is server-rendered.",
      },
    },
  },
} satisfies Meta<typeof AnnouncementBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PPHeader launch strip. */
export const LaunchPrice: Story = {};

export const WithoutCountdown: Story = { args: { endsAt: undefined } };

/** After `endsAt`: nothing is rendered, and the header row moves up to the top. */
export const Expired: Story = {
  args: { endsAt: "2025-01-01T00:00:00+05:30" },
  render: (args) => (
    <div data-testid="page-top" className="grid">
      <AnnouncementBar {...args} />
      <div data-testid="header-row" className="h-header-compact border-b border-border-subtle px-4">
        Header row
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.queryByText(/Launch price/)).toBeNull();
    const top = canvas.getByTestId("page-top").getBoundingClientRect().top;
    await expect(canvas.getByTestId("header-row").getBoundingClientRect().top).toBe(top);
  },
};
```

- [ ] **Step 8: Export**

```ts
export {
  AnnouncementBar,
  type AnnouncementBarProps,
} from "./molecules/announcement-bar/announcement-bar";
```

- [ ] **Step 9: Gate** — `<paths>` = `packages/ui/src/molecules/announcement-bar packages/ui/src/index.ts`; then the expiry in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- announcement-bar 2>&1 | tail -10
```

Expected: every AnnouncementBar story passes, including `Expired`'s play.

- [ ] **Step 10: Commit**

```bash
git add packages/ui/src/molecules/announcement-bar packages/ui/src/index.ts
git commit -m "feat(ui): AnnouncementBar molecule

The brand launch strip with an optional countdown. Unlike the handoff's,
it renders nothing once endsAt has passed — including when it expires
while the page is open — via a tiny client gate on useSyncExternalStore,
so the bar stays server-rendered and linkAs works from a server layout.
An unreadable endsAt throws instead of never expiring.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

