/**
 * Milk Count Tool - Landing Page
 *
 * Entry point for the milk count workflow.
 * Shows session status and provides navigation to the appropriate step:
 * - No session: Start night count
 * - Night FOH in progress: Continue to FOH
 * - Night BOH in progress: Continue to BOH
 * - Morning needed: Start morning count
 * - Completed: View summary
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Moon, Sun, CheckCircle2, Clock, History, ClipboardList } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, parseLocalDate } from "@/lib/utils";
import type { MilkCountSession, MilkCountSessionStatus } from "@/types";

// Status configuration for display
const STATUS_CONFIG: Record<MilkCountSessionStatus | "none", {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  action: string;
  route: string;
}> = {
  none: {
    title: "No Session Today",
    description: "Start the night count to begin tracking milk inventory",
    icon: <Moon className="w-8 h-8" />,
    iconBg: "bg-slate-100 text-slate-600",
    action: "Start Night Count",
    route: "/tools/milk-count/night/foh",
  },
  night_foh: {
    title: "FOH Count In Progress",
    description: "Continue counting front of house milk inventory",
    icon: <Moon className="w-8 h-8" />,
    iconBg: "bg-blue-100 text-blue-600",
    action: "Continue FOH Count",
    route: "/tools/milk-count/night/foh",
  },
  night_boh: {
    title: "BOH Count In Progress",
    description: "Continue counting back of house milk inventory",
    icon: <Moon className="w-8 h-8" />,
    iconBg: "bg-indigo-100 text-indigo-600",
    action: "Continue BOH Count",
    route: "/tools/milk-count/night/boh",
  },
  morning: {
    title: "Morning Count Needed",
    description: "Complete the morning count to continue",
    icon: <Sun className="w-8 h-8" />,
    iconBg: "bg-amber-100 text-amber-600",
    action: "Start Morning Count",
    route: "/tools/milk-count/morning",
  },
  on_order: {
    title: "On Order Entry Needed",
    description: "Enter quantities already on order from IMS",
    icon: <ClipboardList className="w-8 h-8" />,
    iconBg: "bg-purple-100 text-purple-600",
    action: "Enter On Order",
    route: "/tools/milk-count/on-order",
  },
  completed: {
    title: "Count Completed",
    description: "Today's milk count is complete. View the summary below.",
    icon: <CheckCircle2 className="w-8 h-8" />,
    iconBg: "bg-green-100 text-green-600",
    action: "View Summary",
    route: "", // Will be set dynamically with session ID
  },
};

export default function MilkCountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const response = await apiClient.getMilkCountTodaySession();
      setSession(response.session);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    const status = session?.status || "none";
    const config = STATUS_CONFIG[status];

    // For completed sessions, navigate to summary with session ID
    if (status === "completed" && session) {
      router.push(`/tools/milk-count/summary/${session.id}`);
      return;
    }

    // For new sessions, start one first
    if (status === "none") {
      setStarting(true);
      try {
        const response = await apiClient.startMilkCountSession();
        router.push(config.route);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to start session");
        setStarting(false);
      }
      return;
    }

    // For in-progress sessions, navigate directly
    router.push(config.route);
  };

  const status = session?.status || "none";
  const config = STATUS_CONFIG[status];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="container max-w-2xl mx-auto px-4 py-4 md:py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Milk Count
            </h1>
            <p className="text-muted-foreground text-sm">
              {session ? formatDate(session.date) : "Today"}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-2xl mx-auto px-4 pb-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Card */}
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl", config.iconBg)}>
                          {config.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{config.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {config.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Button
                        onClick={handleAction}
                        disabled={starting}
                        className="w-full h-12 text-lg font-semibold"
                        size="lg"
                      >
                        {starting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          config.action
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Session Details - Show if in progress or completed */}
                  {session && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          Session Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Progress Steps */}
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              session.status !== "night_foh"
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600 animate-pulse"
                            )}>
                              1
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">FOH Count</p>
                              <p className="text-sm text-muted-foreground">
                                {session.night_foh_saved_at
                                  ? `Saved at ${new Date(session.night_foh_saved_at).toLocaleTimeString()}`
                                  : session.status === "night_foh" ? "In progress..." : "Pending"
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              session.night_boh_saved_at
                                ? "bg-green-100 text-green-600"
                                : session.status === "night_boh"
                                  ? "bg-blue-100 text-blue-600 animate-pulse"
                                  : "bg-gray-100 text-gray-400"
                            )}>
                              2
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">BOH Count</p>
                              <p className="text-sm text-muted-foreground">
                                {session.night_boh_saved_at
                                  ? `Saved at ${new Date(session.night_boh_saved_at).toLocaleTimeString()}`
                                  : session.status === "night_boh" ? "In progress..." : "Pending"
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              session.morning_saved_at
                                ? "bg-green-100 text-green-600"
                                : session.status === "morning"
                                  ? "bg-amber-100 text-amber-600 animate-pulse"
                                  : "bg-gray-100 text-gray-400"
                            )}>
                              3
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Morning Count</p>
                              <p className="text-sm text-muted-foreground">
                                {session.morning_saved_at
                                  ? `Saved at ${new Date(session.morning_saved_at).toLocaleTimeString()}`
                                  : session.status === "morning" ? "In progress..." : "Pending"
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              session.on_order_saved_at
                                ? "bg-green-100 text-green-600"
                                : session.status === "on_order"
                                  ? "bg-purple-100 text-purple-600 animate-pulse"
                                  : "bg-gray-100 text-gray-400"
                            )}>
                              4
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">On Order</p>
                              <p className="text-sm text-muted-foreground">
                                {session.on_order_saved_at
                                  ? `Saved at ${new Date(session.on_order_saved_at).toLocaleTimeString()}`
                                  : session.status === "on_order" ? "In progress..." : "Pending"
                                }
                              </p>
                            </div>
                          </div>

                          {session.status === "completed" && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-green-600">Complete!</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.completed_at
                                    ? `Completed at ${new Date(session.completed_at).toLocaleTimeString()}`
                                    : "Session complete"
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* View History Link */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/tools/milk-count/history")}
                  >
                    <History className="mr-2 h-5 w-5" />
                    View Past Sessions
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
