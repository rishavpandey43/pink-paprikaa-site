import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { BaseProps } from "../../lib/common-props";
import type { LinkAs } from "../../lib/link-as";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

const pageButton = componentVariants({
  base: [
    "grid h-10 min-w-10 place-items-center rounded-pill px-2.5 font-display text-body-sm font-bold",
    "tabular-nums no-underline transition-control",
  ],
  variants: {
    state: {
      idle: [
        "border border-border-default bg-surface-card text-ink-700",
        "hover:border-pink-300 hover:bg-surface-page-alt hover:text-pink-700",
        "active:press-scale-page active:bg-surface-brand-soft",
      ],
      current: ["cursor-default border border-border-brand bg-surface-brand text-text-on-brand"],
      inert: ["cursor-not-allowed border border-ink-200 bg-ink-100 text-ink-400"],
    },
  },
  defaultVariants: { state: "idle" },
});

const pagination = componentVariants({
  slots: {
    root: "min-w-0",
    list: "m-0 flex list-none flex-wrap items-center gap-2 p-0",
    // Bare ellipsis — no pill (design Pagination.jsx).
    gap: "grid min-w-6 place-items-center font-display font-bold text-ink-400",
  },
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

export type PageButtonState = "idle" | "current" | "inert";

export interface PageButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** Visual state. `current` and `inert` are not interactive. */
  state?: PageButtonState | undefined;
  children?: ReactNode;
}

/**
 * One page control for custom pagers (design `PageButton`). Pagination paints these as links
 * or buttons depending on `getPageHref` / `onPageChange`.
 */
export function PageButton({
  state = "idle",
  className,
  type = "button",
  ...props
}: PageButtonProps) {
  return <button type={type} className={pageButton({ state, className })} {...props} />;
}

type PaginationShared = BaseProps<"nav"> & {
  page: number;
  pages: number;
  /** The landmark's name. */
  label?: string | undefined;
};

export type PaginationProps = PaginationShared &
  (
    | {
        /** The href of a page — paging is navigation (static export). */
        getPageHref: (page: number) => string;
        onPageChange?: undefined;
        /** The link component (default `"a"`; pass `next/link` in an app). */
        linkAs?: LinkAs | undefined;
      }
    | {
        /** Client paging (R135). Exactly one of `getPageHref` / `onPageChange` is required. */
        onPageChange: (page: number) => void;
        getPageHref?: undefined;
        linkAs?: undefined;
      }
  );

/** Paging for press, blog and careers listings. Wraps rather than overflowing on mobile. */
export function Pagination(props: PaginationProps) {
  const {
    page,
    pages,
    label = "Pagination",
    sx,
    className,
    getPageHref,
    onPageChange,
    linkAs: LinkComponent = "a",
    ...navProps
  } = props as PaginationProps & {
    getPageHref?: (page: number) => string;
    onPageChange?: (page: number) => void;
    linkAs?: LinkAs;
  };
  if (pages < 2) return null;

  const current = Math.min(Math.max(1, Math.round(page)), pages);
  const styles = pagination();

  function pageControl(target: number, content: ReactNode, state: PageButtonState = "idle") {
    const className = pageButton({ state });
    if (state === "inert") {
      return <span className={className}>{content}</span>;
    }
    // Current stays a link/button to itself with aria-current (static-site paging).
    if (getPageHref !== undefined) {
      return (
        <LinkComponent
          href={getPageHref(target)}
          className={className}
          aria-current={state === "current" ? "page" : undefined}
        >
          {content}
        </LinkComponent>
      );
    }
    const changePage = onPageChange;
    return (
      <button
        type="button"
        className={className}
        aria-current={state === "current" ? "page" : undefined}
        onClick={() => {
          if (state !== "current") changePage(target);
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <nav
      aria-label={label}
      className={styles.root({ className: withSx(sx, className) })}
      {...navProps}
    >
      {/* An ordered list: the pages are a sequence (dev parity). */}
      <ol data-surface="light" className={styles.list()}>
        <li aria-hidden={current <= 1 ? true : undefined}>
          {current > 1 ? (
            pageControl(
              current - 1,
              <>
                <Icon icon={ChevronLeft} size="sm" />
                <span className="sr-only">Previous page</span>
              </>
            )
          ) : (
            <span className={pageButton({ state: "inert" })}>
              <Icon icon={ChevronLeft} size="sm" />
            </span>
          )}
        </li>
        {pageSlots(current, pages).map((slot, index) =>
          slot === "gap" ? (
            <li key={`gap-${String(index)}`} aria-hidden="true">
              <span className={styles.gap()}>…</span>
            </li>
          ) : (
            <li key={slot}>
              {pageControl(
                slot,
                <>
                  <span className="sr-only">Page</span> {slot}
                </>,
                slot === current ? "current" : "idle"
              )}
            </li>
          )
        )}
        <li aria-hidden={current >= pages ? true : undefined}>
          {current < pages ? (
            pageControl(
              current + 1,
              <>
                <Icon icon={ChevronRight} size="sm" />
                <span className="sr-only">Next page</span>
              </>
            )
          ) : (
            <span className={pageButton({ state: "inert" })}>
              <Icon icon={ChevronRight} size="sm" />
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}
