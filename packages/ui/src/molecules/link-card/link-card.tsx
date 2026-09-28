import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  createElement,
  type ElementType,
  isValidElement,
  type ReactNode,
} from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";

type LinkCardTone = "default" | "brand" | "ink" | "soft";

const SURFACE_OF: Readonly<Record<LinkCardTone, "light" | "brand" | "ink" | "soft">> = {
  default: "light",
  brand: "brand",
  ink: "ink",
  soft: "soft",
};

const linkCard = componentVariants({
  slots: {
    root: "flex text-inherit no-underline transition duration-fast motion-safe:hover:lift",
    media: "shrink-0",
    body: "flex min-w-0 flex-col",
    title: "font-display text-text-heading",
    description: "m-0 max-w-none",
    cta: "inline-flex items-center gap-1 font-display text-body-sm font-bold text-text-brand",
  },
  variants: {
    layout: {
      row: {
        root: "items-center gap-3.5 rounded-lg p-3",
        media: "size-22",
        body: "gap-1",
        title: "text-link-card-title",
        description: "text-body-sm text-text-muted",
      },
      stack: {
        root: "flex-col gap-3 rounded-xl p-7",
        media: "w-full",
        body: "gap-1.5",
        title: "text-link-card-title-lg",
        description: "text-body text-text-body",
      },
    },
    tone: {
      default: { root: "border border-border-subtle bg-surface-card shadow-1 hover:shadow-3" },
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
      soft: { root: "bg-surface-brand-soft" },
    },
  },
});

// The anchor's own `media` (a media query string) gives way to the media slot.
export interface LinkCardProps extends Omit<ComponentProps<"a">, "media" | "title"> {
  title: ReactNode;
  description?: ReactNode | undefined;
  /** Link words under the text, followed by an arrow ("See plans"). */
  cta?: string | undefined;
  /** An ImageSlot: 88px square in a row, full width in a stack. */
  media?: ReactNode | undefined;
  layout?: "row" | "stack" | undefined;
  tone?: LinkCardTone | undefined;
  /** Render into the child link element (next/link, an external anchor) instead of an `<a>`. */
  asChild?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * A whole-card link: Home's three "doors" (row) and About's CTA cards (stack, tones). The card IS
 * the link (its title a heading inside it), so it takes the link's own focus ring — no stretched
 * overlay. A `target="_blank"` card, on it or on the asChild link, says it opens in a new tab.
 */
export function LinkCard({
  title,
  description,
  cta,
  media,
  layout = "row",
  tone = "default",
  asChild = false,
  headingLevel = 3,
  className,
  children,
  ...props
}: LinkCardProps) {
  const styles = linkCard({ layout, tone });
  const Component: ElementType = asChild ? Slot.Root : "a";
  const target =
    asChild && isValidElement<{ target?: unknown }>(children)
      ? children.props.target
      : props.target;
  const content = (
    <>
      {isShown(media) ? <div className={styles.media()}>{media}</div> : null}
      <div className={styles.body()}>
        {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads a
            capitalised call result as a component created during render. */}
        {createElement(headingTag(headingLevel), { className: styles.title() }, title)}
        {isShown(description) ? <p className={styles.description()}>{description}</p> : null}
        {cta ? (
          <span className={styles.cta()}>
            {cta}
            <Icon icon={ArrowRight} size="xs" />
          </span>
        ) : null}
        {target === "_blank" ? <span className="sr-only">Opens in a new tab</span> : null}
      </div>
    </>
  );

  return (
    <Component data-surface={SURFACE_OF[tone]} className={styles.root({ className })} {...props}>
      {asChild ? <Slot.Slottable child={children}>{() => content}</Slot.Slottable> : content}
    </Component>
  );
}
