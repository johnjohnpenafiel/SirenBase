/**
 * History Page
 *
 * Displays audit trail of all inventory actions (ADD/REMOVE).
 * Includes client-side pagination and filtering.
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import apiClient from "@/lib/api";
import { HISTORY_PAGE_SIZE, HISTORY_MAX_FETCH } from "@/lib/constants";
import type { HistoryEntry, HistoryAction } from "@/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<HistoryAction | "all">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getHistory({ limit: HISTORY_MAX_FETCH });
      setHistory(response.history);
    } catch (error: any) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Filter by action
  const filteredHistory = useMemo(() => {
    if (actionFilter === "all") return history;
    return history.filter((entry) => entry.action === actionFilter);
  }, [history, actionFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE);
  const startIndex = (currentPage - 1) * HISTORY_PAGE_SIZE;
  const endIndex = startIndex + HISTORY_PAGE_SIZE;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [actionFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-dvh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading history...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {/* Sticky Frosted Island */}
          <div className="sticky top-0 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                "bg-gray-100/60 backdrop-blur-md",
                "border border-gray-200/50",
                "px-5 py-4 md:px-6 md:py-5",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/tools/tracking/inventory")}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back to Inventory</span>
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                Audit History
              </h1>
              <p className="text-muted-foreground mb-4">
                Complete record of all inventory actions
              </p>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48">
                  <Select
                    value={actionFilter}
                    onValueChange={(value) =>
                      setActionFilter(value as HistoryAction | "all")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="ADD">Add Only</SelectItem>
                      <SelectItem value="REMOVE">Remove Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 text-sm text-muted-foreground flex items-center">
                  Showing {filteredHistory.length}{" "}
                  {filteredHistory.length === 1 ? "entry" : "entries"}
                </div>
              </div>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
              {paginatedHistory.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">
                  No history entries found.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Partner
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Code
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {paginatedHistory.map((entry) => (
                          <tr key={entry.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3 text-sm text-foreground">
                              {formatDate(entry.timestamp)}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {entry.user_name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {entry.action === "ADD" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Remove
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground">
                              {entry.item_name}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono font-semibold text-primary">
                              {entry.item_code}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-border">
                    {paginatedHistory.map((entry) => (
                      <div key={entry.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              {entry.item_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.user_name}
                            </p>
                          </div>
                          <div className="font-mono font-semibold text-primary">
                            {entry.item_code}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp)}
                          </span>
                          {entry.action === "ADD" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 md:mr-1" />
                        <span className="hidden md:inline">Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <span className="hidden md:inline">Next</span>
                        <ChevronRight className="h-4 w-4 md:ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
