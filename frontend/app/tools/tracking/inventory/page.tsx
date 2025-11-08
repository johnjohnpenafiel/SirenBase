/**
 * Inventory Tracking Page
 *
 * Main inventory page with three view modes:
 * - Categories: Grid of category cards
 * - All: List of all items (individual display)
 * - Filtered: Items filtered by selected category (individual display)
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { AddItemDialog } from '@/components/tools/tracking/AddItemDialog';
import apiClient from '@/lib/api';
import { ITEM_CATEGORIES, formatCategory } from '@/lib/constants';
import type { Item, ItemCategory } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, Plus, History, Trash2 } from 'lucide-react';

type ViewMode = 'categories' | 'all' | 'filtered';

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removingCode, setRemovingCode] = useState<string | null>(null);

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getItems();
      setItems(response.items.filter(item => !item.is_removed));
    } catch (error: any) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  // Filter items by category if in filtered mode
  const filteredItems = useMemo(() => {
    if (viewMode !== 'filtered' || !selectedCategory) return items;
    return items.filter(item => item.category === selectedCategory);
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

    items.forEach(item => {
      counts[item.category] += 1;
    });

    return counts;
  }, [items]);

  const handleItemAdded = () => {
    fetchItems(); // Refresh items after adding
    setAddDialogOpen(false);
  };

  const handleRemoveItem = async (code: string) => {
    if (!confirm(`Remove item with code ${code}?`)) {
      return;
    }

    try {
      setRemovingCode(code);
      await apiClient.deleteItem(code);
      toast.success('Item removed successfully');
      fetchItems(); // Refresh list
    } catch (error: any) {
      toast.error('Failed to remove item');
    } finally {
      setRemovingCode(null);
    }
  };

  const handleCategoryClick = (category: ItemCategory) => {
    setSelectedCategory(category);
    setViewMode('filtered');
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {viewMode === 'filtered' && selectedCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToCategories}
                      className="mb-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Categories
                    </Button>
                  )}
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {viewMode === 'filtered' && selectedCategory
                      ? formatCategory(selectedCategory)
                      : 'Inventory Tracking'}
                  </h1>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/tools/tracking/history')}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('all');
                    setSelectedCategory(null);
                  }}
                >
                  All Items
                </Button>
                <Button
                  variant={viewMode === 'categories' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('categories');
                    setSelectedCategory(null);
                  }}
                >
                  Categories
                </Button>
              </div>
            </div>

            {/* Categories View */}
            {viewMode === 'categories' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ITEM_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <h3 className="font-semibold text-lg mb-1">{formatCategory(category)}</h3>
                    <p className="text-2xl font-bold text-blue-600">{categoryCounts[category]}</p>
                    <p className="text-xs text-gray-500 mt-1">items</p>
                  </button>
                ))}
              </div>
            )}

            {/* All Items / Filtered View - Individual Display */}
            {(viewMode === 'all' || viewMode === 'filtered') && (
              <div className="space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No items in inventory. Click "Add Item" to get started.</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="w-full p-4 bg-white rounded-lg border-2 border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-500">{formatCategory(item.category)}</p>
                          <p className="text-sm font-mono font-bold text-blue-600 mt-1">
                            Code: {item.code}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem(item.code)}
                          disabled={removingCode === item.code}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {removingCode === item.code ? 'Removing...' : 'Remove'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />

        {/* Add Item Dialog */}
        <AddItemDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onItemAdded={handleItemAdded}
          preselectedCategory={viewMode === 'filtered' ? selectedCategory : null}
        />
      </div>
    </ProtectedRoute>
  );
}
