/* ─── useAnimate ─── Lightweight CSS-based stagger animation hook (GSAP replacement) ─── */
import { useEffect, useRef } from 'react';

/**
 * Applies staggered CSS `animate-fade-up` class to children with `[data-animate]`.
 * Re-triggers on any dependency change (e.g. active section/header).
 *
 * Usage:
 *   const containerRef = useStaggerAnimate([dep1, dep2]);
 *   <div ref={containerRef}> <Card data-animate /> </div>
 */
export function useStaggerAnimate<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = [],
  animationClass = 'animate-fade-up',
  staggerMs = 60,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const els = container.querySelectorAll<HTMLElement>('[data-animate]');
    els.forEach((el, i) => {
      // Reset animation to allow re-triggering
      el.classList.remove(animationClass);
      el.style.removeProperty('--delay');
      // Force a reflow so the browser sees the removal before re-adding
      void el.offsetWidth;
      el.style.setProperty('--delay', `${i * staggerMs}ms`);
      el.classList.add(animationClass);
    });
    
  }, deps);

  return ref;
}

/**
 * Applies staggered CSS animation to direct children of a ref element.
 * Used for nav buttons, sidebar items etc.
 */
export function useChildStagger<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = [],
  animationClass = 'animate-fade-up',
  staggerMs = 30,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      el.classList.remove(animationClass);
      el.style.removeProperty('--delay');
      void el.offsetWidth;
      el.style.setProperty('--delay', `${i * staggerMs}ms`);
      el.classList.add(animationClass);
    });
    
  }, deps);

  return ref;
}

/**
 * Returns a key that forces React to remount a subtree, triggering CSS animations.
 * Useful for content area swaps.
 */
export function useAnimationKey(...deps: unknown[]): string {
  return deps.map(String).join('-');
}
