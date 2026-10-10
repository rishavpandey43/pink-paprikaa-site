### Task 9: CouponTicket

**Files:**

- Create: `packages/design-tokens/tokens/component/coupon-ticket.json`
- Create: `packages/ui/src/molecules/coupon-ticket/coupon-ticket.tsx`, `coupon-copy-button.tsx`, `coupon-ticket.test.tsx`, `coupon-ticket.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/coupon-ticket/coupon-ticket.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                      | Ruling  | Where, or the spec clause                                                                                               |
| ----------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| Code, headline and terms printed                                              | ALREADY | test "shows the headline, the terms, the code and the logo"                                                             |
| `terms` optional; story `WithoutTerms`                                        | DROP    | contract §6 `terms: string` (required); the design system: "always state the expiry"                                    |
| Stub is a copy button named by its code                                       | ALREADY | the button's name is its content, "Use code PAPRIKAA50 Tap to copy"                                                     |
| Writes the code to the clipboard; `onCopy(code)`                              | ALREADY | test "copies the code from the stub…"                                                                                   |
| Copied flash on the stub, announced to screen readers                         | ADD     | the hint is already `aria-live="polite"`; the copy test now asserts the announcement                                    |
| Reachable and operable from the keyboard                                      | ADD     | test "copies from the keyboard"                                                                                         |
| Nothing tappable and no "Tap to copy" on print artwork                        | ADD     | assertion in "is plain artwork when not copyable"                                                                       |
| A refused / missing clipboard still flashes "Copied"                          | DROP    | superseded by deviation 8 — a refused copy selects the code instead (test "never claims a copy…")                       |
| Brand / light skins                                                           | ALREADY | `it.each` surface test                                                                                                  |
| Headline steps with `size`                                                    | ADD     | test "sets the headline at artwork size for lg"                                                                         |
| Stacks below `sm`, splits from `sm` (a 360px stub is too narrow for the code) | ADD     | `md` root `flex-col sm:flex-row` with a horizontal perforation below `sm`; `lg` (artwork) always splits; test "stacks…" |
| Notches match the ground behind the ticket                                    | ALREADY | test "colours the punched notches…"                                                                                     |
| Press = scale on the copy stub                                                | ADD     | `isCopyable` stub `transition-control active:press-scale`                                                               |
| Diamond `PatternField` behind the stub                                        | DROP    | D2 — the design-system `CouponTicket.jsx` stub is a flat fill                                                           |
| Logo hidden (`label=""`)                                                      | ALREADY | the plan names the logo (test asserts `img` "Pink Paprikaa…") — artwork sign-off                                        |
| Caller `className` replaces the ticket radius                                 | ADD     | test "lets a caller className replace the ticket radius"                                                                |
| axe on brand-copyable and light-print                                         | ADD     | last test renders both                                                                                                  |
| Stories `Default`, `Tones`, `CanvasSize`, `ForPrint`                          | ALREADY | `Playground` / `Brand`, `Light`, `OnPinkArtwork` (lg, not copyable)                                                     |
| Stories `OnATintedPage`, `LongCode`                                           | ADD     | stories `OnTintedPage`, `LongCode`; plus `Narrow` (360, stacked)                                                        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Logo` (`tone="white" | "pink"`, height via `h-10 w-auto`), `Icon` (`Copy`, `Check`), semantic surface tokens (brand tone sets `data-surface="brand"`, light sets `light`).
- Produces: `CouponTicket`, `type CouponTicketProps` (contract §6 + deviation 8). `coupon-copy-button.tsx` is the client leaf (not exported from the barrel). Defaults: `tone = "brand"`, `size = "md"`, `notch = "page"`, `isCopyable = true`, `codeLabel = "Use code"`, `copyHint = "Tap to copy"`, `copiedLabel = "Copied"`. `onCopy(code)` fires only after the clipboard accepted the code.

- [ ] **Step 1: Component tokens**

Two sizes replace the design system's width-proportional type: `md` (560px — screens, the card preview) and `lg` (900px — artwork). The design system's `md` terms (0.019 × 560 = 10.6px) are floored to the ramp's 14px so the terms stay legible on screens.

