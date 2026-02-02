/**
 * History Page
 *
 * Displays audit trail of all inventory actions (ADD/REMOVE).
 * Includes client-side pagination and filtering.
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { BackButton } from "@/components/shared/BackButton";
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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { HistoryEntryCard } from "@/components/tools/tracking/HistoryEntryCard";

export default function HistoryPage() {
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
      <div className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island */}
          <div className="sticky top-[68px] z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                "bg-white/70 backdrop-blur-md",
                
                "px-5 py-4 md:px-6 md:py-5",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              <BackButton
                href="/tools/tracking/inventory"
                label="Back to Inventory"
                className="mb-4"
              />
              <h1 className="text-2xl md:text-4xl font-normal mb-4 text-foreground">
                Audit History
              </h1>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-48">
                  <Select
                    value={actionFilter}
                    onValueChange={(value) =>
                      setActionFilter(value as HistoryAction | "all")
                    }
                  >
                    <SelectTrigger className="shadow-none border-gray-300">
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
              <div className="text-center py-12 bg-card rounded-2xl border border-neutral-300/80">
                <p className="text-muted-foreground">
                  No history entries found.
                </p>
              </div>
            ) : (
              <>
                {/* Unified card list for all screen sizes */}
                <div className="space-y-3">
                  {paginatedHistory.map((entry) => (
                    <HistoryEntryCard
                      key={entry.id}
                      action={entry.action}
                      itemName={entry.item_name}
                      itemCode={entry.item_code}
                      userName={entry.user_name}
                      timestamp={entry.timestamp}
                    />
                  ))}
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
      </div>
    </ProtectedRoute>
  );
}
