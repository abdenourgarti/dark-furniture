"use client";

import type { PointerEvent, ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/**
 * A card that leans towards the pointer, with a gold sheen following it.
 *
 * This is the site's only "3D": real CSS perspective, no WebGL. A furniture
 * workshop sells objects you want to turn over in your hands, and a card that
 * answers the pointer says that far better than a canvas would — at a few
 * hundred bytes instead of half a megabyte of renderer.
 *
 * The pointer is written into motion values rather than React state. State
 * would re-render the whole card on every mouse move; motion values are read
 * straight off the DOM node by the animation frame, so a grid of these costs
 * nothing to move across.
 */

const SPRING = { stiffness: 210, damping: 22, mass: 0.6 } as const;

export function TiltCard({
  children,
  className = "",
  /** Degrees of lean at the corners. Keep it small: past ~10 it reads as a gimmick. */
  intensity = 6,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const reduce = useReducedMotion();

  // Pointer position inside the card, 0 to 1 on each axis. Centre until touched.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const lit = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), SPRING);

  const sheenX = useTransform(px, (v) => `${v * 100}%`);
  const sheenY = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(40% 45% at ${sheenX} ${sheenY}, color-mix(in oklab, var(--gold) 22%, transparent), transparent 70%)`;
  const glow = useSpring(lit, SPRING);

  // A finger cannot hover, and tilting a card the moment it is tapped only
  // makes it harder to read. Touch gets the layout, not the trick.
  const track = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - box.left) / box.width);
    py.set((e.clientY - box.top) / box.height);
    lit.set(1);
  };

  const release = () => {
    px.set(0.5);
    py.set(0.5);
    lit.set(0);
  };

  return (
    <div className={`[perspective:1200px] ${className}`}>
      <motion.div
        onPointerMove={track}
        onPointerLeave={release}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full"
      >
        {children}
        <motion.span
          aria-hidden="true"
          style={{ backgroundImage: sheen, opacity: glow }}
          className="pointer-events-none absolute inset-0 rounded-brand"
        />
      </motion.div>
    </div>
  );
}