Create `packages/design-tokens/tokens/component/coupon-ticket.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "coupon-ticket-md": { "$value": "560px", "$description": "Ticket width on screens." },
    "coupon-ticket-lg": { "$value": "900px", "$description": "Ticket width on artwork." },
    "coupon-ticket-stub-md": { "$value": "168px", "$description": "Code stub, 0.3 × 560." },
    "coupon-ticket-stub-lg": { "$value": "270px", "$description": "Code stub, 0.3 × 900." },
    "coupon-ticket-notch": { "$value": "34px", "$description": "Punched perforation notch." }
  },
  "text": {
    "$type": "typography",
    "coupon-ticket-headline-md": {
      "$value": {
        "fontSize": "30px",
        "lineHeight": 1.05,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "coupon-ticket-headline-lg": {
      "$value": {
        "fontSize": "50px",
        "lineHeight": 1.05,
        "letterSpacing": "-0.025em",
        "fontWeight": "{font-weight.black}"
      }
    },
    "coupon-ticket-code-md": {
      "$value": {
        "fontSize": "18px",
        "lineHeight": 1.2,
        "letterSpacing": "0.04em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "coupon-ticket-code-lg": {
      "$value": {
        "fontSize": "29px",
        "lineHeight": 1.2,
        "letterSpacing": "0.04em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "coupon-ticket-stub-label-lg": {
      "$value": {
        "fontSize": "14px",
        "lineHeight": 1.2,
        "letterSpacing": "0.14em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Stub label at artwork size; md uses the overline step."
    }
  }
}
```

In `component-variants.ts` append to `TEXT` `"coupon-ticket-headline-md", "coupon-ticket-headline-lg", "coupon-ticket-code-md", "coupon-ticket-code-lg", "coupon-ticket-stub-label-lg",` and to `SPACING` `"coupon-ticket-md", "coupon-ticket-lg", "coupon-ticket-stub-md", "coupon-ticket-stub-lg", "coupon-ticket-notch",`. No new contrast pair: the brand tone paints semantic tokens on the brand surface and its `surface-card` stub (declared in `brand-surface` / `brand-card`); the light tone paints them on `surface-card` and `surface-page-alt` (declared in `light-text`).

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`
Expected: success; `--spacing-coupon-ticket-notch: 34px;` in `theme.css`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/coupon-ticket/coupon-ticket.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { CouponTicket } from "./coupon-ticket";

const TICKET = {
  code: "PAPRIKAA50",
  headline: "50% off your first order",
  terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
} as const;

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("CouponTicket", () => {
  it("shows the headline, the terms, the code and the logo", () => {
    render(<CouponTicket {...TICKET} />);
    expect(screen.getByText(TICKET.headline)).toBeInTheDocument();
    expect(screen.getByText(TICKET.terms)).toBeInTheDocument();
    expect(screen.getByText(TICKET.code)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Pink Paprikaa/ })).toBeInTheDocument();
  });

  it("copies the code from the stub, confirms it, and reports the copied code", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: /Use code PAPRIKAA50/ }));
    expect(await navigator.clipboard.readText()).toBe(TICKET.code);
    expect(onCopy).toHaveBeenCalledWith(TICKET.code);
    expect(screen.getAllByText("Copied")).not.toHaveLength(0);
    // The flash is visual; the live hint is what a screen reader hears.
    expect(
      screen.getAllByText("Copied").some((node) => node.getAttribute("aria-live") === "polite")
    ).toBe(true);
  });

  it("copies from the keyboard", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.tab();
    expect(screen.getByRole("button", { name: /Use code/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(await screen.findAllByText("Copied")).not.toHaveLength(0);
    expect(onCopy).toHaveBeenCalledWith(TICKET.code);
  });

  it("returns to its hint once the confirmation has been seen", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
    render(<CouponTicket {...TICKET} />);
    await user.click(screen.getByRole("button", { name: /Use code/ }));
    expect(screen.getAllByText("Copied")).not.toHaveLength(0);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("Tap to copy")).toBeInTheDocument();
  });

  it("never claims a copy the browser refused — it selects the code to copy by hand", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    const onCopy = vi.fn();
    render(<CouponTicket {...TICKET} onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: /Use code/ }));
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(TICKET.code);
  });

  it("is plain artwork when not copyable — nothing to tap", () => {
    render(<CouponTicket {...TICKET} isCopyable={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Tap to copy")).not.toBeInTheDocument();
    expect(screen.getByText(TICKET.code)).toBeInTheDocument();
  });

  it("takes its stub words from props", () => {
    render(<CouponTicket {...TICKET} codeLabel="Code" copyHint="Copy" />);
    expect(screen.getByRole("button", { name: /Code PAPRIKAA50 Copy/ })).toBeInTheDocument();
  });

  it.each([
    ["brand", "brand"],
    ["light", "light"],
  ] as const)("sets the %s surface so its text follows the field", (tone, surface) => {
    const { container } = render(<CouponTicket {...TICKET} tone={tone} />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", surface);
  });

  it("colours the punched notches to match the ground behind the ticket", () => {
    const { container } = render(<CouponTicket {...TICKET} notch="brand" />);
    const notches = container.querySelectorAll('[aria-hidden="true"] > .rounded-pill');
    expect(notches).toHaveLength(2);
    for (const notch of notches) expect(notch).toHaveClass("bg-surface-brand");
  });

  it("sets the headline at artwork size for lg", () => {
    render(<CouponTicket {...TICKET} size="lg" />);
    expect(screen.getByText(TICKET.headline)).toHaveClass("text-coupon-ticket-headline-lg");
  });

  it("stacks at phone width and splits from sm; artwork (lg) always splits", () => {
    const { container, rerender } = render(<CouponTicket {...TICKET} />);
    expect(container.firstElementChild).toHaveClass("flex-col", "sm:flex-row");
    rerender(<CouponTicket {...TICKET} size="lg" />);
    expect(container.firstElementChild).not.toHaveClass("flex-col");
  });

  it("lets a caller className replace the ticket radius", () => {
    const { container } = render(<CouponTicket {...TICKET} className="rounded-lg" />);
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-xl");
  });

  it("has no accessibility violations, copyable and as print artwork", async () => {
    const { container } = render(
      <>
        <CouponTicket {...TICKET} />
        <CouponTicket
          code="CHAI20"
          headline="20% off all chai, all week"
          terms="Dine-in only. Till 30 Sep."
          tone="light"
          isCopyable={false}
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

(user-event 14 installs a working `navigator.clipboard` for every `userEvent.setup()`; `readText()` reads back what the component wrote.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- coupon-ticket 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./coupon-ticket`.

