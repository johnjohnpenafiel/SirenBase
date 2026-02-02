/**
 * Milk Count - On Order Page
 *
 * Entry step for quantities already on order from IMS.
 * Partners check IMS and enter how many of each milk type are already ordered.
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
import { OnOrderRow } from "@/components/tools/milk-count/OnOrderRow";
import { Loader2, ArrowRight } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MilkType, MilkCountSession, MilkCountState } from "@/types";

export default function OnOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [onOrders, setOnOrders] = useState<MilkCountState>({});
  const [isScrolled, setIsScrolled] = useState(false);

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

      // Redirect based on status
      if (currentSession.status === "night_foh") {
        router.replace("/tools/milk-count/night/foh");
        return;
      }
      if (currentSession.status === "night_boh") {
        router.replace("/tools/milk-count/night/boh");
        return;
      }
      if (currentSession.status === "morning") {
        router.replace("/tools/milk-count/morning");
        return;
      }
      if (currentSession.status === "completed") {
        router.replace(`/tools/milk-count/summary/${currentSession.id}`);
        return;
      }

      // Only on_order status should reach here
      setSession(currentSession);

      // Load session entries to get existing on_order values
      if (currentSession.id) {
        const sessionData = await apiClient.getMilkCountSession(currentSession.id);
        const initialOnOrders: MilkCountState = {};

        sessionData.entries.forEach((entry) => {
          // Default to 0 if not set
          initialOnOrders[entry.milk_type_id] = entry.on_order ?? 0;
        });
        setOnOrders(initialOnOrders);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load data");
      router.push("/tools/milk-count");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = useCallback((milkTypeId: string, value: number) => {
    setOnOrders(prev => ({
      ...prev,
      [milkTypeId]: value,
    }));
  }, []);

  const handleSaveOnOrder = async () => {
    if (!session) return;

    setSaving(true);
    try {
      // Build on_orders array
      const onOrderData = milkTypes.map(mt => ({
        milk_type_id: mt.id,
        on_order: onOrders[mt.id] ?? 0,
      }));

      await apiClient.saveMilkCountOnOrder(session.id, { on_orders: onOrderData });
      router.push(`/tools/milk-count/summary/${session.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save on order quantities");
    } finally {
      setSaving(false);
    }
  };

  // Separate dairy and non-dairy
  const dairyMilks = milkTypes.filter(mt => mt.category === "dairy");
  const nonDairyMilks = milkTypes.filter(mt => mt.category === "non_dairy");

  // Calculate progress (items with non-zero on_order values)
  const enteredItems = Object.values(onOrders).filter(v => v > 0).length;
  const totalItems = milkTypes.length;
  const progressPercent = totalItems > 0 ? Math.round((enteredItems / totalItems) * 100) : 0;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
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
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  On Order
                </h1>
                <p className="text-sm text-muted-foreground">Check IMS quantities</p>
              </div>

              {/* Progress Section */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-sm font-medium">Progress</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{enteredItems}</span>/{totalItems} entered
                </p>
              </div>
              <div className="h-2.5 bg-gray-200/60 rounded-full overflow-hidden border border-neutral-300">
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
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Instructions - Neutral styling */}
                  <div className="bg-muted/50 border border-neutral-300/80 rounded-2xl p-3 pl-4 text-sm text-foreground">
                    <p className="font-medium mb-1">Check on-order quantities:</p>
                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-muted-foreground">
                      <li>Enter the quantity that is on order for each milk type</li>
                      <li>Leave at 0 if nothing is on order for that milk type</li>
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
                          <OnOrderRow
                            key={milk.id}
                            milkName={milk.name}
                            category={milk.category}
                            value={onOrders[milk.id] ?? 0}
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
                          <OnOrderRow
                            key={milk.id}
                            milkName={milk.name}
                            category={milk.category}
                            value={onOrders[milk.id] ?? 0}
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
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <Button
              onClick={handleSaveOnOrder}
              disabled={saving || loading}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Save & View Summary
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
