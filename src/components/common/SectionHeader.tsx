import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, inView, reduceMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
  className?: string;
}

/** Eyebrow + title with an animated underline, and an optional "View all" link. */
export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  align = "left",
  className,
}: SectionHeaderProps) => {
  const centered = align === "center";
  const reduce = reduceMotion();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 mb-8 sm:mb-10",
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-1.5", centered && "max-w-2xl")}>
        {eyebrow && (
          <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight relative inline-block">
          {title}
          <motion.span
            aria-hidden
            className="absolute -bottom-1.5 left-0 h-[3px] rounded-full bg-primary"
            initial={reduce ? { width: "40%" } : { width: 0 }}
            whileInView={{ width: "40%" }}
            viewport={inView}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          />
        </h2>
        {subtitle && <p className="text-sm text-muted-foreground pt-2">{subtitle}</p>}
      </div>

      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary hover:text-primary-hover transition-colors self-start sm:self-auto"
        >
          {viewAllLabel}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};
