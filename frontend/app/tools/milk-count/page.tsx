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
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern
 * - Sky-500 brand color for progress/completed states
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
  status: string;
  statusColor: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  action: string;
  route: string;
}> = {
  none: {
    title: "Night FOH",
    status: "Not Started",
    statusColor: "text-muted-foreground",
    description: "Start the night count to begin tracking milk inventory",
    icon: <Moon className="w-8 h-8" />,
    iconBg: "bg-muted text-muted-foreground",
    action: "Start Night Count",
    route: "/tools/milk-count/night/foh",
  },
  night_foh: {
    title: "Night FOH",
    status: "In Progress",
    statusColor: "text-sky-500",
    description: "Continue counting front of house milk inventory",
    icon: <Moon className="w-8 h-8" />,
    iconBg: "bg-muted text-foreground",
    action: "Continue Night FOH",
    route: "/tools/milk-count/night/foh",
  },
  night_boh: {
    title: "Night BOH",
    status: "In Progress",
    statusColor: "text-sky-500",
    description: "Continue counting back of house milk inventory",
    icon: <Moon className="w-8 h-8" />,
    iconBg: "bg-muted text-foreground",
    action: "Continue Night BOH",
    route: "/tools/milk-count/night/boh",
  },
  morning: {
    title: "Morning BOH",
    status: "Ready",
    statusColor: "text-sky-500",
    description: "Complete the morning count to continue",
    icon: <Sun className="w-8 h-8" />,
    iconBg: "bg-muted text-foreground",
    action: "Start Morning BOH",
    route: "/tools/milk-count/morning",
  },
  on_order: {
    title: "On Order",
    status: "Ready",
    statusColor: "text-sky-500",
    description: "Enter quantities already on order from IMS",
    icon: <ClipboardList className="w-8 h-8" />,
    iconBg: "bg-muted text-foreground",
    action: "Enter On Order",
    route: "/tools/milk-count/on-order",
  },
  completed: {
    title: "Milk Count",
    status: "Completed",
    statusColor: "text-sky-600",
    description: "Today's milk count is complete. View the summary below.",
    icon: <CheckCircle2 className="w-8 h-8" />,
    iconBg: "bg-sky-100 text-sky-600",
    action: "View Summary",
    route: "", // Will be set dynamically with session ID
  },
};

export default function MilkCountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [starting, setStarting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
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
      <div className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island */}
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Milk Count
              </h1>
              <p className="text-muted-foreground text-sm">
                {session ? formatDate(session.date) : "Today"}
              </p>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-2xl mx-auto px-4 pb-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status Card */}
                <Card className="border border-neutral-300/80 rounded-2xl overflow-hidden py-0 gap-0">
                  <CardHeader className="py-5">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-2xl", config.iconBg)}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{config.title}</CardTitle>
                        <span className={cn("inline-block text-xs font-medium mt-1 px-2.5 py-0.5 rounded-full bg-muted", config.statusColor)}>
                          {config.status}
                        </span>
                        <CardDescription className="mt-2">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
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
                  <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        Session Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Wizard Stepper */}
                        {(() => {
                          const steps = [
                            { label: "Night FOH", savedAt: session.night_foh_saved_at, activeStatus: "night_foh" as const },
                            { label: "Night BOH", savedAt: session.night_boh_saved_at, activeStatus: "night_boh" as const },
                            { label: "Morning BOH", savedAt: session.morning_saved_at, activeStatus: "morning" as const },
                            { label: "On Order", savedAt: session.on_order_saved_at, activeStatus: "on_order" as const },
                          ];
                          const showComplete = session.status === "completed";

                          return (
                            <div className="flex flex-col">
                              {steps.map((step, i) => {
                                const isCompleted = !!step.savedAt;
                                const isActive = session.status === step.activeStatus;
                                const isLast = !showComplete && i === steps.length - 1;

                                return (
                                  <div key={step.label} className="flex gap-3">
                                    {/* Circle + Connector column */}
                                    <div className="flex flex-col items-center">
                                      <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                        isCompleted
                                          ? "bg-sky-100 text-sky-600"
                                          : isActive
                                            ? "bg-muted text-foreground animate-pulse"
                                            : "bg-muted/50 text-muted-foreground"
                                      )}>
                                        {i + 1}
                                      </div>
                                      {!isLast && (
                                        <div className={cn(
                                          "w-0.5 flex-1 my-1",
                                          isCompleted ? "bg-sky-300" : "bg-gray-300"
                                        )} />
                                      )}
                                    </div>
                                    {/* Label + Status */}
                                    <div className={cn(
                                      "flex-1 rounded-lg px-3 py-1.5",
                                      !isLast ? "mb-1" : "",
                                      i % 2 === 0 ? "bg-gray-200/50" : "bg-muted/60"
                                    )}>
                                      <p className="font-medium">{step.label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {step.savedAt
                                          ? `Saved at ${new Date(step.savedAt).toLocaleTimeString()}`
                                          : isActive ? "In progress..." : "Pending"
                                        }
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Completed step */}
                              {showComplete && (
                                <div className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-sky-100 shrink-0">
                                      <CheckCircle2 className="h-5 w-5 text-sky-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1 rounded-lg px-3 py-1.5 bg-gray-200/50">
                                    <p className="font-medium text-sky-600">Complete!</p>
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
                          );
                        })()}
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
    </ProtectedRoute>
  );
}
