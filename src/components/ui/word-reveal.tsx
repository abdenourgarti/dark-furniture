"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * A statement that arrives word by word instead of all at once.
 *
 * Reserved for the one sentence on the page that is the argument rather than a
 * description of it. Staggering the words makes it read at speaking pace, which
 * is the point; used on a paragraph it would just be slow.
 *
 * No overflow mask. The usual trick — clip each word and slide it up from
 * below — cuts the descenders of g, j and p, and does far worse to Arabic,
 * where the tail of a ﺞ or a ﺱ drops well past the baseline. A rise and a fade
 * cost one property each and clip nothing.
 */
export function WordReveal({
  text,
  className = "",
  /** Seconds between two words. Longer reads as hesitation, shorter as noise. */
  step = 0.045,
}: {
  text: string;
  className?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <p className={className}>{text}</p>;

  // Splitting on spaces is safe in both scripts: Arabic shapes its letters
  // within a word, never across the space that separates two.
  const words = text.split(" ");

  return (
    <p className={className}>
      {words.map((word, i) => (
        // The separating space is a text node between the spans, never inside
        // one: trailing whitespace at the end of an inline-block collapses to
        // nothing, and the sentence would come out as onelongword.
        <Fragment key={`${word}-${i}`}>
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * step, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
