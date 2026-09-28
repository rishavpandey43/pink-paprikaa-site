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
