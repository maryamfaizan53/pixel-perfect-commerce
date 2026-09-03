/**
 * Shared Framer Motion language. One easing, one set of durations, so every
 * section on the site animates the same way. Everything here animates only
 * `transform` / `opacity`. Respects `prefers-reduced-motion`.
 */
import type { Variants, Transition } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1] as const;

export const reduceMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const base: Transition = { duration: 0.55, ease: EASE };

/** Section / block entrance — fade + rise. Pair with `whileInView`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: base },
};

/** Parent that staggers its children's `hidden` → `show`. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Small item inside a staggerContainer. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Standard viewport config for scroll reveals. */
export const inView = { once: true, margin: "-60px 0px" } as const;

/** Card hover — subtle lift. Use as `whileHover`. */
export const hoverLift = { y: -4, transition: { duration: 0.2, ease: EASE } } as const;

/** Button / interactive press. Use as `whileTap`. */
export const pressable = { scale: 0.98 } as const;
