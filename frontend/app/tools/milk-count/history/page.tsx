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
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Moon,
  Sun,
  ClipboardList,
  XCircle,
  History,
} from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, parseLocalDate } from "@/lib/utils";
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
    icon: <Moon className="h-4 w-4" />,
  },
  night_boh: {
    label: "BOH In Progress",
    color: "text-foreground bg-muted",
    icon: <Moon className="h-4 w-4" />,
  },
  morning: {
    label: "Morning Pending",
    color: "text-foreground bg-muted",
    icon: <Sun className="h-4 w-4" />,
  },
  on_order: {
    label: "On Order Pending",
    color: "text-foreground bg-muted",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "text-sky-600 bg-sky-50",
    icon: <CheckCircle2 className="h-4 w-4" />,
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
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load history");
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

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatFullDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <div className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island Header */}
          <div className="sticky top-[68px] z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-2xl mx-auto rounded-2xl",
                "bg-white/70 backdrop-blur-md",
                
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
                <History className="h-5 w-5 text-sky-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
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
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Loading history...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    No History Yet
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                    Complete your first milk count to see it here
                  </p>
                  <Button onClick={() => router.push("/tools/milk-count")}>
                    Start Counting
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const sessionIsMissed = isMissed(session);
                    const statusConfig = STATUS_DISPLAY[session.status];

                    // Override status display for missed sessions
                    const displayConfig = sessionIsMissed
                      ? {
                          label: "Missed",
                          color: "text-red-600 bg-red-50",
                          icon: <XCircle className="h-4 w-4" />,
                        }
                      : statusConfig;

                    // Determine if session is clickable
                    const isClickable = session.status === "completed" || !sessionIsMissed;

                    return (
                      <Card
                        key={session.id}
                        className={cn(
                          "border border-neutral-300/80 rounded-2xl transition-all py-0",
                          isClickable && "cursor-pointer",
                          session.status === "completed" && "hover:border-primary/50",
                          sessionIsMissed && "opacity-60"
                        )}
                        onClick={() => handleSessionClick(session)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Date Icon */}
                            <div className="shrink-0 w-[52px] h-[52px] rounded-2xl bg-muted flex flex-col items-center justify-center gap-0.5">
                              <span className="text-[10px] leading-none text-muted-foreground uppercase font-medium">
                                {parseLocalDate(session.date).toLocaleDateString("en-US", { month: "short" })}
                              </span>
                              <span className="text-lg leading-none font-bold">
                                {parseLocalDate(session.date).getDate()}
                              </span>
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-foreground">
                                  {formatDate(session.date)}
                                </p>
                                <span className={cn("shrink-0", displayConfig.color.split(" ")[0])}>
                                  {displayConfig.icon}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatFullDate(session.date)}
                              </p>
                            </div>

                            {/* Chevron - only for clickable sessions */}
                            {isClickable && (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          {/* Additional Info for Completed Sessions */}
                          {session.status === "completed" && session.completed_at && (
                            <div className="mt-3 pt-3 border-t border-gray-300 space-y-2">
                              <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50 text-sm">
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p>
                                  {new Date(session.completed_at).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              {(session.night_count_user_name || session.morning_count_user_name) && (
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {session.night_count_user_name && (
                                    <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                      <p className="text-xs text-muted-foreground">Night</p>
                                      <p>{session.night_count_user_name}</p>
                                    </div>
                                  )}
                                  {session.morning_count_user_name && (
                                    <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                      <p className="text-xs text-muted-foreground">Morning</p>
                                      <p>{session.morning_count_user_name}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* Load More */}
                  {hasMore && (
                    <Button
                      variant="outline"
                      className="w-full"
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
