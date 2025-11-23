/**
 * RTD&E Items & Pars Management Page
 *
 * Admin interface for managing RTD&E items with drag-and-drop reordering.
 * Allows adding/editing/deleting items and adjusting par levels.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical, Loader2, Package } from 'lucide-react';
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
      className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
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
        <p className="font-medium truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          Par: {item.par_level}
          {!item.active && (
            <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
        >
          <Edit2 className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function RTDEItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<RTDEItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasReordered, setHasReordered] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RTDEItem | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load items (always fetch all items including inactive for admin panel)
  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRTDEItems({ include_inactive: true });
      setItems(response.items);
    } catch (error: any) {
      toast.error('Failed to load items');
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Handle drag end
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

  // Save reordered items
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
      await loadItems(); // Reload to get updated display_order from backend
    } catch (error: any) {
      toast.error('Failed to save item order');
      console.error('Error saving order:', error);
    } finally {
      setSaving(false);
    }
  };

  // Dialog handlers
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

  // Filter items
  const filteredItems = showActiveOnly ? items.filter((item) => item.active) : items;

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Controls Section */}
          <div>
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
              </Button>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    RTD&E Items & Pars
                  </h1>
                  <p className="text-muted-foreground">
                    Manage items, par levels, and display order
                  </p>
                </div>

                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add Item</span>
                </Button>
              </div>

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

          {/* Scrollable Items List */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No items yet</h3>
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
          </div>
        </main>
        <Footer />
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
