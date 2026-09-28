import type { ComponentProps } from "react";

import { Logo } from "../../atoms/logo/logo";
import { componentVariants } from "../../lib/component-variants";

const logoLockup = componentVariants({
  slots: { root: "grid", logo: "" },
  variants: {
    // Clear space around the logo = the height of its lead "P" (the "Pink" cap, top to baseline),
    // measured at 44.4px on the 240px lockup = width ÷ 5.4, snapped to the 4px scale.
    size: {
      sm: { root: "p-9", logo: "w-50" },
      md: { root: "p-11", logo: "w-60" },
      lg: { root: "p-13", logo: "w-70" },
      xl: { root: "p-17", logo: "w-90" },
    },
    align: {
      start: { root: "justify-items-start" },
      center: { root: "justify-items-center" },
    },
  },
});

export interface LogoLockupProps extends ComponentProps<"div"> {
  /** `white` on pink, ink or photography; `pink` on light artwork; `badge` on its own plate. */
  tone?: "pink" | "white" | "badge" | undefined;
  /** Lockup width: 200 / 240 / 280 / 360px. Never below 200 with the tagline. */
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  /** `false` drops to the wordmark — only where the tagline cannot read. */
  hasTagline?: boolean | undefined;
  align?: "start" | "center" | undefined;
  /** Hide the logo from assistive tech when the artwork already names the brand in text nearby. */
  isDecorative?: boolean | undefined;
}

/**
 * The signature that closes a piece of marketing artwork. The tagline is part of the supplied
 * artwork, so it scales with the mark and can never drift out of sync.
 */
export function LogoLockup({
  tone = "white",
  size = "md",
  hasTagline = true,
  align = "start",
  isDecorative = false,
  className,
  ...props
}: LogoLockupProps) {
  const styles = logoLockup({ size, align });
  return (
    <div className={styles.root({ className })} {...props}>
      <Logo
        variant={hasTagline ? "lockup" : "wordmark"}
        tone={tone}
        isDecorative={isDecorative}
        className={styles.logo()}
      />
    </div>
  );
}
