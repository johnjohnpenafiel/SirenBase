/**
 * Milk Count - Night BOH (Back of House) Count Page
 *
 * Second step of the night count workflow.
 * Partners count milk inventory in the back of house fridge.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { MilkCountCard } from "@/components/tools/milk-count/MilkCountCard";
import { Loader2, ArrowLeft, Check, Moon } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import type { MilkType, MilkCountSession } from "@/types";

interface CountState {
  [milkTypeId: string]: number;
}

export default function NightBOHPage() {
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

      // If still on FOH, redirect back
      if (currentSession.status === "night_foh") {
        router.replace("/tools/milk-count/night/foh");
        return;
      }

      if (currentSession.status === "completed") {
        router.replace(`/tools/milk-count/summary/${currentSession.id}`);
        return;
      }

      if (currentSession.status === "morning") {
        router.replace("/tools/milk-count/morning");
        return;
      }

      setSession(currentSession);

      // Load session entries
      if (currentSession.id) {
        try {
          const sessionData = await apiClient.getMilkCountSession(currentSession.id);
          const initialCounts: CountState = {};
          sessionData.entries.forEach((entry) => {
            initialCounts[entry.milk_type_id] = entry.boh_count ?? 0;
          });
          setCounts(initialCounts);
        } catch {
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

  const handleSaveNightCount = async () => {
    if (!session) return;

    setSaving(true);
    try {
      const bohCounts = milkTypes.map(mt => ({
        milk_type_id: mt.id,
        boh_count: counts[mt.id] ?? 0,
      }));

      await apiClient.saveMilkCountNightBOH(session.id, { counts: bohCounts });
      toast.success("Night count saved! Return in the morning to complete.");
      router.push("/tools/milk-count");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save BOH count");
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
                    onClick={() => router.push("/tools/milk-count/night/foh")}
                    className="shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <h1 className="text-lg md:text-xl font-bold text-foreground">
                        Night Count - BOH
                      </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Count milk in back of house fridge
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
                  className="h-full bg-indigo-500 transition-all duration-300"
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
                            variant="large-icon"
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
                            variant="large-icon"
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
                onClick={handleSaveNightCount}
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
                    <Check className="mr-2 h-5 w-5" />
                    Save Night Count
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
