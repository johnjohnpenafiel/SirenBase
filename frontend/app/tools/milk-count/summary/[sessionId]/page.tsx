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
import type { MilkCountSummaryEntry, MilkCountSession } from "@/types";

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [summary, setSummary] = useState<MilkCountSummaryEntry[]>([]);
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
          <div className="container max-w-2xl mx-auto px-4 pb-20">
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
                              <div className="flex items-center gap-3 p-3 pr-5">
                                {/* Category Icon */}
                                <div className="shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-muted text-blue-500/80">
                                  <Milk className="w-6 h-6" />
                                </div>
                                {/* Milk Name & Category */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-foreground truncate">{entry.milk_type}</h3>
                                  <p className="text-xs text-muted-foreground">{entry.category === "dairy" ? "Dairy" : "Non-Dairy"}</p>
                                </div>
                                {/* Order Value */}
                                <div className="text-center shrink-0 bg-muted/50 rounded-xl px-3 py-1.5 border border-border/50">
                                  <p className="text-xs text-muted-foreground">Order</p>
                                  <p className="text-xl font-bold tabular-nums">{Math.max(0, entry.order)}</p>
                                </div>
                              </div>
                              <CollapsibleContent>
                                <CollapsibleTrigger className="w-full text-left">
                                  <div className="px-3 pb-3 pt-3">
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">FOH</p>
                                        <p className="font-semibold">{entry.foh}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">BOH</p>
                                        <p className="font-semibold">{entry.boh}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">Delivered</p>
                                        <p className="font-semibold">{entry.delivered}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">On Order</p>
                                        <p className="font-semibold">{entry.on_order}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="font-semibold">{entry.total}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">Par</p>
                                        <p className="font-semibold">{entry.par}</p>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                              </CollapsibleContent>
                              {/* Expand/collapse bar */}
                              <CollapsibleTrigger className="w-full">
                                <div className="flex justify-center items-center py-1 bg-muted/50 active:bg-muted/70 transition-colors">
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                </div>
                              </CollapsibleTrigger>
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
                              <div className="flex items-center gap-3 p-3 pr-5">
                                {/* Category Icon */}
                                <div className="shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center bg-muted text-green-500/80">
                                  <Leaf className="w-6 h-6" />
                                </div>
                                {/* Milk Name & Category */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-foreground truncate">{entry.milk_type}</h3>
                                  <p className="text-xs text-muted-foreground">{entry.category === "dairy" ? "Dairy" : "Non-Dairy"}</p>
                                </div>
                                {/* Order Value */}
                                <div className="text-center shrink-0 bg-muted/50 rounded-xl px-3 py-1.5 border border-border/50">
                                  <p className="text-xs text-muted-foreground">Order</p>
                                  <p className="text-xl font-bold tabular-nums">{Math.max(0, entry.order)}</p>
                                </div>
                              </div>
                              <CollapsibleContent>
                                <CollapsibleTrigger className="w-full text-left">
                                  <div className="px-3 pb-3 pt-3">
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">FOH</p>
                                        <p className="font-semibold">{entry.foh}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">BOH</p>
                                        <p className="font-semibold">{entry.boh}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">Delivered</p>
                                        <p className="font-semibold">{entry.delivered}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">On Order</p>
                                        <p className="font-semibold">{entry.on_order}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="font-semibold">{entry.total}</p>
                                      </div>
                                      <div className="bg-muted/30 rounded-2xl p-2 pl-3 border border-border/50">
                                        <p className="text-xs text-muted-foreground">Par</p>
                                        <p className="font-semibold">{entry.par}</p>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                              </CollapsibleContent>
                              {/* Expand/collapse bar */}
                              <CollapsibleTrigger className="w-full">
                                <div className="flex justify-center items-center py-1 bg-muted/50 active:bg-muted/70 transition-colors">
                                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                </div>
                              </CollapsibleTrigger>
                            </div>
                          </Collapsible>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Summary Table - Desktop View */}
                <div className="hidden md:block">
                  <Card className="rounded-2xl overflow-hidden py-0">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left py-3 px-4 font-semibold border-r border-border/40">Milk Type</th>
                              <th className="text-center py-3 px-4 font-semibold border-r border-border/40">FOH</th>
                              <th className="text-center py-3 px-4 font-semibold border-r border-border/40">BOH</th>
                              <th className="text-center py-3 px-4 font-semibold border-r border-border/40">Delivered</th>
                              <th className="text-center py-3 px-4 font-semibold border-r border-border/40">On Order</th>
                              <th className="text-center py-3 px-4 font-semibold border-r border-border/40">Total</th>
                              <th className="text-center py-3 px-4 font-semibold border-r border-border/40">Par</th>
                              <th className="text-center py-3 px-4 font-semibold">Order</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Dairy Header */}
                            {dairyEntries.length > 0 && (
                              <tr className="bg-muted/30">
                                <td colSpan={8} className="py-2 px-4 font-semibold text-foreground flex items-center gap-2">
                                  <Milk className="h-4 w-4 text-blue-500/80" />
                                  Dairy
                                </td>
                              </tr>
                            )}
                            {dairyEntries.map((entry) => (
                              <tr key={entry.milk_type} className="border-b last:border-b-0 even:bg-muted/50 hover:bg-muted/60">
                                <td className="py-3 px-4 font-medium border-r border-border/40">{entry.milk_type}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.foh}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.boh}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.delivered}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.on_order}</td>
                                <td className="text-center py-3 px-4 font-semibold border-r border-border/40">{entry.total}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.par}</td>
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
                                  <Leaf className="h-4 w-4 text-green-500/80" />
                                  Non-Dairy
                                </td>
                              </tr>
                            )}
                            {nonDairyEntries.map((entry) => (
                              <tr key={entry.milk_type} className="border-b last:border-b-0 even:bg-muted/50 hover:bg-muted/60">
                                <td className="py-3 px-4 font-medium border-r border-border/40">{entry.milk_type}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.foh}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.boh}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.delivered}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.on_order}</td>
                                <td className="text-center py-3 px-4 font-semibold border-r border-border/40">{entry.total}</td>
                                <td className="text-center py-3 px-4 border-r border-border/40">{entry.par}</td>
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
