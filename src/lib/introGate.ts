"use client";

import { useSyncExternalStore } from "react";

/**
 * A one-shot signal for "the splash is out of the way".
 *
 * The first screen mounts underneath the splash, so its entrance animation was
 * running — and finishing — while the sheet still covered it. By the time the
 * slats lifted, the hero had already assembled and simply appeared, static.
 * That is not a timing tweak: a delay long enough to clear the splash would be
 * wrong the moment the splash is skipped, and the splash's own length depends
 * on real load timing.
 *
 * So the splash announces when it is done and the first screen waits for that.
 * Repeat visits and reduced-motion both finish it immediately, so the gate
 * opens on the same frame and nothing is ever left waiting.
 *
 * Module state rather than context: the two components are far apart in the
 * tree, this is genuinely global to the page, and a provider would re-render
 * the whole catalogue to flip one boolean.
 */

let opened = false;
const waiting = new Set<() => void>();

export function openIntroGate() {
  if (opened) return;
  opened = true;
  waiting.forEach((notify) => notify());
  waiting.clear();
}

export function isIntroGateOpen() {
  return opened;
}

function subscribe(notify: () => void) {
  waiting.add(notify);
  return () => {
    waiting.delete(notify);
  };
}

function getServerSnapshot() {
  return false;
}

/**
 * True once the splash has finished. Server-renders as false.
 *
 * `useSyncExternalStore` rather than an effect: the gate is module state that
 * can already be open before a subscriber mounts — a late-mounting component
 * reading it in an effect would render one frame stale and then re-render.
 */
export function useIntroGate() {
  return useSyncExternalStore(subscribe, isIntroGateOpen, getServerSnapshot);
}