- [ ] **Step 4: Implement the client leaf**

`packages/ui/src/molecules/coupon-ticket/coupon-copy-button.tsx`:

```tsx
"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Icon } from "../../atoms/icon/icon";

/** How long the stub reads "Copied" before returning to its hint. */
const COPIED_FLASH_MS = 1800;

/** Class names computed by the server CouponTicket, so the leaf holds behaviour only. */
export interface CouponStubClassNames {
  root: string;
  inner: string;
  label: string;
  code: string;
  hint: string;
}

export interface CouponCopyButtonProps {
  code: string;
  codeLabel: string;
  copyHint: string;
  copiedLabel: string;
  classNames: CouponStubClassNames;
  onCopy?: ((code: string) => void) | undefined;
}

/** The ticket's code stub as a copy button. Pair `onCopy` with a Snackbar for the confirmation. */
export function CouponCopyButton({
  code,
  codeLabel,
  copyHint,
  copiedLabel,
  classNames,
  onCopy,
}: CouponCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isCopied) return undefined;
    const timer = setTimeout(() => {
      setIsCopied(false);
    }, COPIED_FLASH_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isCopied]);

  /** Recovery when the browser refuses the copy: leave the code selected to copy by hand. */
  const selectCode = () => {
    const node = codeRef.current;
    const selection = window.getSelection();
    if (node === null || selection === null) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleClick = () => {
    // Insecure origins expose no clipboard at all.
    if (!("clipboard" in navigator)) {
      selectCode();
      return;
    }
    navigator.clipboard.writeText(code).then(
      () => {
        setIsCopied(true);
        onCopy?.(code);
      },
      () => {
        selectCode();
      }
    );
  };

  return (
    <button type="button" onClick={handleClick} className={classNames.root}>
      <span className={classNames.inner}>
        <span className={classNames.label}>{isCopied ? copiedLabel : codeLabel}</span>
        <span ref={codeRef} className={classNames.code}>
          {code}
        </span>
        <span aria-live="polite" className={classNames.hint}>
          <Icon icon={isCopied ? Check : Copy} size="xs" />
          {isCopied ? copiedLabel : copyHint}
        </span>
      </span>
    </button>
  );
}
```

- [ ] **Step 5: Implement the ticket**

`packages/ui/src/molecules/coupon-ticket/coupon-ticket.tsx`:

