### Task 16: Countdown (client — handoff)

Derived from `zip-files/pink-paprikaa-handoff/design/PPHeader.dc.html`, which has no design-system card: the launch bar's pill is `font-mono`, bold, `ink-900` fill, white text, `1px 8px` padding, pill radius, `nowrap`, ticking every second (`setInterval(…, 1000)`) and formatted `` `${d}d ${hh}h ${mm}m ${ss}s` `` with hours, minutes and seconds padded to two digits. The handoff shows `0d 00h 00m 00s` forever after the deadline; spec §9.1 and §16 require the offer to disappear instead.

**Files:**

- Create: `packages/ui/src/atoms/countdown/countdown.tsx`, `countdown.test.tsx`, `countdown.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: React 19 `useSyncExternalStore`, `componentVariants`.
- Produces: `Countdown`, `CountdownProps` exactly as contract §3 (`endsAt` ISO with offset, `fallback` = null, `label` accessible prefix; renders `<time dateTime={endsAt}>`). The server snapshot is `null`, so SSR and the hydration pass render the stable placeholder `--d --h --m --s`; the clock subscribes (one 1s interval) only after mount and unsubscribes on unmount; the second the offer ends it renders `fallback`. An `endsAt` without an offset throws `RangeError` (server and browser would read it in different time zones).

- [ ] **Step 1: Component tokens**

None: the pill is `rounded-pill bg-surface-inverse px-2 py-px font-mono text-mono font-bold text-text-on-inverse` — `px-2` is 8px, `py-px` 1px, `text-mono` the handoff's 13px. Contrast: the existing `on-inverse` pair. No list names.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/countdown/countdown.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Countdown } from "./countdown";

const ENDS_AT = "2026-10-31T23:59:59+05:30";
/** One day and five seconds before ENDS_AT. */
const NOW = new Date("2026-10-30T23:59:54+05:30");

beforeEach(() => {
  // Only the clock is faked: React's scheduler and axe keep their real timers.
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Countdown", () => {
  it("renders a stable placeholder on the server — no time-dependent digits in the HTML", () => {
    const html = renderToString(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    expect(html).toMatch(/datetime="2026-10-31T23:59:59\+05:30"/i);
    expect(html).toContain("--d --h --m --s");
    expect(html).not.toMatch(/\d+d \d{2}h/);
  });

  it("hydrates without a mismatch, then shows the real time left", async () => {
    const element = <Countdown endsAt={ENDS_AT} label="Offer closes in" />;
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.append(container);
    const onRecoverableError = vi.fn();

    const root = await act(() => hydrateRoot(container, element, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container).toHaveTextContent("Offer closes in 1d 00h 00m 05s");
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("ticks once a second after mount", () => {
    render(<Countdown endsAt={ENDS_AT} />);
    const time = screen.getByText("1d 00h 00m 05s");
    expect(time.tagName).toBe("TIME");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(time).toHaveTextContent("1d 00h 00m 04s");
  });

  it("swaps to the fallback the second the offer ends", () => {
    vi.setSystemTime(new Date("2026-10-31T23:59:57+05:30"));
    render(<Countdown endsAt={ENDS_AT} fallback={<span>Offer closed</span>} />);
    expect(screen.getByText("0d 00h 00m 02s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("0d 00h 00m 01s")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Offer closed")).toBeInTheDocument();
    expect(document.querySelector("time")).not.toBeInTheDocument();
  });

  it("renders nothing by default once ended — a cached page never shows an expired offer", () => {
    vi.setSystemTime(new Date("2026-11-01T00:00:00+05:30"));
    const { container } = render(<Countdown endsAt={ENDS_AT} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("runs one interval while mounted and clears it on unmount", () => {
    const { unmount } = render(<Countdown endsAt={ENDS_AT} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reads its label before the time, for assistive tech only", () => {
    render(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    const time = document.querySelector("time");
    expect(screen.getByText("Offer closes in")).toHaveClass("sr-only");
    expect(time).toHaveTextContent("Offer closes in 1d 00h 00m 05s");
    expect(time).toHaveAttribute("datetime", ENDS_AT);
  });

  it("is the handoff's mono ink pill", () => {
    render(<Countdown endsAt={ENDS_AT} />);
    expect(screen.getByText("1d 00h 00m 05s")).toHaveClass(
      "rounded-pill",
      "bg-surface-inverse",
      "font-mono",
      "font-bold",
      "text-text-on-inverse"
    );
  });

  it.each(["2026-10-31T23:59:59", "31 October 2026", ""])(
    "rejects %j — an end time needs an ISO offset",
    (endsAt) => {
      expect(() => renderToString(<Countdown endsAt={endsAt} />)).toThrow(RangeError);
    }
  );

  it("has no accessibility violations", async () => {
    const { container } = render(<Countdown endsAt={ENDS_AT} label="Offer closes in" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './countdown'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/countdown/countdown.tsx`:

