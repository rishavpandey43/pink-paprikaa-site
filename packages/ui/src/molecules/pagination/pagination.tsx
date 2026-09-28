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
              <Icon icon={ChevronLeft} size="sm" />
              {/* Text, not an Icon label: matches the pages' sr-only name text. */}
              <span className="sr-only">Previous page</span>
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
                {/* The space sits outside the sr-only span: an accessible name trims the
                    span's own text, which would read "Page5". */}
                <span className="sr-only">Page</span> {slot}
              </LinkComponent>
            </li>
          )
        )}
        {current < pages ? (
          <li>
            <LinkComponent href={getPageHref(current + 1)} className={styles.item()}>
              <Icon icon={ChevronRight} size="sm" />
              {/* Text, not an Icon label: matches the pages' sr-only name text. */}
              <span className="sr-only">Next page</span>
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
