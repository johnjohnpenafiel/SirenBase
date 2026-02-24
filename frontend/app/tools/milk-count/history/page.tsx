/**
 * Milk Count - History Page
 *
 * Shows past milk count sessions with status and links to summaries.
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Moon,
  Sun,
  ClipboardList,
  XCircle,
  History,
} from "lucide-react";
import { MilkCountHistorySkeleton } from "@/components/tools/milk-count/MilkCountHistorySkeleton";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, parseLocalDate, getErrorMessage } from "@/lib/utils";
import type { MilkCountSession, MilkCountSessionStatus } from "@/types";

// Status display configuration - Neutral for in-progress, sky for completed
const STATUS_DISPLAY: Record<MilkCountSessionStatus, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  night_foh: {
    label: "FOH In Progress",
    color: "text-foreground bg-muted",
    icon: <Moon className="size-4" />,
  },
  night_boh: {
    label: "BOH In Progress",
    color: "text-foreground bg-muted",
    icon: <Moon className="size-4" />,
  },
  morning: {
    label: "Morning Pending",
    color: "text-foreground bg-muted",
    icon: <Sun className="size-4" />,
  },
  on_order: {
    label: "On Order Pending",
    color: "text-foreground bg-muted",
    icon: <ClipboardList className="size-4" />,
  },
  completed: {
    label: "Completed",
    color: "text-sky-600 bg-sky-50",
    icon: <CheckCircle2 className="size-4" />,
  },
};

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<MilkCountSession[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const limit = 20;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const scrollTop = (e.target as HTMLElement).scrollTop;
    setIsScrolled(scrollTop > 16);
  }, []);

  // Determine if session is "missed" (incomplete and from a past day)
  const isMissed = (session: MilkCountSession) => {
    if (session.status === "completed") return false;
    const sessionDate = parseLocalDate(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessionDate < today;
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async (loadMore = false) => {
    try {
      const currentOffset = loadMore ? offset : 0;
      const response = await apiClient.getMilkCountHistory({
        limit,
        offset: currentOffset,
      });

      if (loadMore) {
        setSessions(prev => [...prev, ...response.sessions]);
      } else {
        setSessions(response.sessions);
      }

      setHasMore(currentOffset + response.sessions.length < response.total);
      setOffset(currentOffset + response.sessions.length);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load history"));
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadSessions(true);
  };

  const handleSessionClick = (session: MilkCountSession) => {
    if (session.status === "completed") {
      // Completed: Navigate to summary
      router.push(`/tools/milk-count/summary/${session.id}`);
    } else if (!isMissed(session)) {
      // Today's incomplete: Navigate to landing page to continue
      router.push("/tools/milk-count");
    }
    // Past incomplete (missed): Do nothing - not clickable
  };



  return (
    <ProtectedRoute>
      <div className="h-dvh overflow-y-auto flex flex-col gap-2" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island Header */}
          <div className="sticky top-[72px] z-10 px-4 md:px-8">
            <div
              className={cn(
                "max-w-2xl mx-auto rounded-2xl",
                "border border-neutral-300/80",
                isScrolled ? "bg-white/70 backdrop-blur-md" : "bg-white/95 backdrop-blur-md",
                "px-5 py-4 md:px-6 md:py-5",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Back Button */}
              <div className="mb-3">
                <BackButton
                  variant="icon-only"
                  href="/tools/milk-count"
                  label="Back to Milk Count"
                />
              </div>

              {/* Title */}
              <div className="flex items-center gap-2">
                <History className="size-5" />
                <h1 className="text-xl md:text-3xl font-medium tracking-tight text-black">
                  History
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Past sessions and summaries
              </p>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-2xl mx-auto px-4 pb-8">
              {loading ? (
                <MilkCountHistorySkeleton />
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                  <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Calendar className="size-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    No History Yet
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                    Complete your first milk count to see it here
                  </p>
                  <Button
                    onClick={() => router.push("/tools/milk-count")}
                    className="active:scale-[0.98]"
                  >
                    Start Counting
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  {sessions.map((session) => {
                    const sessionIsMissed = isMissed(session);
                    const statusConfig = STATUS_DISPLAY[session.status];

                    // Override status display for missed sessions
                    const displayConfig = sessionIsMissed
                      ? {
                          label: "Missed",
                          color: "text-red-600 bg-red-50",
                          icon: <XCircle className="size-4" />,
                        }
                      : statusConfig;

                    // Determine if session is clickable
                    const isClickable = session.status === "completed" || !sessionIsMissed;

                    return (
                      <div
                        key={session.id}
                        className={cn(
                          "p-4 border border-neutral-300/80 rounded-2xl bg-card transition-all",
                          isClickable && "cursor-pointer hover:shadow-md active:scale-[0.98]",
                          session.status === "completed" && "hover:border-sky-300",
                          sessionIsMissed && "opacity-60"
                        )}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Date Badge */}
                          <div className="shrink-0 size-12 rounded-xl bg-muted text-foreground border border-neutral-200 flex flex-col items-center justify-center">
                            <span className="text-[9px] leading-none uppercase font-medium text-muted-foreground">
                              {parseLocalDate(session.date).toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="text-lg leading-tight font-bold tabular-nums">
                              {parseLocalDate(session.date).getDate()}
                            </span>
                          </div>

                          {/* Session Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground">
                                {displayConfig.label}
                                {session.status === "completed" && session.completed_at && (
                                  <span className="tabular-nums text-muted-foreground">
                                    {" · "}{new Date(session.completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                  </span>
                                )}
                              </span>
                              <span className={cn("shrink-0", displayConfig.color.split(" ")[0])}>
                                {displayConfig.icon}
                              </span>
                            </div>
                          </div>

                          {/* Chevron - only for clickable sessions */}
                          {isClickable && (
                            <ChevronRight className="size-4 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Additional Info for Completed Sessions */}
                        {session.status === "completed" && (session.night_count_user_name || session.morning_count_user_name) && (
                          <div className="mt-3 pt-3 border-t border-neutral-200">
                            <div className="flex flex-wrap gap-2 text-sm">
                              {session.night_count_user_name && (
                                <div className="bg-muted/30 rounded-xl px-3 py-1.5 border border-neutral-200">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Night </span>
                                  <span className="font-medium">{session.night_count_user_name}</span>
                                </div>
                              )}
                              {session.morning_count_user_name && (
                                <div className="bg-muted/30 rounded-xl px-3 py-1.5 border border-neutral-200">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Morning </span>
                                  <span className="font-medium">{session.morning_count_user_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Load More */}
                  {hasMore && (
                    <Button
                      variant="outline"
                      className="w-full h-11 active:scale-[0.98]"
                      onClick={handleLoadMore}
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </div>
      </div>
    </ProtectedRoute>
  );
}
