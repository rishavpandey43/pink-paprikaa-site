/**
 * Public surface of @pink-paprikaa-web/ui — the only barrel in the package. Named re-exports only.
 */
export { Icon, type IconComponent, type IconProps } from "./atoms/icon/icon";
export {
  InstagramGlyph,
  LinkedinGlyph,
  YoutubeGlyph,
  type GlyphProps,
} from "./atoms/icon/brand-glyphs";
export { Logo, type LogoProps } from "./atoms/logo/logo";
export { RevealObserver, type RevealObserverProps } from "./lib/reveal-observer";
export { type HeadingLevel, headingTag } from "./lib/heading";
export type { LinkAs, LinkAsProps } from "./lib/link-as";
