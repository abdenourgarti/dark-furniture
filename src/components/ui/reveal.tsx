"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll reveal. Motivation: it establishes reading order, letting a long
 * page arrive one idea at a time instead of all at once.
 */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "header";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      // The `reveal` hook lets the <noscript> rule force these visible.
      className={className ? `reveal ${className}` : "reveal"}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
