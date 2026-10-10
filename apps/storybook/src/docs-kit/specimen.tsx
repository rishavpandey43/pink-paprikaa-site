import type { ReactNode } from "react";

export interface SpecimenRowProps {
  /** Names the prop or token that produces the examples. */
  label: string;
  children: ReactNode;
}

/** A labelled, wrapping row of live examples. */
export function SpecimenRow({ label, children }: SpecimenRowProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-mono text-mono text-text-subtle">{label}</span>
      <div className="flex min-w-0 flex-wrap items-end gap-6">{children}</div>
    </div>
  );
}

export interface SpecimenTileProps {
  caption: string;
  /** Set when the tile floods a dark field, so what sits on it re-reads the tokens. */
  surface?: "brand" | "ink" | "soft";
  /** The tile's field, size, padding and alignment — token classes only (the base sets none, so nothing conflicts). */
  className: string;
  children: ReactNode;
}

/** One example on its own field, captioned with what produced it. */
export function SpecimenTile({ caption, surface, className, children }: SpecimenTileProps) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div data-surface={surface} className={`flex rounded-lg ${className}`}>
        {children}
      </div>
      <figcaption className="font-mono text-mono text-text-subtle">{caption}</figcaption>
    </figure>
  );
}
