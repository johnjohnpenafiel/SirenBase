/**
 * Inventory Tracking Page
 *
 * Main inventory page with three view modes:
 * - Categories: Grid of category cards
 * - All: List of all items (individual display)
 * - Filtered: Items filtered by selected category (individual display)
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Design system color tokens throughout
 * - Adaptive buttons (icon-only on mobile)
 * - Responsive grid layouts
 */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { AddItemDialog } from "@/components/tools/tracking/AddItemDialog";
import { RemoveItemDialog } from "@/components/tools/tracking/RemoveItemDialog";
import apiClient from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";
import { ITEM_CATEGORIES, formatCategory } from "@/lib/constants";
import type { Item, ItemCategory, ViewMode } from "@/types";
import { toast } from "sonner";
import { Plus, History, Search, X } from "lucide-react";
import { InventoryContentSkeleton } from "@/components/tools/tracking/InventoryContentSkeleton";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/tools/tracking/CategoryCard";
import { ItemCard } from "@/components/tools/tracking/ItemCard";

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(
    null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<Item | null>(null);
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchBarScrolled, setIsSearchBarScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll position when view or category changes
  const resetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Search bar shadow activates when content reaches search bar
    setIsSearchBarScrolled(scrollTop > 1);
    // Island shadow activates when content reaches island (after passing search bar ~64px)
    setIsScrolled(scrollTop > 64);
  };

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Prefetch likely next navigation
  useEffect(() => {
    router.prefetch("/tools/tracking/history");
  }, [router]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getItems();
      setItems(response.items.filter((item) => !item.is_removed));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load inventory"));
    } finally {
      setLoading(false);
    }
  };

  // Filter items by category if in filtered mode
  const filteredItems = useMemo(() => {
    if (viewMode !== "filtered" || !selectedCategory) return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, viewMode, selectedCategory]);

  // Search-filtered items (works on top of category filtering)
  const searchedItems = useMemo(() => {
    const baseItems = viewMode === "filtered" ? filteredItems : items;

    if (!searchQuery.trim()) return baseItems;

    const query = searchQuery.toLowerCase().trim();

    return baseItems.filter((item) => {
      // Match by name (case-insensitive substring)
      const nameMatch = item.name.toLowerCase().includes(query);
      // Match by code (partial match)
      const codeMatch = item.code.includes(query);
      // Match by category display name
      const categoryMatch = formatCategory(item.category)
        .toLowerCase()
        .includes(query);

      return nameMatch || codeMatch || categoryMatch;
    });
  }, [items, filteredItems, viewMode, searchQuery]);

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
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to remove item"));
    } finally {
      setRemovingCode(null);
      setItemToRemove(null);
    }
  };

  const handleCategoryClick = (category: ItemCategory) => {
    setSelectedCategory(category);
    setViewMode("filtered");
    resetScroll();
  };

  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setSearchQuery("");
    resetScroll();
  };

  return (
    <ProtectedRoute>
      <div ref={scrollContainerRef} className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky wrapper containing both island and search bar */}
          <div className="sticky top-[64px] z-10">
            {/* Frosted Island */}
            <div className="px-4 md:px-8 pt-2 pb-2 md:pt-3 md:pb-3">
              <div
                className={cn(
                  "max-w-6xl mx-auto rounded-2xl border border-neutral-300/80",
                  isScrolled ? "bg-white/70 backdrop-blur-md" : "bg-white/95 backdrop-blur-md",

                  "px-5 py-4 md:px-6 md:py-5",
                  "transition-all duration-300 ease-out",
                  isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
                )}
              >
                {/* Top row: Back button (filtered) or Title (other views) + Action buttons */}
                <div className="flex items-center justify-between mb-4">
                  {viewMode === "filtered" && selectedCategory ? (
                    <BackButton
                      onClick={handleBackToCategories}
                      label="Back to Categories"
                    />
                  ) : (
                    <h1 className="text-xl md:text-3xl font-medium tracking-tight text-black">
                      Inventory
                    </h1>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="md:w-auto md:px-4"
                      onClick={() => router.push("/tools/tracking/history")}
                    >
                      <History className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">History</span>
                    </Button>
                    <Button
                      size="icon"
                      className="md:w-auto md:px-4"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Add Item</span>
                    </Button>
                  </div>
                </div>

                {/* Category title row (only in filtered view) */}
                {viewMode === "filtered" && selectedCategory && (
                  <h1 className="text-xl md:text-3xl font-medium tracking-tight text-black">
                    {formatCategory(selectedCategory)}
                  </h1>
                )}

                {/* View Toggle - Only show when not in filtered category view */}
                {viewMode !== "filtered" && (
                  <div className="inline-flex rounded-full border border-neutral-300/80 p-0.5">
                    <Button
                      variant={viewMode === "all" ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "rounded-full",
                        viewMode === "all" && "bg-neutral-200/70 text-neutral-800 font-semibold",
                        viewMode !== "all" && "text-muted-foreground"
                      )}
                      onClick={() => {
                        setViewMode("all");
                        setSelectedCategory(null);
                        setSearchQuery("");
                        resetScroll();
                      }}
                    >
                      All Items
                    </Button>
                    <Button
                      variant={viewMode === "categories" ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "rounded-full",
                        viewMode === "categories" && "bg-neutral-200/70 text-neutral-800 font-semibold",
                        viewMode !== "categories" && "text-muted-foreground"
                      )}
                      onClick={() => {
                        setViewMode("categories");
                        setSelectedCategory(null);
                        setSearchQuery("");
                        resetScroll();
                      }}
                    >
                      Categories
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar - Below island, both stay fixed */}
            <div className="px-4 md:px-8 pb-2">
              <div
                className={cn(
                  "max-w-6xl mx-auto relative rounded-full border border-neutral-300/80 transition-all duration-300 ease-out",
                  isSearchBarScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
                )}
              >
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    // Switch to all items view when user starts typing
                    if (value.trim() && viewMode === "categories") {
                      setViewMode("all");
                      setSelectedCategory(null);
                      resetScroll();
                    }
                  }}
                  className={cn(
                    "pl-10 pr-10 rounded-full backdrop-blur-md border-0 shadow-none [&::-webkit-search-cancel-button]:hidden",
                    isSearchBarScrolled ? "bg-white/70" : "bg-white/95"
                  )}
                  aria-label="Search inventory items"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content - scrolls under the island */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
              {loading ? (
                <InventoryContentSkeleton />
              ) : (
              <div className="animate-fade-in">
              {/* Categories View */}
              {viewMode === "categories" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {ITEM_CATEGORIES.map((category) => (
                    <CategoryCard
                      key={category}
                      category={formatCategory(category)}
                      count={categoryCounts[category]}
                      onClick={() => handleCategoryClick(category)}
                    />
                  ))}
                </div>
              )}

              {/* All Items / Filtered View - Individual Display */}
              {(viewMode === "all" || viewMode === "filtered") && (
                <div className="space-y-1.5">
                  {searchedItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        {searchQuery.trim()
                          ? `No items match "${searchQuery}"`
                          : 'No items in inventory. Click "Add Item" to get started.'}
                      </p>
                    </div>
                  ) : (
                    searchedItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        code={item.code}
                        name={item.name}
                        category={formatCategory(item.category)}
                        addedAt={item.added_at}
                        onRemove={() => handleRemoveClick(item)}
                        isRemoving={removingCode === item.code}
                      />
                    ))
                  )}
                </div>
              )}
              </div>
              )}
            </div>

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
