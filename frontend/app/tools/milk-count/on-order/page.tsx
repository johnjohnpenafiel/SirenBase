/**
 * Milk Count - On Order Page
 *
 * Entry step for quantities already on order from IMS.
 * Partners check IMS and enter how many of each milk type are already ordered.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { OnOrderRow } from "@/components/tools/milk-count/OnOrderRow";
import { Loader2, ArrowLeft, ArrowRight, ClipboardList } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import type { MilkType, MilkCountSession, MilkCountEntry } from "@/types";

interface OnOrderState {
  [milkTypeId: string]: number;
}

export default function OnOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [milkTypes, setMilkTypes] = useState<MilkType[]>([]);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [onOrders, setOnOrders] = useState<OnOrderState>({});

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
        const initialOnOrders: OnOrderState = {};

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
      toast.success("On order quantities saved!");
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
                      <ClipboardList className="h-4 w-4 text-purple-500" />
                      <h1 className="text-lg md:text-xl font-bold text-foreground">
                        On Order
                      </h1>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter quantities already on order
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {enteredItems}/{totalItems}
                  </p>
                  <p className="text-xs text-muted-foreground">Entered</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (enteredItems / totalItems) * 100 : 0}%` }}
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
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                    <p className="font-medium mb-1">Check on-order quantities:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
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
                            milkTypeId={milk.id}
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
                            milkTypeId={milk.id}
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
