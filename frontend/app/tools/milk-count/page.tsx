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
import { Loader2, Moon, Sun, CheckCircle2, Clock, History, ClipboardList } from "lucide-react";
import { MilkCountLandingSkeleton } from "@/components/tools/milk-count/MilkCountLandingSkeleton";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, parseLocalDate, getErrorMessage } from "@/lib/utils";
import type { MilkCountSession, MilkCountSessionStatus } from "@/types";

// Status configuration for display
const STATUS_CONFIG: Record<MilkCountSessionStatus | "none", {
  title: string;
  stepNumber: string;
  status: string;
  statusColor: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  action: string;
  route: string;
}> = {
  none: {
    title: "Night FOH",
    stepNumber: "01",
    status: "Not Started",
    statusColor: "text-muted-foreground",
    description: "Start the night count to begin tracking milk inventory",
    icon: <Moon className="size-5" />,
    iconColor: "text-sky-400",
    action: "Start Night Count",
    route: "/tools/milk-count/night/foh",
  },
  night_foh: {
    title: "Night FOH",
    stepNumber: "01",
    status: "In Progress",
    statusColor: "text-sky-500",
    description: "Continue counting front of house milk inventory",
    icon: <Moon className="size-5" />,
    iconColor: "text-sky-400",
    action: "Continue Night FOH",
    route: "/tools/milk-count/night/foh",
  },
  night_boh: {
    title: "Night BOH",
    stepNumber: "02",
    status: "In Progress",
    statusColor: "text-sky-500",
    description: "Continue counting back of house milk inventory",
    icon: <Moon className="size-5" />,
    iconColor: "text-sky-400",
    action: "Continue Night BOH",
    route: "/tools/milk-count/night/boh",
  },
  morning: {
    title: "Morning BOH",
    stepNumber: "03",
    status: "Ready",
    statusColor: "text-sky-500",
    description: "Complete the morning count to continue",
    icon: <Sun className="size-5" />,
    iconColor: "text-amber-400",
    action: "Start Morning BOH",
    route: "/tools/milk-count/morning",
  },
  on_order: {
    title: "On Order",
    stepNumber: "04",
    status: "Ready",
    statusColor: "text-sky-500",
    description: "Enter quantities already on order from IMS",
    icon: <ClipboardList className="size-5" />,
    iconColor: "text-sky-400",
    action: "Enter On Order",
    route: "/tools/milk-count/on-order",
  },
  completed: {
    title: "Milk Count",
    stepNumber: "OK",
    status: "Completed",
    statusColor: "text-sky-600",
    description: "Today's milk count is complete. View the summary below.",
    icon: <CheckCircle2 className="size-5" />,
    iconColor: "text-sky-500",
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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load session"));
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
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to start session"));
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
      <div className="h-dvh overflow-y-auto flex flex-col gap-2" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island */}
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
              {/* Top row: Title + History button */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-3xl font-medium tracking-tight text-black">
                    Milk Count
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {session ? formatDate(session.date) : "Today"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:w-auto md:px-4 active:scale-[0.98]"
                  onClick={() => router.push("/tools/milk-count/history")}
                >
                  <History className="size-4 md:mr-2" />
                  <span className="hidden md:inline">History</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-2xl mx-auto px-4 pb-8">
            {loading ? (
              <MilkCountLandingSkeleton />
            ) : (
              <div className="flex flex-col gap-2 animate-fade-in">
                {/* Status Card */}
                <div className="p-4 border border-neutral-300/80 rounded-2xl bg-card">
                  {/* Top row: Step badge + Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
                      {config.stepNumber}
                    </span>
                    <div className={cn("size-8 rounded-lg bg-muted flex items-center justify-center", config.iconColor)}>
                      {config.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {config.title}
                  </h2>

                  {/* Status + Description */}
                  <div className="flex items-end justify-between mt-1 mb-4">
                    <div className="flex-1">
                      <span className={cn("text-xs font-medium", config.statusColor)}>
                        {config.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed pr-4">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleAction}
                    disabled={starting}
                    className="w-full h-11 font-semibold active:scale-[0.98]"
                    size="lg"
                  >
                    {starting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      config.action
                    )}
                  </Button>
                </div>

                {/* Session Details - Show if in progress or completed */}
                {session && (
                  <div className="p-4 border border-neutral-300/80 rounded-2xl bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="size-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">Session Progress</h3>
                    </div>
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
                          <div className="flex flex-col gap-1">
                            {steps.map((step, i) => {
                              const isCompleted = !!step.savedAt;
                              const isActive = session.status === step.activeStatus;
                              const isLast = !showComplete && i === steps.length - 1;

                              return (
                                <div key={step.label} className="flex gap-2">
                                  {/* Circle + Connector column */}
                                  <div className="flex flex-col items-center">
                                    <div className={cn(
                                      "size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                      isCompleted
                                        ? "bg-sky-500 text-white"
                                        : isActive
                                          ? "bg-black text-white"
                                          : "bg-neutral-200 text-muted-foreground"
                                    )}>
                                      {isCompleted ? <CheckCircle2 className="size-3.5" /> : i + 1}
                                    </div>
                                    {!isLast && (
                                      <div className={cn(
                                        "w-0.5 flex-1 min-h-3",
                                        isCompleted ? "bg-sky-300" : "bg-neutral-200"
                                      )} />
                                    )}
                                  </div>
                                  {/* Label + Status */}
                                  <div className="flex-1 pb-2">
                                    <p className={cn(
                                      "text-sm font-medium",
                                      isActive && "text-foreground",
                                      isCompleted && "text-sky-600",
                                      !isActive && !isCompleted && "text-muted-foreground"
                                    )}>{step.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {step.savedAt
                                        ? new Date(step.savedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                                        : isActive ? "In progress..." : "Pending"
                                      }
                                    </p>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Completed step */}
                            {showComplete && (
                              <div className="flex gap-2">
                                <div className="flex flex-col items-center">
                                  <div className="size-6 rounded-full flex items-center justify-center bg-sky-500 text-white shrink-0">
                                    <CheckCircle2 className="size-3.5" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-sky-600">Complete!</p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.completed_at
                                      ? new Date(session.completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
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
                  </div>
                )}

              </div>
            )}
          </div>
      </div>
    </ProtectedRoute>
  );
}