```tsx
"use client";

import { type ComponentProps, type ReactNode, useSyncExternalStore } from "react";

import { componentVariants } from "../../lib/component-variants";

const SECOND_MS = 1000;
/** What the server and the hydration pass render: a reading's shape without time-dependent digits. */
const PLACEHOLDER = "--d --h --m --s";
/** An ISO date-time must carry its offset, or server and browser would read it in different zones. */
const ISO_WITH_OFFSET = /(?:Z|[+-]\d{2}:\d{2})$/;

/** The handoff launch bar's pill (PPHeader.dc.html). */
const countdown = componentVariants({
  base: "inline-flex rounded-pill bg-surface-inverse px-2 py-px font-mono text-mono font-bold whitespace-nowrap text-text-on-inverse",
});

/** The clock is an external store: one 1s interval per mounted countdown, cleared on unmount. */
function subscribeToClock(onTick: () => void): () => void {
  const timer = setInterval(onTick, SECOND_MS);
  return () => {
    clearInterval(timer);
  };
}

/** Whole seconds, so the snapshot only changes once a second. */
function readClock(): number {
  return Math.floor(Date.now() / SECOND_MS);
}

/** The server has no "now" worth rendering: null means "not mounted yet". */
function readServerClock(): null {
  return null;
}

function parseEndsAt(endsAt: string): number {
  const endsMs = Date.parse(endsAt);
  if (!ISO_WITH_OFFSET.test(endsAt) || Number.isNaN(endsMs)) {
    throw new RangeError(
      `Countdown: endsAt must be an ISO date-time with an offset, got "${endsAt}"`
    );
  }
  return endsMs;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** `12d 04h 05m 09s` — the handoff's launch-offer format. */
function formatRemaining(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(totalSeconds % 60)}s`;
}

export interface CountdownProps extends Omit<ComponentProps<"time">, "children" | "dateTime"> {
  /** ISO 8601 with an offset, e.g. "2026-10-31T23:59:59+05:30". */
  endsAt: string;
  /** Rendered once `endsAt` has passed. = null (nothing). */
  fallback?: ReactNode;
  /** Read before the time by assistive tech only, e.g. "Offer closes in". */
  label?: string | undefined;
}

/**
 * Time left on an offer, ticking every second. Server-rendered HTML carries a placeholder, so there
 * is no hydration mismatch and no stale time in a static page; the live reading starts on mount.
 */
export function Countdown({ endsAt, fallback = null, label, className, ...props }: CountdownProps) {
  const endsMs = parseEndsAt(endsAt);
  const nowSecond = useSyncExternalStore<number | null>(
    subscribeToClock,
    readClock,
    readServerClock
  );
  const remaining =
    nowSecond === null ? null : Math.max(0, Math.ceil(endsMs / SECOND_MS - nowSecond));

  if (remaining === 0) return fallback;

  return (
    <time dateTime={endsAt} className={countdown({ className })} {...props}>
      {label === undefined ? null : <span className="sr-only">{`${label} `}</span>}
      {remaining === null ? (
        <span aria-hidden="true">{PLACEHOLDER}</span>
      ) : (
        formatRemaining(remaining)
      )}
    </time>
  );
}
```

(`remaining` is computed from whole seconds: with a whole-second `endsAt` — every ISO time the content uses — it is exact, and it reaches 0 at the deadline, never a second early.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS — including the hydration test with no recoverable error.

- [ ] **Step 6: Stories (parity with the handoff launch bar; `play` for the client component)**

`packages/ui/src/atoms/countdown/countdown.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, waitFor } from "storybook/test";

import { Countdown } from "./countdown";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
/** Computed when the stories load, so the countdown is always live in Storybook. */
const IN_FIVE_DAYS = new Date(Date.now() + 5 * DAY_MS + 7 * HOUR_MS).toISOString();
const LAST_YEAR = "2025-10-31T23:59:59+05:30";
const READING = /^\d+d \d{2}h \d{2}m \d{2}s$/;

const meta = {
  title: "Atoms/Countdown",
  component: Countdown,
  args: { endsAt: IN_FIVE_DAYS },
  parameters: {
    docs: {
      description: {
        component:
          'From the handoff\'s launch bar: the time left on an offer as `Nd HHh MMm SSs` in a mono ink pill, ticking every second. `endsAt` is ISO 8601 with an offset ("2026-10-31T23:59:59+05:30"). The server renders a stable placeholder, so there is no hydration mismatch and a static page never bakes in a stale time; once `endsAt` passes it renders `fallback` — nothing by default — so an expired offer disappears even from a cached page. `label` is read before the time by assistive tech only. Client component.',
      },
    },
  },
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { label: "Offer closes in" },
  play: async ({ canvas }) => {
    const time = canvas.getByText(READING);
    await expect(time.tagName).toBe("TIME");
    await expect(time).toHaveAttribute("datetime", IN_FIVE_DAYS);
    const first = time.textContent;
    await waitFor(() => expect(time.textContent).not.toBe(first), { timeout: 2500 });
  },
};

/** PPHeader.dc.html — the launch bar the countdown was drawn for. */
export const InLaunchBar: Story = {
  name: "in the launch bar (handoff)",
  render: (args) => (
    <p
      data-surface="brand"
      className="m-0 flex max-w-none flex-wrap items-center justify-center gap-2 bg-surface-brand px-4 py-1.5 text-center font-body text-body-sm"
    >
      <span>
        Launch price: <strong>Classic at ₹130 a meal</strong> for the first 50 subscribers · closes
        in
      </span>
      <Countdown {...args} />
    </p>
  ),
};

export const Ended: Story = {
  name: "after endsAt: fallback",
  args: {
    endsAt: LAST_YEAR,
    fallback: (
      <span className="font-body text-body-sm text-text-muted">This offer has closed.</span>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("This offer has closed.")).toBeVisible();
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};

export const EndedRendersNothing: Story = {
  name: "after endsAt: nothing by default",
  args: { endsAt: LAST_YEAR },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Countdown, type CountdownProps } from "./atoms/countdown/countdown";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/countdown
```

Run the gate, then `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`. Expected: green; the `Atoms/Countdown` plays pass (the Playground one waits for a real tick).

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the Countdown atom from the handoff header

The launch bar's mono ink pill, ticking once a second through
useSyncExternalStore: the server snapshot is a placeholder, so hydration
never mismatches and a static page never bakes in a stale time. It renders
the fallback (nothing by default) the second the offer ends, clears its
interval on unmount, and rejects an end time without an offset.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

