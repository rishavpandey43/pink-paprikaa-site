"use client";

import { useEffect } from "react";

/** Reveal when a section is 8% into the viewport, as the handoff's motion does. */
const REVEAL_ROOT_MARGIN = "0px 0px -8% 0px";

export interface RevealObserverProps {
  /** Elements to reveal. Default: every `<section>`. */
  selector?: string;
}

/**
 * Fades and lifts sections into view once, as they scroll in (spec §3.2.4). Mount once near the
 * root. Sections already on screen are never touched, so there is no flash and no LCP cost; with
 * no IntersectionObserver nothing is hidden; reduced motion and print are handled in CSS.
 */
export function RevealObserver({ selector = "section" }: RevealObserverProps): null {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-pp-revealed", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: REVEAL_ROOT_MARGIN }
    );

    const tagged = new Set<Element>();
    const tagNewSections = () => {
      // `:is()` so a selector list ("section, .reveal") is excluded as a whole, not just its tail.
      for (const element of document.querySelectorAll(`:is(${selector}):not([data-pp-seen])`)) {
        element.setAttribute("data-pp-seen", "");
        tagged.add(element);
        if (element.getBoundingClientRect().top < window.innerHeight) continue;
        element.setAttribute("data-pp-reveal", "");
        observer.observe(element);
      }
    };

    tagNewSections();
    const mutations = new MutationObserver(tagNewSections);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      // Untag, so the next setup (StrictMode, Fast Refresh, a remount) takes these over instead of
      // skipping them — and nothing is left hidden with no observer to reveal it.
      for (const element of tagged) {
        element.removeAttribute("data-pp-seen");
        if (!element.hasAttribute("data-pp-revealed")) element.removeAttribute("data-pp-reveal");
      }
    };
  }, [selector]);

  return null;
}
