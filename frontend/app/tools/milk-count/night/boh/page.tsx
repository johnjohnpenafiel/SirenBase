/**
 * Milk Count - Night BOH (Back of House) Count Page
 *
 * Second step of the night count workflow.
 * Partners count milk inventory in the back of house fridge.
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
import { MilkCountCard } from "@/components/tools/milk-count/MilkCountCard";
import { Check } from "lucide-react";
import { MilkCountStepSkeleton } from "@/components/tools/milk-count/MilkCountStepSkeleton";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, getErrorMessage } from "@/lib/utils";
import type { MilkType, MilkCountSession, MilkCountState } from "@/types";

export default function NightBOHPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [counts, setCounts] = useState<MilkCountState>({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Prefetch landing page (next destination after saving)
  useEffect(() => {
    router.prefetch("/tools/milk-count");
  }, [router]);

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
          const initialCounts: MilkCountState = {};
          sessionData.entries.forEach((entry) => {
            initialCounts[entry.milk_type_id] = entry.boh_count ?? 0;
          });
          setCounts(initialCounts);
        } catch {
          const initialCounts: MilkCountState = {};
          activeMilkTypes.forEach(mt => {
            initialCounts[mt.id] = 0;
          });
          setCounts(initialCounts);
        }
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load data"));
      router.push("/tools/milk-count");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
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
      router.push("/tools/milk-count");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save BOH count"));
    } finally {
      setSaving(false);
    }
  };

  // Calculate progress
  const countedItems = Object.values(counts).filter(c => c > 0).length;
  const totalItems = milkTypes.length;
  const progressPercent = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;

  // Separate dairy and non-dairy
  const dairyMilks = milkTypes.filter(mt => mt.category === "dairy");
  const nonDairyMilks = milkTypes.filter(mt => mt.category === "non_dairy");

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
                  href="/tools/milk-count/night/foh"
                  label="Back to FOH"
                />
              </div>

              {/* Title */}
              <div className="mb-4">
                <h1 className="text-xl md:text-3xl font-medium tracking-tight text-black">
                  Night Count
                </h1>
                <span className="inline-block text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full mt-1">
                  BOH
                </span>
              </div>

              {/* Progress Section */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{countedItems}</span>/{totalItems} counted
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
              <MilkCountStepSkeleton />
            ) : (
              <div className="flex flex-col gap-2 animate-fade-in">
                {/* Dairy Section */}
                {dairyMilks.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Dairy ({dairyMilks.length})
                    </h2>
                    <div className="flex flex-col gap-2">
                      {dairyMilks.map(milk => (
                        <MilkCountCard
                          key={milk.id}
                          milkName={milk.name}
                          category={milk.category}
                          currentCount={counts[milk.id] ?? 0}
                          onCountChange={(count) => handleCountChange(milk.id, count)}
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
                        <MilkCountCard
                          key={milk.id}
                          milkName={milk.name}
                          category={milk.category}
                          currentCount={counts[milk.id] ?? 0}
                          onCountChange={(count) => handleCountChange(milk.id, count)}
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
              onClick={handleSaveNightCount}
              disabled={saving || loading}
              className="w-full h-11 font-semibold active:scale-[0.98]"
              size="lg"
            >
              <Check className="mr-2 size-4" />
              Save Night Count
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