```tsx
import type { ComponentProps } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants } from "../../lib/component-variants";
import { CouponCopyButton } from "./coupon-copy-button";

const couponTicket = componentVariants({
  slots: {
    root: "relative flex w-full items-stretch overflow-hidden rounded-xl text-text-heading shadow-3",
    main: "min-w-0 flex-1",
    logo: "w-auto",
    headline: "mb-0 max-w-none font-display text-balance",
    terms: "mb-0 max-w-text-measure-narrow text-text-muted",
    // The perforation sits exactly between main and stub, whatever the ticket's width. Split, it is
    // a zero-width column with notches on the top and bottom edges; stacked (md below `sm`), a
    // zero-height row with notches on the two side edges. The size variants set which.
    perforation: "relative shrink-0",
    rule: "absolute border-dashed border-border-default",
    notchStart:
      "size-coupon-ticket-notch absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-pill",
    notchEnd: "size-coupon-ticket-notch absolute rounded-pill",
    stub: "grid shrink-0 place-items-center p-5 text-center",
    stubInner: "grid justify-items-center gap-2",
    stubLabel: "font-display text-text-muted uppercase",
    code: "font-mono wrap-anywhere text-text-brand",
    hint: "inline-flex items-center gap-1.5 text-text-muted",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand", stub: "bg-surface-card" },
      light: { root: "border border-border-default bg-surface-card", stub: "bg-surface-page-alt" },
    },
    size: {
      md: {
        // Stacked below `sm`: split at 360px the stub would be too narrow for a mono code.
        root: "max-w-coupon-ticket-md flex-col sm:flex-row",
        perforation: "h-0 sm:h-auto sm:w-0",
        rule: "inset-x-4.5 -top-px border-t-2 sm:inset-x-auto sm:inset-y-4.5 sm:-left-px sm:border-t-0 sm:border-l-2",
        notchEnd:
          "top-0 right-0 translate-x-1/2 -translate-y-1/2 sm:top-auto sm:right-auto sm:bottom-0 sm:left-0 sm:-translate-x-1/2 sm:translate-y-1/2",
        main: "p-6",
        logo: "h-10",
        headline: "text-coupon-ticket-headline-md mt-4",
        terms: "mt-3 text-body-sm",
        stub: "sm:w-coupon-ticket-stub-md",
        stubLabel: "text-overline",
        code: "text-coupon-ticket-code-md",
        hint: "text-caption",
      },
      lg: {
        // Artwork is scaled, never reflowed: always split, whatever the viewport.
        root: "max-w-coupon-ticket-lg",
        perforation: "w-0",
        rule: "inset-y-4.5 -left-px border-l-2",
        notchEnd: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
        main: "p-10",
        logo: "h-17",
        headline: "text-coupon-ticket-headline-lg mt-7",
        terms: "mt-5 text-body-lg",
        stub: "w-coupon-ticket-stub-lg",
        stubLabel: "text-coupon-ticket-stub-label-lg",
        code: "text-coupon-ticket-code-lg",
        hint: "text-body-sm",
      },
    },
    notch: {
      page: { notchStart: "bg-surface-page", notchEnd: "bg-surface-page" },
      tint: { notchStart: "bg-surface-page-alt", notchEnd: "bg-surface-page-alt" },
      sunken: { notchStart: "bg-surface-sunken", notchEnd: "bg-surface-sunken" },
      brand: { notchStart: "bg-surface-brand", notchEnd: "bg-surface-brand" },
    },
    // Press = the system's scale (Button's treatment).
    isCopyable: {
      true: { stub: "cursor-pointer transition-control active:press-scale" },
      false: {},
    },
  },
});

export interface CouponTicketProps extends ComponentProps<"div"> {
  /** Uppercase promo code, set in Space Mono. */
  code: string;
  /** Eight words at most. */
  headline: string;
  /** Full sentences; always state the expiry. */
  terms: string;
  tone?: "brand" | "light" | undefined;
  /** md = 560px (screens), lg = 900px (artwork). The ticket never exceeds its container. */
  size?: "md" | "lg" | undefined;
  /** Colour of the punched notches — match the ground behind the ticket. */
  notch?: "page" | "tint" | "sunken" | "brand" | undefined;
  /** The stub copies the code. `false` for print and PostFrame artboards. */
  isCopyable?: boolean | undefined;
  /** Fires with the code once the clipboard accepted it — pair it with a Snackbar. */
  onCopy?: ((code: string) => void) | undefined;
  codeLabel?: string | undefined;
  copyHint?: string | undefined;
  copiedLabel?: string | undefined;
}

/** Perforated voucher for stories, DMs, table cards and print handouts. */
export function CouponTicket({
  code,
  headline,
  terms,
  tone = "brand",
  size = "md",
  notch = "page",
  isCopyable = true,
  onCopy,
  codeLabel = "Use code",
  copyHint = "Tap to copy",
  copiedLabel = "Copied",
  className,
  ...props
}: CouponTicketProps) {
  const styles = couponTicket({ tone, size, notch, isCopyable });

  return (
    <div data-surface={tone} className={styles.root({ className })} {...props}>
      <div className={styles.main()}>
        <Logo tone={tone === "brand" ? "white" : "pink"} className={styles.logo()} />
        <p className={styles.headline()}>{headline}</p>
        <p className={styles.terms()}>{terms}</p>
      </div>
      <div aria-hidden="true" className={styles.perforation()}>
        <span className={styles.rule()} />
        <span className={styles.notchStart()} />
        <span className={styles.notchEnd()} />
      </div>
      {isCopyable ? (
        <CouponCopyButton
          code={code}
          codeLabel={codeLabel}
          copyHint={copyHint}
          copiedLabel={copiedLabel}
          classNames={{
            root: styles.stub(),
            inner: styles.stubInner(),
            label: styles.stubLabel(),
            code: styles.code(),
            hint: styles.hint(),
          }}
          onCopy={onCopy}
        />
      ) : (
        <div className={styles.stub()}>
          <div className={styles.stubInner()}>
            <span className={styles.stubLabel()}>{codeLabel}</span>
            <span className={styles.code()}>{code}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- coupon-ticket 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 7: Stories — `CouponTicket.card.html` rows "brand" and "light", the marketing-kit ticket on pink, and a copy `play`**

`packages/ui/src/molecules/coupon-ticket/coupon-ticket.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { CouponTicket } from "./coupon-ticket";

