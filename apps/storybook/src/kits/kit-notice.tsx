import { Badge } from "@pink-paprikaa-web/ui";

export const KIT_NOTICE = "Reference kit — not production copy";

export interface KitNoticeProps {
  /** The design-system kit this page reproduces, e.g. `ui_kits/website`. */
  source: string;
}

/** The badge every kit page carries: a layout reference with real facts, not shippable copy. */
export function KitNotice({ source }: KitNoticeProps) {
  return (
    <div
      role="note"
      className="flex w-full flex-wrap items-center gap-3 border-b border-border-subtle bg-surface-sunken px-gutter py-2"
    >
      <Badge color="warning">{KIT_NOTICE}</Badge>
      <span className="min-w-0 font-mono text-mono text-pretty text-text-muted">
        {source} · facts from @pink-paprikaa-web/content · reviews verbatim from Google
      </span>
    </div>
  );
}
