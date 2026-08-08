import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const pagination = componentVariants({
  slots: {
    root: "w-full min-w-0",
    // Wraps rather than overflowing: twelve pages plus two arrows do not fit 360px on one line.
    list: "flex flex-wrap items-center justify-center gap-2 p-0 list-none",
    item: "flex",
    step: [
      "grid h-11 min-w-11 place-items-center rounded-6 px-3 no-underline",
      "font-display font-bold text-body2",
      "border border-border-default bg-surface-card text-text-body",
      "transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out",
      "hover:border-brand-primary hover:bg-brand-tint hover:text-text-link",
      "active:scale-(--motion-press-scale)",
    ],
    // No destination, so it is a span rather than a link — a dead anchor is worse than no anchor.
    stepInert: [
      "grid h-11 min-w-11 cursor-not-allowed place-items-center rounded-6 px-3",
      "font-display font-bold text-body2",
      "border border-border-subtle bg-surface-sunken text-text-subtle",
    ],
    gap: "grid h-11 min-w-11 place-items-center font-display font-bold text-body2 text-text-subtle",
  },
  variants: {
    /** The page being viewed is a flooded pink pill, and stays put under the pointer. */
    isCurrent: {
      true: {
        step: [
          "border-transparent bg-brand-primary text-text-on-brand",
          "hover:border-transparent hover:bg-brand-primary hover:text-text-on-brand",
        ],
      },
      false: {},
    },
  },
  defaultVariants: { isCurrent: false },
});

/** A rendered slot: a page number, or the gap standing in for the pages between. */
type PageSlot = number | "gap";

/** Page 1 and the last page always show; everything past ±1 of the current page collapses. */
function toSlots(page: number, pages: number): PageSlot[] {
  const slots: PageSlot[] = [];
  for (let index = 1; index <= pages; index += 1) {
    if (index === 1 || index === pages || Math.abs(index - page) <= 1) {
      slots.push(index);
    } else if (slots.at(-1) !== "gap") {
      slots.push("gap");
    }
  }
  return slots;
}

export interface PaginationProps extends Omit<ComponentPropsWithoutRef<"nav">, "onChange"> {
  /** The page being viewed, counting from 1. */
  page?: number | undefined;
  /** How many pages the listing runs to. */
  pages?: number | undefined;
  /**
   * Builds the URL for a page number. Every page is a real link so the listing stays crawlable on
   * a static export — a pager built from bare buttons hides pages 2 onwards from search.
   */
  getPageHref: (page: number) => string;
  /**
   * Fires when a page link is activated, with the event, so a client router can take over. Leave
   * it off and the browser follows the href.
   */
  onPageChange?: ((page: number, event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
  /** Names the pager for assistive tech. Change it only when a page carries two pagers. */
  label?: string | undefined;
}

export function Pagination({
  className,
  page = 1,
  pages = 1,
  getPageHref,
  onPageChange,
  label = "Pagination",
  ...props
}: PaginationProps) {
  const slots = pagination();
  const current = Math.min(Math.max(1, Math.round(page)), Math.max(1, Math.round(pages)));
  const total = Math.max(1, Math.round(pages));

  const handleClick = (target: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    onPageChange?.(target, event);
  };

  const renderStep = (target: number, name: string, content: ReactNode, isCurrent = false) => (
    <a
      aria-current={isCurrent ? "page" : undefined}
      aria-label={name}
      className={slots.step({ isCurrent })}
      href={getPageHref(target)}
      onClick={handleClick(target)}
    >
      {content}
    </a>
  );

  return (
    <nav aria-label={label} className={slots.root({ class: className })} {...props}>
      <ol className={slots.list()}>
        <li className={slots.item()}>
          {current > 1 ? (
            renderStep(current - 1, "Previous page", <Icon icon={ChevronLeft} size="sm" />)
          ) : (
            <span className={slots.stepInert()}>
              <Icon icon={ChevronLeft} size="sm" />
            </span>
          )}
        </li>
        {toSlots(current, total).map((slot, index) => (
          <li className={slots.item()} key={`${String(slot)}-${String(index)}`}>
            {slot === "gap" ? (
              <span aria-hidden="true" className={slots.gap()}>
                …
              </span>
            ) : (
              renderStep(slot, `Page ${String(slot)}`, slot, slot === current)
            )}
          </li>
        ))}
        <li className={slots.item()}>
          {current < total ? (
            renderStep(current + 1, "Next page", <Icon icon={ChevronRight} size="sm" />)
          ) : (
            <span className={slots.stepInert()}>
              <Icon icon={ChevronRight} size="sm" />
            </span>
          )}
        </li>
      </ol>
    </nav>
  );
}
