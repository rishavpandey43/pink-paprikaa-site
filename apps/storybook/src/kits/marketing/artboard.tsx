import type { ReactNode } from "react";

import { POST_FORMATS, type PostFormat } from "@pink-paprikaa-web/ui";

export interface ArtboardProps {
  format: PostFormat;
  /** The preview's maximum width — a spacing-scale `max-w-*`, so it shrinks to fit a phone. */
  className: string;
  children: ReactNode;
}

/** A board on its preview card, captioned with the true canvas it is authored at. */
export function Artboard({ format, className, children }: ArtboardProps) {
  const { width, height, label } = POST_FORMATS[format];
  return (
    <figure
      className={`flex w-full min-w-0 flex-col gap-2.5 rounded-lg bg-surface-card p-3 shadow-1 ${className}`}
    >
      {children}
      <figcaption className="font-mono text-mono text-text-subtle uppercase">
        {label} · {width}×{height}
      </figcaption>
    </figure>
  );
}
