/**
 * Inventory Tracking Page
 *
 * Main inventory page with three view modes:
 * - Categories: Grid of category cards
 * - All: List of all items (individual display)
 * - Filtered: Items filtered by selected category (individual display)
 *
 * Follows DESIGN.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Design system color tokens throughout
 * - Adaptive buttons (icon-only on mobile)
 * - Responsive grid layouts
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/tools/tracking/AddItemDialog";
import { RemoveItemDialog } from "@/components/tools/tracking/RemoveItemDialog";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";
import { ITEM_CATEGORIES, formatCategory } from "@/lib/constants";
import type { Item, ItemCategory, ViewMode } from "@/types";
import { toast } from "sonner";
import { Plus, History, Trash2, Loader2 } from "lucide-react";

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(
    null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<Item | null>(null);
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getItems();
      setItems(response.items.filter((item) => !item.is_removed));
    } catch (error: any) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  // Filter items by category if in filtered mode
  const filteredItems = useMemo(() => {
    if (viewMode !== "filtered" || !selectedCategory) return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, viewMode, selectedCategory]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<ItemCategory, number> = {
      syrups: 0,
      sauces: 0,
      coffee_beans: 0,
      powders: 0,
      cups: 0,
      lids: 0,
      condiments: 0,
      cleaning_supplies: 0,
      other: 0,
    };

    items.forEach((item) => {
      counts[item.category] += 1;
    });

    return counts;
  }, [items]);

  const handleItemAdded = () => {
    fetchItems(); // Refresh items after adding
    setAddDialogOpen(false);
  };

  const handleRemoveClick = (item: Item) => {
    setItemToRemove(item);
    setRemoveDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    try {
      setRemovingCode(itemToRemove.code);
      await apiClient.deleteItem(itemToRemove.code);
      toast.success("Item removed successfully");
      fetchItems(); // Refresh list
      setRemoveDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to remove item");
    } finally {
      setRemovingCode(null);
      setItemToRemove(null);
    }
  };

  const handleCategoryClick = (category: ItemCategory) => {
    setSelectedCategory(category);
    setViewMode("filtered");
  };

  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-dvh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading inventory...</p>
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
              {/* Main row: Title + Action buttons (aligned) */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg md:text-3xl font-bold text-foreground">
                  {viewMode === "filtered" && selectedCategory
                    ? formatCategory(selectedCategory)
                    : "Inventory Tracking"}
                </h1>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/tools/tracking/history")}
                  >
                    <History className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">History</span>
                  </Button>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Add Item</span>
                  </Button>
                </div>
              </div>

              {/* Back button row (only in filtered view) */}
              {viewMode === "filtered" && selectedCategory && (
                <BackButton
                  onClick={handleBackToCategories}
                  label="Back to Categories"
                />
              )}

              {/* View Toggle - Only show when not in filtered category view */}
              {viewMode !== "filtered" && (
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "all" ? "default" : "outline"}
                    className={
                      viewMode === "all"
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : ""
                    }
                    onClick={() => {
                      setViewMode("all");
                      setSelectedCategory(null);
                    }}
                  >
                    All Items
                  </Button>
                  <Button
                    variant={viewMode === "categories" ? "default" : "outline"}
                    className={
                      viewMode === "categories"
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : ""
                    }
                    onClick={() => {
                      setViewMode("categories");
                      setSelectedCategory(null);
                    }}
                  >
                    Categories
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
              {/* Categories View */}
              {viewMode === "categories" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ITEM_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="p-6 bg-card rounded-xl border-[1.5px] border-border hover:border-slate-600 hover:shadow-md transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <h3 className="font-semibold text-lg mb-1 text-foreground">
                        {formatCategory(category)}
                      </h3>
                      <p className="text-2xl font-medium">
                        {categoryCounts[category]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        items
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* All Items / Filtered View - Individual Display */}
              {(viewMode === "all" || viewMode === "filtered") && (
                <div className="space-y-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No items in inventory. Click "Add Item" to get started.
                      </p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="w-full p-4 bg-card rounded-xl border-2 border-border hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {formatCategory(item.category)}
                            </p>
                            <div className="flex">
                              <p className="text-sm font-mono font-bold mt-1">
                                <span className="text-muted-foreground">
                                  Code:
                                </span>
                                <span className="text-foreground ml-1">
                                  {item.code}
                                </span>
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveClick(item)}
                            disabled={removingCode === item.code}
                            className="hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">
                              {removingCode === item.code
                                ? "Removing..."
                                : "Remove"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
        </main>

        {/* Add Item Dialog */}
        <AddItemDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onItemAdded={handleItemAdded}
          preselectedCategory={
            viewMode === "filtered" ? selectedCategory : null
          }
        />

        {/* Remove Item Dialog */}
        {itemToRemove && (
          <RemoveItemDialog
            open={removeDialogOpen}
            onOpenChange={setRemoveDialogOpen}
            itemName={itemToRemove.name}
            itemCode={itemToRemove.code}
            onConfirm={handleConfirmRemove}
            isRemoving={removingCode === itemToRemove.code}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
