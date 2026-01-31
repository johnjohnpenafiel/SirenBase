/**
 * RTD&E Items & Pars Management Page
 *
 * Admin interface for managing RTD&E items with drag-and-drop reordering.
 * Allows adding/editing/deleting items and adjusting par levels.
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern with back button and actions
 * - Dynamic scroll shadow
 * - Rounded-2xl cards for sortable items
 */
'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Edit2, Trash2, GripVertical, Loader2, Package } from 'lucide-react';
import { AddRTDEItemDialog } from '@/components/admin/rtde/AddRTDEItemDialog';
import { EditRTDEItemDialog } from '@/components/admin/rtde/EditRTDEItemDialog';
import { DeleteRTDEItemDialog } from '@/components/admin/rtde/DeleteRTDEItemDialog';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { RTDEItem } from '@/types';

// Sortable Item Component
interface SortableItemProps {
  item: RTDEItem;
  onEdit: (item: RTDEItem) => void;
  onDelete: (item: RTDEItem) => void;
}

function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-card border border-gray-200 rounded-2xl transition-all"
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Item Icon */}
      <span className="text-2xl shrink-0">{item.icon}</span>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        {item.brand && (
          <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
        )}
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          Par: {item.par_level}
          {!item.active && (
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">Inactive</span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
        >
          <Edit2 className="h-4 w-4" />
          <span className="hidden md:inline ml-1.5">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}`}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function RTDEItemsPage() {
  const [items, setItems] = useState<RTDEItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasReordered, setHasReordered] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RTDEItem | null>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRTDEItems({ include_inactive: true });
      setItems(response.items);
    } catch (error: any) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasReordered(true);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      const item_orders = items.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));

      await apiClient.reorderRTDEItems({ item_orders });
      toast.success('Item order saved successfully!');
      setHasReordered(false);
      await loadItems();
    } catch (error: any) {
      toast.error('Failed to save item order');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: RTDEItem) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: RTDEItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleItemAdded = async () => {
    await loadItems();
  };

  const handleItemUpdated = async () => {
    await loadItems();
  };

  const handleItemDeleted = async () => {
    await loadItems();
  };

  const filteredItems = showActiveOnly ? items.filter((item) => item.active) : items;

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {/* Sticky Frosted Island */}
          <div className="sticky top-0 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                "bg-gray-100/60 backdrop-blur-md",
                "border border-gray-200",
                "px-5 py-4 md:px-6 md:py-5",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Top row: Back + Action */}
              <div className="flex items-center justify-between mb-4">
                <BackButton
                  href="/admin"
                  label="Admin Panel"
                />
                <Button
                  size="icon"
                  className="md:w-auto md:px-4"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Item</span>
                </Button>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                RTD&E Items & Pars
              </h1>
              <p className="text-sm text-muted-foreground mb-3">
                Manage items, par levels, and display order
              </p>

              {/* Filter and Save Order */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                >
                  {showActiveOnly ? 'Show All Items' : 'Show Active Only'}
                </Button>

                {hasReordered && (
                  <Button onClick={handleSaveOrder} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Order'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {showActiveOnly
                    ? 'No active items. Add your first item or show inactive items.'
                    : 'Add your first RTD&E item to get started'}
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredItems.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <AddRTDEItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onItemAdded={handleItemAdded}
      />
      <EditRTDEItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onItemUpdated={handleItemUpdated}
        item={selectedItem}
      />
      <DeleteRTDEItemDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onItemDeleted={handleItemDeleted}
        item={selectedItem}
      />
    </ProtectedRoute>
  );
}
