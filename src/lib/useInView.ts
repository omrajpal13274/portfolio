"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once, the first time an element is actually visible on screen.
 *
 * Reveal animations on this site originally hung off ScrollTrigger with
 * `containerAnimation`, which computes trigger positions from layout measured
 * at refresh time. On the horizontal track that math ran late enough that
 * whole panels sat on screen completely blank, and since `gsap.from` applies
 * its start state immediately, "trigger fired late" reads to a visitor as
 * "the content is missing".
 *
 * IntersectionObserver has no such problem: it reports the real rendered
 * rectangle, so an ancestor transform is already accounted for. Just as
 * importantly the failure mode inverts — if this never fires, the element is
 * simply visible and un-animated, rather than invisible forever.
 *
 * Scrubbed parallax still uses ScrollTrigger, which is what it is good at.
 */
export function useInView<T extends Element>(
  rootMargin = "0px 0px -5% 0px",
) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    // Guard for environments without IO (and for jsdom in tests): treat as
    // already visible so content is never withheld. This cannot be a lazy
    // initial state — IntersectionObserver is absent during SSR too, which
    // would resolve to `true` on the server and `false` on the client and
    // mismatch on hydration. The extra render it costs happens once, in a
    // path no real browser takes.
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [seen, rootMargin]);

  return [ref, seen] as const;
}
