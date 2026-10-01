import { Check } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { Icon } from "../../atoms/icon/icon";
import { joinIds } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";

const checkCard = componentVariants({
  slots: {
    // Invalid and checked: the red border wins, and the pink inset goes so the red is not lined
    // with pink (ChoiceCardGroup 267e35f). The pink-50 fill still says "chosen".
    root: "flex min-h-13 cursor-pointer items-center gap-3 rounded-md border border-border-default bg-surface-card px-3.5 py-3 text-text-heading transition-control has-checked:border-border-brand has-checked:bg-pink-50 has-checked:shadow-selected has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-200 has-disabled:text-ink-400 has-aria-invalid:border-status-danger has-aria-invalid:has-checked:shadow-none",
    // The native checkbox, restyled, with the tick stacked on it in the same grid cell.
    box: "grid shrink-0 place-items-center",
    input:
      "peer col-start-1 row-start-1 size-5.5 cursor-pointer appearance-none rounded-sm border-2 border-border-brand bg-ink-000 checked:bg-pink-500 focus-visible:outline-none disabled:cursor-not-allowed aria-invalid:border-status-danger",
    tick: "pointer-events-none col-start-1 row-start-1 hidden text-ink-000 peer-checked:inline-flex",
    body: "flex min-w-0 flex-col items-start gap-0.5 text-left",
    title: "font-display text-body-sm font-bold",
    description: "text-caption",
  },
});

export interface CheckCardProps extends Omit<ComponentProps<"input">, "size" | "title" | "type"> {
  title: ReactNode;
  description?: ReactNode | undefined;
  /**
   * Sets `aria-invalid`; the box and the card border turn red (Checkbox's rule). Colour is never
   * the message: pair it with the words, or wrap the card in Field (`status` + `message`), whose
   * `aria-describedby` joins the card's own description.
   */
  isInvalid?: boolean | undefined;
}

/** A card-sized toggle with a tick box (Pay 3 months upfront, No onion no garlic). */
export function CheckCard({
  title,
  description,
  isInvalid = false,
  className,
  id,
  "aria-describedby": describedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: CheckCardProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const hasDescription = isShown(description);
  const styles = checkCard();

  return (
    <label data-surface="light" className={styles.root({ className })}>
      <span className={styles.box()}>
        <input
          type="checkbox"
          id={baseId}
          aria-labelledby={`${baseId}-title`}
          // A caller's (Field's) description joins the card's own instead of replacing it.
          aria-describedby={joinIds(
            hasDescription ? `${baseId}-description` : undefined,
            describedBy
          )}
          // `isInvalid` wins over a caller's `aria-invalid`, which otherwise stands (Field's `true`).
          aria-invalid={isInvalid ? true : ariaInvalid}
          className={styles.input()}
          {...props}
        />
        <Icon icon={Check} size="xs" className={styles.tick()} />
      </span>
      <span className={styles.body()}>
        <span id={`${baseId}-title`} className={styles.title()}>
          {title}
        </span>
        {hasDescription ? (
          <span id={`${baseId}-description`} className={styles.description()}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
