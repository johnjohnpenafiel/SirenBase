/**
 * Milk Count - Summary Page
 *
 * Displays the final summary matching the paper logbook format:
 * Milk Type | FOH | BOH | Delivered | Total | Par | Order
 *
 * Color coding for order amounts:
 * - Green: At or above par (order = 0)
 * - Yellow: Close to par (order 1-3)
 * - Red: Below par (order > 3)
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  History,
  CheckCircle2,
  Home,
  Milk,
  Leaf,
} from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MilkCountSummaryEntry, MilkCountSummaryTotals, MilkCountSession } from "@/types";

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MilkCountSession | null>(null);
  const [summary, setSummary] = useState<MilkCountSummaryEntry[]>([]);
  const [totals, setTotals] = useState<MilkCountSummaryTotals | null>(null);

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

  // Get order status color
  const getOrderColor = (order: number) => {
    if (order <= 0) return "text-green-600 bg-green-50";
    if (order <= 3) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="border-b bg-background">
            <div className="container max-w-4xl mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/tools/milk-count")}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h1 className="text-lg md:text-xl font-bold text-foreground">
                      Milk Count Summary
                    </h1>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {session ? formatDate(session.date) : "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-4xl mx-auto px-4 py-4 pb-8">
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
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          <Milk className="h-4 w-4 text-blue-500" />
                          Dairy
                        </h2>
                        <div className="space-y-2">
                          {dairyEntries.map((entry) => (
                            <Card key={entry.milk_type} className="overflow-hidden">
                              <CardHeader className="py-3 px-4 bg-muted/30">
                                <CardTitle className="text-base">{entry.milk_type}</CardTitle>
                              </CardHeader>
                              <CardContent className="py-3 px-4">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground">FOH</p>
                                    <p className="font-semibold">{entry.foh}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">BOH</p>
                                    <p className="font-semibold">{entry.boh}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
                                    <p className="font-semibold">{entry.delivered}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="font-semibold">{entry.total}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Par</p>
                                    <p className="font-semibold">{entry.par}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Order</p>
                                    <p className={cn(
                                      "font-bold rounded px-2 py-0.5 inline-block",
                                      getOrderColor(entry.order)
                                    )}>
                                      {Math.max(0, entry.order)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Non-Dairy Section */}
                    {nonDairyEntries.length > 0 && (
                      <section>
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                          <Leaf className="h-4 w-4 text-green-500" />
                          Non-Dairy
                        </h2>
                        <div className="space-y-2">
                          {nonDairyEntries.map((entry) => (
                            <Card key={entry.milk_type} className="overflow-hidden">
                              <CardHeader className="py-3 px-4 bg-muted/30">
                                <CardTitle className="text-base">{entry.milk_type}</CardTitle>
                              </CardHeader>
                              <CardContent className="py-3 px-4">
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground">FOH</p>
                                    <p className="font-semibold">{entry.foh}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">BOH</p>
                                    <p className="font-semibold">{entry.boh}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
                                    <p className="font-semibold">{entry.delivered}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="font-semibold">{entry.total}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Par</p>
                                    <p className="font-semibold">{entry.par}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Order</p>
                                    <p className={cn(
                                      "font-bold rounded px-2 py-0.5 inline-block",
                                      getOrderColor(entry.order)
                                    )}>
                                      {Math.max(0, entry.order)}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Summary Table - Desktop View */}
                  <div className="hidden md:block">
                    <Card>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="text-left py-3 px-4 font-semibold">Milk Type</th>
                                <th className="text-center py-3 px-4 font-semibold">FOH</th>
                                <th className="text-center py-3 px-4 font-semibold">BOH</th>
                                <th className="text-center py-3 px-4 font-semibold">Delivered</th>
                                <th className="text-center py-3 px-4 font-semibold">Total</th>
                                <th className="text-center py-3 px-4 font-semibold">Par</th>
                                <th className="text-center py-3 px-4 font-semibold">Order</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Dairy Header */}
                              {dairyEntries.length > 0 && (
                                <tr className="bg-blue-50/50">
                                  <td colSpan={7} className="py-2 px-4 font-semibold text-blue-700 flex items-center gap-2">
                                    <Milk className="h-4 w-4" />
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
                                  <td className="text-center py-3 px-4 font-semibold">{entry.total}</td>
                                  <td className="text-center py-3 px-4">{entry.par}</td>
                                  <td className="text-center py-3 px-4">
                                    <span className={cn(
                                      "font-bold rounded px-3 py-1 inline-block",
                                      getOrderColor(entry.order)
                                    )}>
                                      {Math.max(0, entry.order)}
                                    </span>
                                  </td>
                                </tr>
                              ))}

                              {/* Non-Dairy Header */}
                              {nonDairyEntries.length > 0 && (
                                <tr className="bg-green-50/50">
                                  <td colSpan={7} className="py-2 px-4 font-semibold text-green-700 flex items-center gap-2">
                                    <Leaf className="h-4 w-4" />
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
                                  <td className="text-center py-3 px-4 font-semibold">{entry.total}</td>
                                  <td className="text-center py-3 px-4">{entry.par}</td>
                                  <td className="text-center py-3 px-4">
                                    <span className={cn(
                                      "font-bold rounded px-3 py-1 inline-block",
                                      getOrderColor(entry.order)
                                    )}>
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
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Totals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total FOH</p>
                            <p className="text-2xl font-bold">{totals.total_foh}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total BOH</p>
                            <p className="text-2xl font-bold">{totals.total_boh}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Delivered</p>
                            <p className="text-2xl font-bold">{totals.total_delivered}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Inventory</p>
                            <p className="text-2xl font-bold">{totals.total_inventory}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Order</p>
                            <p className={cn(
                              "text-2xl font-bold",
                              totals.total_order > 0 ? "text-amber-600" : "text-green-600"
                            )}>
                              {Math.max(0, totals.total_order)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push("/tools/milk-count/history")}
                    >
                      <History className="mr-2 h-5 w-5" />
                      View History
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => router.push("/dashboard")}
                    >
                      <Home className="mr-2 h-5 w-5" />
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
