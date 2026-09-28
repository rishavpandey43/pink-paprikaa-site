import { type ComponentProps, createElement, type ReactNode } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { isShown } from "../../lib/is-shown";

export interface FeatureItemProps extends Omit<ComponentProps<"div">, "title"> {
  icon: IconComponent;
  title: ReactNode;
  description?: ReactNode | undefined;
  /** md: 44px tile, 17px title (Catering "Why us"). sm: 40px tile, 16px title (perks, "What you get"). */
  size?: "sm" | "md" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

const featureItem = componentVariants({
  slots: {
    root: "flex items-start gap-3.5",
    tile: "grid shrink-0 place-items-center rounded-md bg-feature-item-tile text-feature-item-icon",
    body: "flex min-w-0 flex-col gap-1",
    title: "font-display text-text-heading",
    description: "m-0 max-w-none text-text-muted",
  },
  variants: {
    size: {
      md: { tile: "size-11", title: "text-feature-item-title-md", description: "text-body" },
      sm: { tile: "size-10", title: "text-feature-item-title-sm", description: "text-body-sm" },
    },
  },
});

/** An icon tile, a title and a line — "Why people call us back", office perks, "What you get". */
export function FeatureItem({
  icon,
  title,
  description,
  size = "md",
  headingLevel = 3,
  className,
  ...props
}: FeatureItemProps) {
  const styles = featureItem({ size });

  return (
    <div className={styles.root({ className })} {...props}>
      <span className={styles.tile()}>
        <Icon icon={icon} size="md" />
      </span>
      <div className={styles.body()}>
        {/* createElement, not `const Heading = headingTag(…)` (R83): the React Compiler lint reads a
            capitalised call result as a component created during render. */}
        {createElement(headingTag(headingLevel), { className: styles.title() }, title)}
        {isShown(description) ? <p className={styles.description()}>{description}</p> : null}
      </div>
    </div>
  );
}
