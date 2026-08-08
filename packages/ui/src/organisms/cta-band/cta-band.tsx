import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import {
  SectionHeader,
  type SectionHeaderProps,
} from "../../molecules/section-header/section-header";

const ctaBand = componentVariants({
  slots: {
    // Full-bleed: the band floods edge to edge and the container inside it holds the copy back to
    // the page frame. The ground and its tiled diamond come from `PatternField`.
    root: "w-full",
    inner: [
      "mx-auto w-full max-w-(--layout-container-max)",
      "px-(--layout-gutter-fluid) py-[clamp(48px,6vw,72px)]",
    ],
    action: "",
  },
  variants: {
    /**
     * `split` hands the action to `SectionHeader`, which sits it on the heading's baseline edge and
     * wraps it onto its own line before the title can be squeezed. `center` stacks copy and action.
     */
    align: {
      split: {},
      center: { inner: "flex flex-col items-center", action: "mt-8 flex w-full justify-center" },
    },
  },
  defaultVariants: { align: "split" },
});

/**
 * Which `SectionHeader` ink each ground takes. `ink` and `brand` are both flooded, so their type
 * inverts; only `soft` keeps the light-ground steps.
 */
const HEADER_ON = { ink: "brand", brand: "brand", soft: "light" } as const;

/** The three grounds the band may flood with. */
export type CtaBandTone = keyof typeof HEADER_ON;

export interface CtaBandProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title">, VariantProps<typeof ctaBand> {
  /** ALL CAPS eyebrow naming the ask — "Franchise", "Careers". Two or three words, never a line. */
  overline?: string | undefined;
  /** The band's closing argument, in one line. */
  title: ReactNode;
  /** One sentence of support under the heading. */
  body?: string | undefined;
  /**
   * The single action, almost always one `Button`. Never two: the band exists to ask for one
   * thing, and a second action halves the answer rate. On `ink` and `brand` pass `on="brand"`.
   */
  action?: ReactNode | undefined;
  /** The ground. `ink` closes a page, `brand` is the loudest, `soft` the quietest. */
  tone?: CtaBandTone | undefined;
  /** Where the heading sits in the document outline. The type step is always the fluid `h2`. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
}

export function CtaBand({
  action,
  align = "split",
  body,
  className,
  headingLevel = 2,
  overline,
  title,
  tone = "ink",
  ...props
}: CtaBandProps) {
  const parts = ctaBand({ align });

  // `exactOptionalPropertyTypes` forbids handing an optional prop an explicit `undefined`, so the
  // optional half of the header's contract is assembled rather than passed through inline.
  const headerProps: Pick<SectionHeaderProps, "action" | "lede" | "overline"> = {};
  if (overline !== undefined) headerProps.overline = overline;
  if (body !== undefined) headerProps.lede = body;
  // A centred header drops its action by contract, so the centred band renders it underneath.
  if (action !== undefined && align === "split") headerProps.action = action;

  return (
    <PatternField className={parts.root({ className })} tile={72} tone={tone} {...props}>
      <div className={parts.inner()}>
        <SectionHeader
          align={align === "center" ? "center" : "start"}
          headingLevel={headingLevel}
          on={HEADER_ON[tone]}
          title={title}
          {...headerProps}
        />
        {action !== undefined && align === "center" ? (
          <div className={parts.action()}>{action}</div>
        ) : null}
      </div>
    </PatternField>
  );
}
