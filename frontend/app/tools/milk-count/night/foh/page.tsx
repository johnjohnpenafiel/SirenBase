/**
 * Milk Count - Night FOH (Front of House) Count Page
 *
 * First step of the night count workflow.
 * Partners count milk inventory in the front beverage fridges.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { MilkCountCard } from "@/components/tools/milk-count/MilkCountCard";
import { Loader2, ArrowLeft, ArrowRight, Moon } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MilkType, MilkCountSession, MilkCountEntry, MilkCategory } from "@/types";

interface CountState {
  [milkTypeId: string]: number;
}

export default function NightFOHPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [counts, setCounts] = useState<CountState>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load milk types and session in parallel
      const [typesResponse, sessionResponse] = await Promise.all([
        apiClient.getMilkTypesForCounting(),
        apiClient.getMilkCountTodaySession(),
      ]);

      // Filter to active milk types only and sort by display order
      const activeMilkTypes = typesResponse.milk_types
        .filter(mt => mt.active)
        .sort((a, b) => a.display_order - b.display_order);
      setMilkTypes(activeMilkTypes);

      // Handle session
      let currentSession = sessionResponse.session;
      if (!currentSession) {
        // No session exists, redirect to landing to start one
        router.replace("/tools/milk-count");
        return;
      }

      // Check session status
      if (currentSession.status === "completed") {
        // Already completed, redirect to summary
        router.replace(`/tools/milk-count/summary/${currentSession.id}`);
        return;
      }

      if (currentSession.status === "morning") {
        // Night count done, redirect to morning
        router.replace("/tools/milk-count/morning");
        return;
      }

      setSession(currentSession);

      // Load session entries if they exist
      if (currentSession.id) {
        try {
          const sessionData = await apiClient.getMilkCountSession(currentSession.id);
          // Initialize counts from existing entries
          const initialCounts: CountState = {};
          sessionData.entries.forEach((entry) => {
            initialCounts[entry.milk_type_id] = entry.foh_count ?? 0;
          });
          setCounts(initialCounts);
        } catch {
          // New session with no entries yet - initialize to 0
          const initialCounts: CountState = {};
          activeMilkTypes.forEach(mt => {
            initialCounts[mt.id] = 0;
          });
          setCounts(initialCounts);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load data");
      router.push("/tools/milk-count");
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = useCallback((milkTypeId: string, count: number) => {
    setCounts(prev => ({
      ...prev,
      [milkTypeId]: count,
    }));
  }, []);

  const handleSaveAndContinue = async () => {
    if (!session) return;

    setSaving(true);
    try {
      // Build counts array
      const fohCounts = milkTypes.map(mt => ({
        milk_type_id: mt.id,
        foh_count: counts[mt.id] ?? 0,
      }));

      await apiClient.saveMilkCountNightFOH(session.id, { counts: fohCounts });
      toast.success("FOH count saved");
      router.push("/tools/milk-count/night/boh");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save FOH count");
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress
  const countedItems = Object.values(counts).filter(c => c > 0).length;
  const totalItems = milkTypes.length;

  // Separate dairy and non-dairy
  const dairyMilks = milkTypes.filter(mt => mt.category === "dairy");
  const nonDairyMilks = milkTypes.filter(mt => mt.category === "non_dairy");

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
                      <Moon className="h-4 w-4 text-blue-500" />
                      <h1 className="text-lg md:text-xl font-bold text-foreground">
                        Night Count - FOH
                      </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Count milk in front beverage fridges
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {countedItems}/{totalItems}
                  </p>
                  <p className="text-xs text-muted-foreground">Counted</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
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
                  {/* Dairy Section */}
                  {dairyMilks.length > 0 && (
                    <section>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Dairy ({dairyMilks.length})
                      </h2>
                      <div className="space-y-2">
                        {dairyMilks.map(milk => (
                          <MilkCountCard
                            key={milk.id}
                            milkTypeId={milk.id}
                            milkName={milk.name}
                            category={milk.category}
                            currentCount={counts[milk.id] ?? 0}
                            onCountChange={(count) => handleCountChange(milk.id, count)}
                            size="large"
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
                          <MilkCountCard
                            key={milk.id}
                            milkTypeId={milk.id}
                            milkName={milk.name}
                            category={milk.category}
                            currentCount={counts[milk.id] ?? 0}
                            onCountChange={(count) => handleCountChange(milk.id, count)}
                            size="large"
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
                onClick={handleSaveAndContinue}
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
                    Save & Continue to BOH
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
