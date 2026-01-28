/**
 * Milk Count - Summary Page
 *
 * Displays the final summary matching the paper logbook format:
 * Milk Type | FOH | BOH | Delivered | On Order | Total | Par | Order
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern
 * - Fixed frosted footer for actions
 *
 * Mobile view: Order amount shown prominently with expandable details
 * Desktop view: Full table with all columns visible
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  History,
  CheckCircle2,
  Milk,
  Leaf,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn, parseLocalDate } from "@/lib/utils";
import type { MilkCountSummaryEntry, MilkCountSummaryTotals, MilkCountSession } from "@/types";

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [summary, setSummary] = useState<MilkCountSummaryEntry[]>([]);
  const [totals, setTotals] = useState<MilkCountSummaryTotals | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSummary();
    }
  }, [sessionId]);

  const loadSummary = async () => {
    try {
      const response = await apiClient.getMilkCountSummary(sessionId);
      setSession(response.session);
      setSummary(response.summary);
      setTotals(response.totals);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load summary");
      router.push("/tools/milk-count");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const scrollTop = (e.target as HTMLElement).scrollTop;
    setIsScrolled(scrollTop > 16);
  }, []);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Separate dairy and non-dairy
  const dairyEntries = summary.filter(e => e.category === "dairy");
  const nonDairyEntries = summary.filter(e => e.category === "non_dairy");

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {/* Sticky Frosted Island Header */}
          <div className="sticky top-0 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-2xl mx-auto rounded-2xl",
                "bg-gray-100/60 backdrop-blur-md",
                "border border-gray-200/50",
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
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Summary
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {session ? formatDate(session.date) : "Loading..."}
                </p>
              </div>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-2xl mx-auto px-4 pb-32">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Loading summary...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Table - Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {/* Dairy Section */}
                  {dairyEntries.length > 0 && (
                    <section>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Dairy ({dairyEntries.length})
                      </h2>
                      <div className="space-y-2">
                        {dairyEntries.map((entry) => (
                          <Collapsible key={entry.milk_type} className="group/collapsible">
                            <div className="bg-card border border-gray-200 rounded-2xl overflow-hidden">
                              <CollapsibleTrigger className="w-full text-left">
                                <div className="flex items-center gap-3 p-3">
                                  {/* Category Icon */}
                                  <div className="shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-muted text-muted-foreground">
                                    <Milk className="w-6 h-6" />
                                  </div>
                                  {/* Milk Name & Total */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">{entry.milk_type}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      Total: {entry.total} · Par: {entry.par}
                                    </p>
                                  </div>
                                  {/* Order Value */}
                                  <div className="text-right shrink-0">
                                    <p className="text-xs text-muted-foreground">Order</p>
                                    <p className="text-xl font-bold tabular-nums">{Math.max(0, entry.order)}</p>
                                  </div>
                                  {/* Chevron */}
                                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 border-t border-gray-200 pt-3">
                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">FOH</p>
                                      <p className="font-semibold">{entry.foh}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">BOH</p>
                                      <p className="font-semibold">{entry.boh}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">Delivered</p>
                                      <p className="font-semibold">{entry.delivered}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">On Order</p>
                                      <p className="font-semibold">{entry.on_order}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">Total</p>
                                      <p className="font-semibold">{entry.total}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">Par</p>
                                      <p className="font-semibold">{entry.par}</p>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Non-Dairy Section */}
                  {nonDairyEntries.length > 0 && (
                    <section>
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Non-Dairy ({nonDairyEntries.length})
                      </h2>
                      <div className="space-y-2">
                        {nonDairyEntries.map((entry) => (
                          <Collapsible key={entry.milk_type} className="group/collapsible">
                            <div className="bg-card border border-gray-200 rounded-2xl overflow-hidden">
                              <CollapsibleTrigger className="w-full text-left">
                                <div className="flex items-center gap-3 p-3">
                                  {/* Category Icon */}
                                  <div className="shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-muted text-muted-foreground">
                                    <Leaf className="w-6 h-6" />
                                  </div>
                                  {/* Milk Name & Total */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">{entry.milk_type}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      Total: {entry.total} · Par: {entry.par}
                                    </p>
                                  </div>
                                  {/* Order Value */}
                                  <div className="text-right shrink-0">
                                    <p className="text-xs text-muted-foreground">Order</p>
                                    <p className="text-xl font-bold tabular-nums">{Math.max(0, entry.order)}</p>
                                  </div>
                                  {/* Chevron */}
                                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 border-t border-gray-200 pt-3">
                                  <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">FOH</p>
                                      <p className="font-semibold">{entry.foh}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">BOH</p>
                                      <p className="font-semibold">{entry.boh}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">Delivered</p>
                                      <p className="font-semibold">{entry.delivered}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">On Order</p>
                                      <p className="font-semibold">{entry.on_order}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">Total</p>
                                      <p className="font-semibold">{entry.total}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-2xl p-2">
                                      <p className="text-xs text-muted-foreground">Par</p>
                                      <p className="font-semibold">{entry.par}</p>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Summary Table - Desktop View */}
                <div className="hidden md:block">
                  <Card className="rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left py-3 px-4 font-semibold">Milk Type</th>
                              <th className="text-center py-3 px-4 font-semibold">FOH</th>
                              <th className="text-center py-3 px-4 font-semibold">BOH</th>
                              <th className="text-center py-3 px-4 font-semibold">Delivered</th>
                              <th className="text-center py-3 px-4 font-semibold">On Order</th>
                              <th className="text-center py-3 px-4 font-semibold">Total</th>
                              <th className="text-center py-3 px-4 font-semibold">Par</th>
                              <th className="text-center py-3 px-4 font-semibold">Order</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Dairy Header */}
                            {dairyEntries.length > 0 && (
                              <tr className="bg-muted/30">
                                <td colSpan={8} className="py-2 px-4 font-semibold text-foreground flex items-center gap-2">
                                  <Milk className="h-4 w-4 text-muted-foreground" />
                                  Dairy
                                </td>
                              </tr>
                            )}
                            {dairyEntries.map((entry) => (
                              <tr key={entry.milk_type} className="border-b hover:bg-muted/30">
                                <td className="py-3 px-4 font-medium">{entry.milk_type}</td>
                                <td className="text-center py-3 px-4">{entry.foh}</td>
                                <td className="text-center py-3 px-4">{entry.boh}</td>
                                <td className="text-center py-3 px-4">{entry.delivered}</td>
                                <td className="text-center py-3 px-4">{entry.on_order}</td>
                                <td className="text-center py-3 px-4 font-semibold">{entry.total}</td>
                                <td className="text-center py-3 px-4">{entry.par}</td>
                                <td className="text-center py-3 px-4">
                                  <span className="font-bold">
                                    {Math.max(0, entry.order)}
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {/* Non-Dairy Header */}
                            {nonDairyEntries.length > 0 && (
                              <tr className="bg-muted/30">
                                <td colSpan={8} className="py-2 px-4 font-semibold text-foreground flex items-center gap-2">
                                  <Leaf className="h-4 w-4 text-muted-foreground" />
                                  Non-Dairy
                                </td>
                              </tr>
                            )}
                            {nonDairyEntries.map((entry) => (
                              <tr key={entry.milk_type} className="border-b hover:bg-muted/30">
                                <td className="py-3 px-4 font-medium">{entry.milk_type}</td>
                                <td className="text-center py-3 px-4">{entry.foh}</td>
                                <td className="text-center py-3 px-4">{entry.boh}</td>
                                <td className="text-center py-3 px-4">{entry.delivered}</td>
                                <td className="text-center py-3 px-4">{entry.on_order}</td>
                                <td className="text-center py-3 px-4 font-semibold">{entry.total}</td>
                                <td className="text-center py-3 px-4">{entry.par}</td>
                                <td className="text-center py-3 px-4">
                                  <span className="font-bold">
                                    {Math.max(0, entry.order)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Totals Card */}
                {totals && (
                  <div className="bg-muted/50 border border-border rounded-2xl px-5 py-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                      Totals
                    </h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">FOH</p>
                        <p className="text-lg font-bold tabular-nums">{totals.total_foh}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">BOH</p>
                        <p className="text-lg font-bold tabular-nums">{totals.total_boh}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Delivered</p>
                        <p className="text-lg font-bold tabular-nums">{totals.total_delivered}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">On Order</p>
                        <p className="text-lg font-bold tabular-nums">{totals.total_on_order}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Inventory</p>
                        <p className="text-lg font-bold tabular-nums">{totals.total_inventory}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Order</p>
                        <p className="text-2xl font-bold tabular-nums text-foreground">
                          {Math.max(0, totals.total_order)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fixed Frosted Footer */}
          {!loading && (
            <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container max-w-2xl mx-auto px-4 py-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/tools/milk-count/history")}
                >
                  <History className="mr-2 h-5 w-5" />
                  View History
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
