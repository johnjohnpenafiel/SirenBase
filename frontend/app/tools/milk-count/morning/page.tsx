/**
 * Milk Count - Morning Count Page
 *
 * Final counting step after overnight delivery.
 * Partners can either:
 * - Count current BOH (app calculates delivered from night BOH)
 * - Enter delivered directly (for visible delivery boxes)
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { MorningCountRow } from "@/components/tools/milk-count/MorningCountRow";
import { Loader2, ArrowLeft, ArrowRight, Sun } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import type { MilkType, MilkCountSession, MilkCountEntry, MilkCountMorningMethod } from "@/types";

interface CountState {
  [milkTypeId: string]: {
    method: MilkCountMorningMethod;
    value: number;
    nightBoh: number;
  };
}

export default function MorningCountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [counts, setCounts] = useState<CountState>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [typesResponse, sessionResponse] = await Promise.all([
        apiClient.getMilkTypesForCounting(),
        apiClient.getMilkCountTodaySession(),
      ]);

      const activeMilkTypes = typesResponse.milk_types
        .filter(mt => mt.active)
        .sort((a, b) => a.display_order - b.display_order);
      setMilkTypes(activeMilkTypes);

      let currentSession = sessionResponse.session;
      if (!currentSession) {
        router.replace("/tools/milk-count");
        return;
      }

      // If night count not complete, redirect
      if (currentSession.status === "night_foh") {
        router.replace("/tools/milk-count/night/foh");
        return;
      }
      if (currentSession.status === "night_boh") {
        router.replace("/tools/milk-count/night/boh");
        return;
      }

      if (currentSession.status === "completed") {
        router.replace(`/tools/milk-count/summary/${currentSession.id}`);
        return;
      }

      setSession(currentSession);

      // Load session entries to get night BOH counts
      if (currentSession.id) {
        const sessionData = await apiClient.getMilkCountSession(currentSession.id);
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
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load data");
      router.push("/tools/milk-count");
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = useCallback((milkTypeId: string, method: MilkCountMorningMethod) => {
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
            method: "boh_count" as MilkCountMorningMethod,
            current_boh: 0,
          };
        }

        if (entry.method === "boh_count") {
          return {
            milk_type_id: mt.id,
            method: "boh_count" as MilkCountMorningMethod,
            current_boh: entry.value,
          };
        } else {
          return {
            milk_type_id: mt.id,
            method: "direct_delivered" as MilkCountMorningMethod,
            delivered: entry.value,
          };
        }
      });

      await apiClient.saveMilkCountMorning(session.id, { counts: morningCounts });
      toast.success("Morning count saved!");
      router.push(`/tools/milk-count/summary/${session.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save morning count");
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

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container max-w-2xl mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center justify-between gap-4">
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
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <h1 className="text-lg md:text-xl font-bold text-foreground">
                        Morning Count
                      </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Count BOH after delivery or enter delivered
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {countedItems}/{totalItems}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (countedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-2xl mx-auto px-4 py-4 pb-32">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <p className="font-medium mb-1">How to count:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>By default, enter the current BOH count (what you see now)</li>
                      <li>Tap a row to expand and change method or see calculations</li>
                      <li>Use "Enter Delivered" if you can see delivery boxes</li>
                    </ul>
                  </div>

                  {/* Dairy Section */}
                  {dairyMilks.length > 0 && (
                    <section>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Dairy ({dairyMilks.length})
                      </h2>
                      <div className="space-y-2">
                        {dairyMilks.map(milk => (
                          <MorningCountRow
                            key={milk.id}
                            milkTypeId={milk.id}
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
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Non-Dairy ({nonDairyMilks.length})
                      </h2>
                      <div className="space-y-2">
                        {nonDairyMilks.map(milk => (
                          <MorningCountRow
                            key={milk.id}
                            milkTypeId={milk.id}
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
          </div>

          {/* Fixed Bottom Action */}
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container max-w-2xl mx-auto px-4 py-4">
              <Button
                onClick={handleSaveMorningCount}
                disabled={saving || loading}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & View Summary
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
