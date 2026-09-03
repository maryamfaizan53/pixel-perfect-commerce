import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, inView, reduceMotion } from "@/lib/motion";

interface RevealProps extends HTMLMotionProps<"div"> {
  /** Extra delay before the reveal (seconds). */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Scroll-reveal wrapper: fade + rise once when it enters the viewport.
 * No-ops when the user prefers reduced motion.
 */
export const Reveal = ({ children, delay = 0, as = "div", ...props }: RevealProps) => {
  const MotionTag = motion[as] as typeof motion.div;

  if (reduceMotion()) {
    return <MotionTag {...props}>{children}</MotionTag>;
  }

  return (
    <MotionTag
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={{ delay }}
      {...props}
    >
      {children}
    </MotionTag>
  );
};
