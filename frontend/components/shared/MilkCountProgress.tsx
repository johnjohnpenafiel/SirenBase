/**
 * Milk Count Progress Circle
 *
 * 4-segment donut chart showing today's milk count phase progress.
 * Each segment represents a phase: FOH, BOH, Morning, On Order.
 * Completed phases fill with sky color; pending phases stay muted.
 *
 * Follows "Earned Space" design: compact card, dense info, pill badge.
 */
"use client";

import { useState, useEffect } from "react";
import { Milk } from "lucide-react";
import apiClient from "@/lib/api";
import type { MilkCountSession } from "@/types";

/** Phase definitions in order */
const PHASES = [
  { key: "night_foh_saved_at" as const, label: "FOH" },
  { key: "night_boh_saved_at" as const, label: "BOH" },
  { key: "morning_saved_at" as const, label: "AM" },
  { key: "on_order_saved_at" as const, label: "Order" },
];

/** SVG circle math */
const SIZE = 88;
const STROKE_WIDTH = 9;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_LENGTH = CIRCUMFERENCE / 4;
// Gap must exceed STROKE_WIDTH to remain visible with round linecaps
// (each round cap extends by STROKE_WIDTH/2, so two adjacent caps eat STROKE_WIDTH)
const GAP = 18;

/** Degrees consumed by one gap */
const GAP_DEGREES = (GAP / CIRCUMFERENCE) * 360;
/** Visible arc length per segment */
const DASH_LENGTH = SEGMENT_LENGTH - GAP;

interface SegmentProps {
  index: number;
  completed: boolean;
}

function Segment({ index, completed }: SegmentProps) {
  // Rotate each segment to its quadrant, offset by half-gap so gaps sit on the axes
  const rotation = -90 + index * 90 + GAP_DEGREES / 2;

  return (
    <circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={RADIUS}
      fill="none"
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      className={
        completed
          ? "stroke-sky-500 transition-colors duration-500"
          : "stroke-neutral-200 transition-colors duration-500"
      }
      strokeDasharray={`${DASH_LENGTH} ${CIRCUMFERENCE - DASH_LENGTH}`}
      strokeDashoffset={0}
      transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
    />
  );
}

export function MilkCountProgress() {
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await apiClient.getMilkCountTodaySession();
        setSession(response.session);
      } catch {
        // Silently fail — circle shows empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, []);

  const completedCount = session
    ? PHASES.filter((p) => session[p.key]).length
    : 0;

  return (
    <div className="p-3.5 border border-neutral-300/60 rounded-xl bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
          Milk Count
        </span>
        <Milk className="size-4 text-muted-foreground/50" aria-hidden="true" />
      </div>

      {/* Circle + count */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width={SIZE} height={SIZE}>
            {PHASES.map((phase, i) => (
              <Segment
                key={phase.key}
                index={i}
                completed={!isLoading && !!session?.[phase.key]}
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <span className="text-xs text-muted-foreground/50">...</span>
            ) : session ? (
              <span className="text-sm font-bold text-foreground">
                {completedCount}/4
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground/60">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Phase legend */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {PHASES.map((phase) => {
          const done = !isLoading && !!session?.[phase.key];
          return (
            <div key={phase.key} className="flex items-center gap-0.5">
              <div
                className={`size-1.5 rounded-full ${
                  done ? "bg-sky-500" : "bg-neutral-200"
                }`}
              />
              <span
                className={`text-[9px] font-mono uppercase ${
                  done
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
                }`}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