const meta = {
  title: "Molecules/CouponTicket",
  component: CouponTicket,
  args: {
    code: "PAPRIKAA50",
    headline: "50% off your first order",
    terms: "One use per guest. Dine-in and pickup. Till 30 Sep.",
    onCopy: fn(),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Voucher artwork for stories, DMs, table cards and print handouts. The code stub copies to the clipboard on tap; always pair `onCopy` with a Snackbar — the stub\'s own "Copied" flash is reinforcement, not the confirmation. If the browser refuses the copy, the code is selected so it can be copied by hand. Pass `isCopyable={false}` on print artwork and inside PostFrame artboards. `notch` colours the punched notches to match the ground behind the ticket.',
      },
    },
  },
} satisfies Meta<typeof CouponTicket>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "brand". */
export const Brand: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Use code PAPRIKAA50/ }));
    await expect(args.onCopy).toHaveBeenCalledWith("PAPRIKAA50");
  },
};

/** Card row "light". */
export const Light: Story = {
  args: {
    tone: "light",
    code: "CHAI20",
    headline: "20% off all chai, all week",
    terms: "Dine-in only. Till 30 Sep.",
  },
};

/** The marketing kit's ticket: artwork size, light, on a pink field, not tappable. */
export const OnPinkArtwork: Story = {
  args: { tone: "light", size: "lg", notch: "brand", isCopyable: false },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-10">
      <CouponTicket {...args} />
    </div>
  ),
};

/** The notches are punched holes: on a tinted page `notch="tint"` keeps them from reading as blobs. */
export const OnTintedPage: Story = {
  args: { tone: "light", notch: "tint" },
  render: (args) => (
    <div className="bg-surface-page-alt p-8">
      <CouponTicket {...args} />
    </div>
  ),
};

/** A long code wraps inside the stub instead of widening the ticket. */
export const LongCode: Story = {
  args: { code: "PAPRIKAAFIRSTORDER", headline: `${formatRupees(150)} off your first order` },
};

/** 360px: `md` stacks, the perforation runs across and the notches sit on the side edges. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  play: async ({ canvasElement }) => {
    const ticket = canvasElement.querySelector("[data-surface]");
    await expect(ticket).not.toBeNull();
    if (ticket === null) return;
    await expect(ticket.scrollWidth).toBeLessThanOrEqual(ticket.clientWidth);
  },
};
```

- [ ] **Step 8: Export**

```ts
export { CouponTicket, type CouponTicketProps } from "./molecules/coupon-ticket/coupon-ticket";
```

- [ ] **Step 9: Gate** — `<paths>` = `packages/design-tokens/tokens/component/coupon-ticket.json packages/ui/src/molecules/coupon-ticket packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 10: Commit**

```bash
git add packages/design-tokens/tokens/component/coupon-ticket.json packages/ui/src/molecules/coupon-ticket packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): CouponTicket molecule

Perforated voucher (brand/light, screen/artwork sizes) whose notches sit
on the perforation at any width. The copy stub is the only client code:
onCopy fires only after the clipboard accepted the code, and a refused
copy leaves the code selected instead of flashing a false Copied.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

