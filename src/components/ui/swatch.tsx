"use client";

import { useEffect, useRef } from "react";

/**
 * Material samples painted on a canvas rather than photographed.
 *
 * A stock photo of a melamine board is a licensing problem and a download; the
 * point of the tile is to show what matt, gloss, raw fibre and brushed metal
 * look like next to each other, and that reads perfectly well from a few
 * hundred lines of 2D drawing.
 */
export type SwatchKind = "melamine" | "gloss" | "mdf" | "hardware";

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function paint(kind: SwatchKind, ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rand = rng(4242 + kind.length * 7919);
  ctx.clearRect(0, 0, w, h);

  if (kind === "melamine") {
    ctx.fillStyle = "#c39a68";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) {
      const y = rand() * h;
      const amp = 1 + rand() * 7;
      const freq = 0.006 + rand() * 0.02;
      const phase = rand() * 7;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 5) ctx.lineTo(x, y + Math.sin(x * freq + phase) * amp);
      ctx.strokeStyle =
        rand() > 0.5
          ? `rgba(84,54,26,${0.03 + rand() * 0.09})`
          : `rgba(255,236,205,${0.03 + rand() * 0.07})`;
      ctx.lineWidth = 0.5 + rand() * 2.4;
      ctx.stroke();
    }
    // Matt surfaces scatter light: a wide, very soft sheen and nothing sharp.
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "rgba(255,255,255,0.09)");
    g.addColorStop(0.55, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(0,0,0,0.07)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (kind === "gloss") {
    const base = ctx.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, "#232a33");
    base.addColorStop(1, "#0e1216");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // A lacquer front mirrors the room: hard-edged bands, not a soft wash.
    ctx.save();
    ctx.translate(w * 0.1, 0);
    ctx.rotate(-0.42);
    const bands: [number, number, number][] = [
      [w * 0.12, w * 0.2, 0.3],
      [w * 0.4, w * 0.07, 0.16],
      [w * 0.56, w * 0.03, 0.1],
    ];
    for (const [x, bw, alpha] of bands) {
      const bg = ctx.createLinearGradient(x, 0, x + bw, 0);
      bg.addColorStop(0, "rgba(255,255,255,0)");
      bg.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
      bg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(x, -h, bw, h * 3);
    }
    ctx.restore();

    const floor = ctx.createLinearGradient(0, h * 0.72, 0, h);
    floor.addColorStop(0, "rgba(255,255,255,0)");
    floor.addColorStop(1, "rgba(190,205,225,0.14)");
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    return;
  }

  if (kind === "mdf") {
    ctx.fillStyle = "#b8916a";
    ctx.fillRect(0, 0, w, h);
    // Compressed fibre: dense random speckle, no grain direction at all.
    for (let i = 0; i < 26000; i++) {
      const v = rand();
      ctx.fillStyle =
        v > 0.5 ? `rgba(146,110,74,${rand() * 0.5})` : `rgba(214,182,146,${rand() * 0.45})`;
      ctx.fillRect(rand() * w, rand() * h, 1.4, 1.4);
    }
    // Sawn edge along the bottom, slightly darker and denser.
    ctx.fillStyle = "rgba(120,88,56,0.3)";
    ctx.fillRect(0, h * 0.84, w, h * 0.16);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, h * 0.84, w, 1.5);
    return;
  }

  // hardware: brushed stainless
  const metal = ctx.createLinearGradient(0, 0, 0, h);
  metal.addColorStop(0, "#b9bcc2");
  metal.addColorStop(0.42, "#e7e9ec");
  metal.addColorStop(0.62, "#9ba0a7");
  metal.addColorStop(1, "#cfd2d7");
  ctx.fillStyle = metal;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) {
    const y = rand() * h;
    ctx.strokeStyle = rand() > 0.5 ? `rgba(255,255,255,${rand() * 0.3})` : `rgba(70,74,80,${rand() * 0.22})`;
    ctx.lineWidth = 0.6 + rand() * 0.9;
    ctx.beginPath();
    ctx.moveTo(rand() * w * 0.4, y);
    ctx.lineTo(w * (0.5 + rand() * 0.6), y + (rand() - 0.5) * 1.5);
    ctx.stroke();
  }
}

export function Swatch({ kind, className = "" }: { kind: SwatchKind; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 480;
    const h = 360;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    paint(kind, ctx, w, h);
  }, [kind]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`block h-full w-full object-cover ${className}`}
    />
  );
}
