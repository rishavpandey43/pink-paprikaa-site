import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import type { IconComponent } from "../../atoms/icon/icon";
import type { BaseProps } from "../../lib/common-props";
import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

export interface DockAction {
  label: string;
  /** A `https://wa.me/…` or `tel:` link — the app builds it. */
  href: string;
  icon: IconComponent;
}

const actionDock = componentVariants({
  slots: {
    root: "fixed inset-x-0 bottom-0 z-dock flex gap-2 border-t border-border-subtle bg-surface-card px-3 pt-2.5 pb-action-dock-bottom shadow-4 md:inset-x-auto md:right-6 md:bottom-action-dock-float md:border-0 md:bg-transparent md:p-0 md:shadow-none",
    secondary: "md:hidden",
    primary: "min-w-0 flex-1 shadow-brand md:flex-none",
  },
});

export interface ActionDockProps extends BaseProps<"div"> {
  primary: DockAction;
  /** Phones only, as an icon beside the primary pill (the handoff's Call). */
  secondary?: DockAction | undefined;
}

/**
 * The page's always-there action. Below md: a white bar fixed to the bottom with the secondary
 * icon and the primary pill, padded for the iOS home indicator. From md: the primary pill alone,
 * floating bottom-right. Pair it with `SiteFooter hasDockClearance` so it never covers the footer.
 */
export function ActionDock({ primary, secondary, sx, className, ...props }: ActionDockProps) {
  const slots = actionDock();
  return (
    <div
      data-surface="light"
      className={slots.root({ className: withSx(sx, className) })}
      {...props}
    >
      {secondary ? (
        <IconButton
          asChild
          icon={secondary.icon}
          label={secondary.label}
          variant="secondary"
          size="lg"
          className={slots.secondary()}
        >
          <a href={secondary.href} aria-label={secondary.label} />
        </IconButton>
      ) : null}
      <Button asChild size="lg" icon={primary.icon} className={slots.primary()}>
        <a href={primary.href}>{primary.label}</a>
      </Button>
    </div>
  );
}
