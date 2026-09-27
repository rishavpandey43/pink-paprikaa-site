import type { SVGProps } from "react";

/**
 * Social brand glyphs. lucide-react 1.x dropped brand icons; these are Lucide 0.408's own
 * instagram / youtube / linkedin glyphs (ISC licence) — the exact icons the design system
 * references — so they match every other icon's grid and stroke.
 */
export interface GlyphProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

function Glyph({ size = 24, strokeWidth = 2, children, ...props }: GlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function InstagramGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </Glyph>
  );
}

export function YoutubeGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </Glyph>
  );
}

export function LinkedinGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </Glyph>
  );
}
