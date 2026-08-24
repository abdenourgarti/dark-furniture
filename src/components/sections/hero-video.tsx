"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Pause, Play } from "@phosphor-icons/react/dist/ssr";

/**
 * The workshop reel: six clips played back to back, for ever.
 *
 * Two <video> elements rather than one. A single element would have to swap its
 * `src` when a clip ends, and the browser tears the old frame down before the
 * next one has decoded, so every hand-off flashes black. Here one element plays
 * while the other quietly buffers the clip after it; when the first ends, the
 * second is already decoded and takes over on the spot.
 *
 * The hand-over is a cross fade, which imposes an order of operations: the
 * outgoing element must hold its last frame *underneath* the incoming one until
 * the fade is finished, and only then may it be hidden and pointed at the next
 * clip. Loading it any earlier would blank the very frame the fade is running
 * over. That is what `stale` is for.
 *
 * Sound is off by design and there is no way to switch it on: the clips
 * illustrate the headline, and muted is also what lets a browser autoplay them
 * at all.
 */

const CLIPS = [1, 2, 3, 4, 5, 6].map((n) => `/videos/video%20${n}.mp4`);

/** Must match the `duration-700` on the elements below. */
const FADE = 700;

export function HeroVideo({ pauseLabel, playLabel }: { pauseLabel: string; playLabel: string }) {
  // Someone who asked their system for less motion should not be handed six
  // autoplaying films; the reel waits on its first frame with a play button.
  // Once they touch the control, their choice outranks the system preference.
  const reduce = useReducedMotion();
  const [override, setOverride] = useState<boolean | null>(null);
  const paused = override ?? Boolean(reduce);

  /** Which of the two elements is on screen. The other one is buffering. */
  const [slot, setSlot] = useState(0);
  /** The clip index loaded in each element. */
  const [held, setHeld] = useState<[number, number]>([0, 1]);
  /** The element still showing the clip that just ended, mid-fade. */
  const [stale, setStale] = useState<number | null>(null);
  // Flipped once the first clip is actually rolling. Until then the second
  // element downloads nothing: nobody should pay for two films to read a
  // headline, and the buffer only ever has to be one clip ahead.
  const [armed, setArmed] = useState(false);

  const els = useRef<(HTMLVideoElement | null)[]>([null, null]);

  const advance = useCallback(() => {
    setStale(slot);
    setSlot(1 - slot);
  }, [slot]);

  // One effect owns playback, so the two elements can never both be running.
  // It deliberately does not rewind: on resume the clip picks up where the
  // visitor left it, and an element only ever becomes active carrying a source
  // it has not played yet.
  useEffect(() => {
    els.current[1 - slot]?.pause();

    const active = els.current[slot];
    if (!active) return;

    if (paused) {
      active.pause();
      return;
    }
    // Autoplay can still be refused (low power mode, for one). Nothing to do
    // about that, and a rejected promise must not reach the console as an error.
    active.play().catch(() => {});
  }, [slot, paused]);

  // The fade is over: hide the element that left the screen and point it at the
  // clip after the one now playing.
  useEffect(() => {
    if (stale === null) return;
    const timer = setTimeout(() => {
      setStale(null);
      setHeld((prev) => {
        const next: [number, number] = [prev[0], prev[1]];
        next[1 - slot] = (prev[slot] + 1) % CLIPS.length;
        return next;
      });
    }, FADE);
    return () => clearTimeout(timer);
  }, [stale, slot]);

  return (
    <div className="absolute inset-0">
      {[0, 1].map((i) => {
        const active = i === slot;
        return (
          <video
            key={i}
            ref={(el) => {
              els.current[i] = el;
            }}
            src={active || armed ? CLIPS[held[i]] : undefined}
            muted
            playsInline
            // No `loop`: the whole point is to hand over to the next clip.
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onEnded={active ? advance : undefined}
            onPlaying={active ? () => setArmed(true) : undefined}
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition-opacity duration-700 ease-brand",
              active || i === stale ? "opacity-100" : "opacity-0",
              active ? "z-10" : "z-0",
            ].join(" ")}
          />
        );
      })}


      <button
        type="button"
        onClick={() => setOverride(!paused)}
        aria-label={paused ? playLabel : pauseLabel}
        className="absolute bottom-4 inset-e-4 z-40 grid h-9 w-9 place-items-center rounded-brand border border-white/25 bg-black/35 text-white/85 backdrop-blur-sm transition-colors duration-300 ease-brand hover:border-[#e7ce86] hover:text-[#e7ce86]"
      >
        {paused ? <Play size={15} weight="fill" /> : <Pause size={15} weight="fill" />}
      </button>
    </div>
  );
}
