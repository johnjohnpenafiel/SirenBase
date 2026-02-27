/**
 * RTD&E Timer Circle
 *
 * Circular timer showing elapsed time since last RTD&E completion.
 * Arc depletes as time passes; color transitions green → yellow → red
 * based on a fixed cadence interval.
 *
 * Follows "Earned Space" design: compact card, dense info, pill badge.
 */
"use client";

import { useState, useEffect } from "react";
import { ShoppingBasket } from "lucide-react";
import apiClient from "@/lib/api";

/** Target cadence in minutes (how often RTD&E should be restocked) */
const RTDE_CADENCE_MINUTES = 60;

/** SVG circle math */
const SIZE = 88;
const STROKE_WIDTH = 9;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Get arc color based on elapsed ratio.
 * 0–50%: green (fresh), 50–80%: yellow (getting stale), 80%+: red (overdue)
 */
function getTimerColor(ratio: number): string {
  if (ratio <= 0.5) return "stroke-[#8a7259]";
  if (ratio <= 0.8) return "stroke-[#a0845c]";
  return "stroke-[#6b4a3a]";
}

/**
 * Get dot color for the label area.
 */
function getDotColor(ratio: number): string {
  if (ratio <= 0.5) return "bg-[#8a7259]";
  if (ratio <= 0.8) return "bg-[#a0845c]";
  return "bg-[#6b4a3a]";
}

/**
 * Format remaining minutes as a countdown string.
 * "55m", "0m" (when overdue)
 */
function formatRemaining(elapsedMinutes: number): string {
  const remaining = Math.max(RTDE_CADENCE_MINUTES - elapsedMinutes, 0);
  if (remaining < 1) return "Restock";
  return `${Math.ceil(remaining)}m`;
}

export function RTDETimerCircle() {
  const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLastCompleted = async () => {
      try {
        const response = await apiClient.getRTDELastCompleted();
        setLastCompletedAt(response.last_completed_at);
        setUserName(response.user_name);
      } catch {
        // Silently fail — shows empty state
      } finally {
        setIsLoading(false);
      }
    };
    fetchLastCompleted();
  }, []);

  // Calculate elapsed time and ratio
  let elapsedMinutes = 0;
  let ratio = 1; // default to "overdue" if no data
  if (lastCompletedAt) {
    const elapsed = Date.now() - new Date(lastCompletedAt).getTime();
    elapsedMinutes = elapsed / (1000 * 60);
    ratio = Math.min(elapsedMinutes / RTDE_CADENCE_MINUTES, 1.2);
  }

  // Arc length: starts full and depletes as ratio increases
  const remaining = Math.max(1 - ratio / 1.2, 0);
  const arcLength = remaining * CIRCUMFERENCE;

  const hasData = !isLoading && lastCompletedAt;

  return (
    <div className="p-3.5 border border-[#b5a899] rounded-2xl bg-[#c4b8ab]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold uppercase text-neutral-600">
          RTD&E
        </span>
        <ShoppingBasket
          className="size-4 text-neutral-500"
          aria-hidden="true"
        />
      </div>

      {/* Circle + elapsed time */}
      <div className="flex justify-center">
        <div className="relative">
          <svg width={SIZE} height={SIZE}>
            {/* Background track */}
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE_WIDTH}
              className="stroke-neutral-400/40"
            />
            {/* Timer arc */}
            {hasData && (
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                className={`${getTimerColor(ratio)} transition-colors duration-500`}
                strokeDasharray={`${arcLength} ${CIRCUMFERENCE - arcLength}`}
                strokeDashoffset={0}
                transform={`translate(${SIZE}, 0) scale(-1, 1) rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            )}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isLoading ? (
              <span className="text-xs text-neutral-500">...</span>
            ) : hasData ? (
              <span className="text-sm font-bold text-neutral-900">
                {formatRemaining(elapsedMinutes)}
              </span>
            ) : (
              <span className="text-[10px] text-neutral-500">
                No data
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Last completed info */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {hasData ? (
          <>
            <div className={`size-1.5 rounded-full ${getDotColor(ratio)}`} />
            <span className="text-[9px] font-mono text-neutral-700 truncate">
              Last: {userName || "Unknown"}
            </span>
          </>
        ) : (
          <span className="text-[9px] font-mono text-neutral-500">
            No completions yet
          </span>
        )}
      </div>
    </div>
  );
}
