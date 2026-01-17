/**
 * Milk Count - History Page
 *
 * Shows past milk count sessions with status and links to summaries.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Moon,
  Sun,
  ClipboardList,
  XCircle,
} from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, parseLocalDate } from "@/lib/utils";
import type { MilkCountSession, MilkCountSessionStatus } from "@/types";

// Status display configuration
const STATUS_DISPLAY: Record<MilkCountSessionStatus, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  night_foh: {
    label: "FOH In Progress",
    color: "text-blue-600 bg-blue-50",
    icon: <Moon className="h-4 w-4" />,
  },
  night_boh: {
    label: "BOH In Progress",
    color: "text-indigo-600 bg-indigo-50",
    icon: <Moon className="h-4 w-4" />,
  },
  morning: {
    label: "Morning Pending",
    color: "text-amber-600 bg-amber-50",
    icon: <Sun className="h-4 w-4" />,
  },
  on_order: {
    label: "On Order Pending",
    color: "text-purple-600 bg-purple-50",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  completed: {
    label: "Completed",
    color: "text-green-600 bg-green-50",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<MilkCountSession[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

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
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="border-b bg-background">
            <div className="container max-w-2xl mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/tools/milk-count")}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-foreground">
                    Milk Count History
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Past sessions and summaries
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-2xl mx-auto px-4 py-4 pb-8">
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
                          "transition-all",
                          isClickable && "cursor-pointer hover:shadow-md",
                          session.status === "completed" && "hover:border-primary/50",
                          sessionIsMissed && "opacity-60"
                        )}
                        onClick={() => handleSessionClick(session)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Date Icon */}
                            <div className="shrink-0 w-12 h-12 rounded-lg bg-muted flex flex-col items-center justify-center">
                              <span className="text-xs text-muted-foreground uppercase">
                                {parseLocalDate(session.date).toLocaleDateString("en-US", { month: "short" })}
                              </span>
                              <span className="text-lg font-bold">
                                {parseLocalDate(session.date).getDate()}
                              </span>
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">
                                {formatDate(session.date)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFullDate(session.date)}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              displayConfig.color
                            )}>
                              {displayConfig.icon}
                              <span className="hidden sm:inline">{displayConfig.label}</span>
                            </div>

                            {/* Chevron - only for completed sessions */}
                            {session.status === "completed" && (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          {/* Additional Info for Completed Sessions */}
                          {session.status === "completed" && session.completed_at && (
                            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Completed at {new Date(session.completed_at).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              {session.night_count_user_name && (
                                <span>Night: {session.night_count_user_name}</span>
                              )}
                              {session.morning_count_user_name && (
                                <span>Morning: {session.morning_count_user_name}</span>
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
        </main>
      </div>
    </ProtectedRoute>
  );
}
