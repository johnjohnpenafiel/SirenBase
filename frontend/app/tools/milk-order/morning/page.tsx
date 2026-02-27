/**
 * Milk Order - Morning Count Page
 *
 * Final counting step after overnight delivery.
 * Partners can either:
 * - Count current BOH (app calculates delivered from night BOH)
 * - Enter delivered directly (for visible delivery boxes)
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern
 * - Sky-500 brand color for progress bar
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { MorningCountRow } from "@/components/tools/milk-order/MorningCountRow";
import { ArrowRight } from "lucide-react";
import { MilkOrderStepSkeleton } from "@/components/tools/milk-order/MilkOrderStepSkeleton";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import type { MilkType, MilkOrderSession, MilkOrderMorningMethod } from "@/types";

interface CountState {
  [milkTypeId: string]: {
    method: MilkOrderMorningMethod;
    value: number;
    nightBoh: number;
  };
}

export default function MorningCountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
  const [session, setSession] = useState<MilkOrderSession | null>(null);
  const [counts, setCounts] = useState<CountState>({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Prefetch next step in workflow
  useEffect(() => {
    router.prefetch("/tools/milk-order/on-order");
  }, [router]);

  const loadData = async () => {
    try {
      const [typesResponse, sessionResponse] = await Promise.all([
        apiClient.getMilkTypesForCounting(),
        apiClient.getMilkOrderTodaySession(),
      ]);

      const activeMilkTypes = typesResponse.milk_types
        .filter(mt => mt.active)
        .sort((a, b) => a.display_order - b.display_order);
      setMilkTypes(activeMilkTypes);

      let currentSession = sessionResponse.session;
      if (!currentSession) {
        router.replace("/tools/milk-order");
        return;
      }

      // If night count not complete, redirect
      if (currentSession.status === "night_foh") {
        router.replace("/tools/milk-order/night/foh");
        return;
      }
      if (currentSession.status === "night_boh") {
        router.replace("/tools/milk-order/night/boh");
        return;
      }

      if (currentSession.status === "on_order") {
        router.replace("/tools/milk-order/on-order");
        return;
      }

      if (currentSession.status === "completed") {
        router.replace(`/tools/milk-order/summary/${currentSession.id}`);
        return;
      }

      setSession(currentSession);

      // Load session entries to get night BOH counts
      if (currentSession.id) {
        const sessionData = await apiClient.getMilkOrderSession(currentSession.id);
        const initialCounts: CountState = {};

        sessionData.entries.forEach((entry) => {
          // Default method is boh_count, value starts at night BOH
          initialCounts[entry.milk_type_id] = {
            method: entry.morning_method || "boh_count",
            value: entry.morning_method === "direct_delivered"
              ? (entry.delivered ?? 0)
              : (entry.current_boh ?? entry.boh_count ?? 0),
            nightBoh: entry.boh_count ?? 0,
          };
        });
        setCounts(initialCounts);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load data"));
      router.push("/tools/milk-order");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  const handleMethodChange = useCallback((milkTypeId: string, method: MilkOrderMorningMethod) => {
    setCounts(prev => {
      const current = prev[milkTypeId];
      if (!current) return prev;

      // When switching methods, reset value to something sensible
      const newValue = method === "boh_count" ? current.nightBoh : 0;

      return {
        ...prev,
        [milkTypeId]: {
          ...current,
          method,
          value: newValue,
        },
      };
    });
  }, []);

  const handleValueChange = useCallback((milkTypeId: string, value: number) => {
    setCounts(prev => ({
      ...prev,
      [milkTypeId]: {
        ...prev[milkTypeId],
        value,
      },
    }));
  }, []);

  const handleSaveMorningCount = async () => {
    if (!session) return;

    setSaving(true);
    try {
      // Build morning counts array
      const morningCounts = milkTypes.map(mt => {
        const entry = counts[mt.id];
        if (!entry) {
          return {
            milk_type_id: mt.id,
            method: "boh_count" as MilkOrderMorningMethod,
            current_boh: 0,
          };
        }

        if (entry.method === "boh_count") {
          return {
            milk_type_id: mt.id,
            method: "boh_count" as MilkOrderMorningMethod,
            current_boh: entry.value,
          };
        } else {
          return {
            milk_type_id: mt.id,
            method: "direct_delivered" as MilkOrderMorningMethod,
            delivered: entry.value,
          };
        }
      });

      await apiClient.saveMilkOrderMorning(session.id, { counts: morningCounts });
      router.push("/tools/milk-order/on-order");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save morning count"));
    } finally {
      setSaving(false);
    }
  };

  // Separate dairy and non-dairy
  const dairyMilks = milkTypes.filter(mt => mt.category === "dairy");
  const nonDairyMilks = milkTypes.filter(mt => mt.category === "non_dairy");

  // Calculate progress (items with non-zero values)
  const countedItems = Object.values(counts).filter(c => c.value > 0).length;
  const totalItems = milkTypes.length;
  const progressPercent = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;

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
                  href="/tools/milk-order"
                  label="Back to Milk Order"
                />
              </div>

              {/* Title */}
              <div className="mb-4">
                <h1 className="text-xl md:text-3xl font-medium tracking-tight text-black">
                  Morning Count
                </h1>
                <span className="inline-block text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full mt-1">
                  BOH
                </span>
              </div>

              {/* Progress Section */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{countedItems}</span>/{totalItems} updated
                </p>
              </div>
              <div className="h-2.5 bg-gray-200/60 rounded-full overflow-hidden border border-neutral-300/80">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-2xl mx-auto px-4 pb-32">
            {loading ? (
              <MilkOrderStepSkeleton showInstructions />
            ) : (
              <div className="flex flex-col gap-2 animate-fade-in">
                {/* Instructions */}
                <div className="bg-card border border-neutral-300/80 rounded-2xl p-3 pl-4 text-sm text-foreground">
                  <p className="font-medium mb-1">How to count:</p>
                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-muted-foreground">
                    <li>By default, enter the current BOH count (what you see now)</li>
                    <li>Tap a row to expand and change method or see calculations</li>
                    <li>Use "Enter Delivered" if you can see delivery boxes</li>
                  </ul>
                </div>

                {/* Dairy Section */}
                {dairyMilks.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-2">
                      Dairy ({dairyMilks.length})
                    </h2>
                    <div className="flex flex-col gap-2">
                      {dairyMilks.map(milk => (
                        <MorningCountRow
                          key={milk.id}
                          milkName={milk.name}
                          category={milk.category}
                          nightBohCount={counts[milk.id]?.nightBoh ?? 0}
                          method={counts[milk.id]?.method ?? "boh_count"}
                          value={counts[milk.id]?.value ?? 0}
                          onMethodChange={(method) => handleMethodChange(milk.id, method)}
                          onValueChange={(value) => handleValueChange(milk.id, value)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Non-Dairy Section */}
                {nonDairyMilks.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 mt-2">
                      Non-Dairy ({nonDairyMilks.length})
                    </h2>
                    <div className="flex flex-col gap-2">
                      {nonDairyMilks.map(milk => (
                        <MorningCountRow
                          key={milk.id}
                          milkName={milk.name}
                          category={milk.category}
                          nightBohCount={counts[milk.id]?.nightBoh ?? 0}
                          method={counts[milk.id]?.method ?? "boh_count"}
                          value={counts[milk.id]?.value ?? 0}
                          onMethodChange={(method) => handleMethodChange(milk.id, method)}
                          onValueChange={(value) => handleValueChange(milk.id, value)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

        {/* Fixed Bottom Action */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-300/80 bg-card pb-safe">
          <div className="container max-w-2xl mx-auto px-4 pt-3 pb-6">
            <Button
              onClick={handleSaveMorningCount}
              disabled={saving || loading}
              className="w-full h-11 font-semibold active:scale-[0.98]"
              size="lg"
            >
              Save & Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
