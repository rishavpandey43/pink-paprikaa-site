import type { ComponentPropsWithoutRef } from "react";

import { ChevronRight } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { Link } from "../../atoms/link/link";
import { componentVariants, type VariantProps } from "../../lib/component-variants";

const breadcrumb = componentVariants({
  slots: {
    root: "w-full min-w-0",
    // Wraps rather than clips: "Apply for a 2027 city" must never be truncated to nonsense.
    list: "flex flex-wrap items-center gap-x-2 gap-y-1 p-0 list-none",
    crumb: "flex min-w-0 items-center gap-2",
    separator: "shrink-0",
    label: "min-w-0 font-body text-body2",
    current: "min-w-0 font-body font-medium text-body2",
  },
  variants: {
    /** `inverse` is the only one that reads on a brand band, an ink band or a dark photograph. */
    tone: {
      light: {
        separator: "text-ink-400",
        label: "text-text-muted",
        current: "text-text-heading",
      },
      inverse: {
        separator: "text-text-on-brand",
        label: "text-text-on-brand",
        current: "text-text-on-brand",
      },
    },
  },
  defaultVariants: { tone: "light" },
});

/** Which `Link` colourway each tone pairs with — the trail's links are quiet, never blue. */
const LINK_VARIANT = { light: "subtle", inverse: "inverse" } as const;

export interface BreadcrumbItem {
  /** The page name as it reads in the trail — Title Case, no path fragments. */
  label: string;
  /** Where the crumb goes. Leave it off and the crumb renders as plain text. */
  href?: string;
}

export interface BreadcrumbProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children">, VariantProps<typeof breadcrumb> {
  /**
   * The trail from the site root to the current page. The last entry is always the current page —
   * it renders as text with `aria-current="page"` even if it carries an `href`.
   */
  items: BreadcrumbItem[];
  /** Names the trail for assistive tech. Change it only when a page carries two trails. */
  label?: string | undefined;
}

export function Breadcrumb({
  className,
  items,
  label = "Breadcrumb",
  tone,
  ...props
}: BreadcrumbProps) {
  const slots = breadcrumb({ tone });
  const linkVariant = LINK_VARIANT[tone ?? "light"];

  return (
    <nav aria-label={label} className={slots.root({ class: className })} {...props}>
      <ol className={slots.list()}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li className={slots.crumb()} key={item.label}>
              {isLast || item.href === undefined ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? slots.current() : slots.label()}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} size="sm" variant={linkVariant}>
                  {item.label}
                </Link>
              )}
              {isLast ? null : <Icon className={slots.separator()} icon={ChevronRight} size="xs" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
