/**
 * RTDE Items/Pars Management Page
 *
 * Admin interface for managing RTD&E items with drag-and-drop reordering.
 * Allows adding/editing/deleting items and adjusting par levels.
 *
 * Follows "Earned Space" design language:
 * - App-like scrolling (h-dvh with flex flex-col gap-2)
 * - Frosted island header with border
 * - Dynamic scroll shadow
 * - Contextual action overlay for cards
 */
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Plus, Edit2, Trash2, GripVertical, Loader2, Package, Ellipsis } from 'lucide-react';
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
  const [isActionMode, setIsActionMode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isActionMode) return;
    function handleMouseDown(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsActionMode(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isActionMode]);

  const handleAction = useCallback((actionFn: () => void) => {
    setIsActionMode(false);
    actionFn();
  }, []);

  const actions = [
    {
      label: "Edit",
      icon: <Edit2 className="size-4" />,
      onClick: () => handleAction(() => onEdit(item)),
    },
    {
      label: "Delete",
      icon: <Trash2 className="size-4" />,
      onClick: () => handleAction(() => onDelete(item)),
    },
  ];

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={style}
      className="relative flex items-center gap-3 p-4 bg-card border border-neutral-300/80 rounded-2xl transition-[opacity,border-color,box-shadow] select-none"
    >
      {/* Drag Handle - stays visible outside overlay */}
      <button
        className={cn(
          "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none",
          isActionMode && "pointer-events-none opacity-30"
        )}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-5" />
      </button>

      {/* Content Layer */}
      <div
        className={cn(
          "flex items-center gap-3 flex-1 min-w-0",
          "transition-all duration-200",
          isActionMode ? "opacity-30 blur-[2px] pointer-events-none" : "opacity-100 blur-0"
        )}
      >
        <span className="text-2xl shrink-0">{item.icon}</span>

        <div className="flex-1 min-w-0">
          {item.brand && (
            <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
          )}
          <p className="font-medium truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
              PAR {item.par_level}
            </span>
            {!item.active && (
              <span className="text-xs font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 px-2.5 py-1 rounded-full">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ellipsis trigger - outside content layer for consistent right-edge alignment */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "ml-4 flex-shrink-0",
          "transition-all duration-200",
          isActionMode ? "opacity-30 blur-[2px] pointer-events-none" : "opacity-100 blur-0"
        )}
        onClick={() => setIsActionMode(true)}
        aria-label="Item actions"
      >
        <Ellipsis className="size-4" />
      </Button>

      {/* Action Overlay */}
      {isActionMode && (
        <div className={cn(
          "absolute inset-0 rounded-2xl",
          "flex items-center justify-center gap-3",
          "animate-fade-in"
        )}>
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="default"
              className="min-w-[120px] active:scale-[0.98]"
              onClick={action.onClick}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      )}
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
      <div className="h-dvh overflow-y-auto flex flex-col gap-2" onScroll={handleScroll}>
        <Header />

        {/* Sticky Frosted Island */}
        <div className="sticky top-[72px] z-10 px-4 md:px-8">
          <div
            className={cn(
              "max-w-2xl mx-auto rounded-2xl",
              "border border-neutral-300/80",
              isScrolled ? "bg-white/70 backdrop-blur-md" : "bg-white/95 backdrop-blur-md",
              "px-5 py-4 md:px-6 md:py-5",
              "transition-all duration-300 ease-out",
              isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
            )}
          >
            {/* Top row: Back + Action */}
            <div className="flex items-center justify-between mb-4">
              <BackButton href="/admin" label="Admin" />
              <Button
                size="icon"
                className="md:w-auto md:px-4 active:scale-[0.98]"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Add Item</span>
              </Button>
            </div>
            <h1 className="text-xl md:text-3xl font-normal tracking-tight text-black">
              RTDE Items
            </h1>
            <p className="text-sm text-muted-foreground mb-3">
              Manage items, par levels, and display order
            </p>

            {/* Filter and Save Order */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="active:scale-[0.98]"
                onClick={() => setShowActiveOnly(!showActiveOnly)}
              >
                {showActiveOnly ? "Show All" : "Active Only"}
              </Button>

              {hasReordered && (
                <Button onClick={handleSaveOrder} disabled={saving} className="active:scale-[0.98]">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Order"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-2xl mx-auto px-4 md:px-8 pb-8">
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
                  ? "No active items. Add your first item or show inactive items."
                  : "Add your first RTD&E item to get started"}
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
                <div className="flex flex-col gap-2">
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
