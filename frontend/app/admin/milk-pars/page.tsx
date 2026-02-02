/**
 * Milk Count Pars Management Page
 *
 * Admin interface for managing milk type par levels.
 * Par levels determine the target inventory for ordering calculations.
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern with back button
 * - Dynamic scroll shadow
 * - Compact inline-edit rows grouped by category
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { BackButton } from '@/components/shared/BackButton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Milk, Leaf, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { MilkCountParLevel } from '@/types';

interface EditingState {
  milkTypeId: string;
  value: string;
}

export default function MilkParsPage() {
  const [loading, setLoading] = useState(true);
  const [parLevels, setParLevels] = useState<MilkCountParLevel[]>([]);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  useEffect(() => {
    loadParLevels();
  }, []);

  // Only focus+select when editing starts (milkTypeId changes), not on every keystroke
  const editingId = editing?.milkTypeId ?? null;
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const loadParLevels = async () => {
    try {
      const response = await apiClient.getParLevels();
      setParLevels(response.par_levels);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load par levels');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (parLevel: MilkCountParLevel) => {
    setEditing({
      milkTypeId: parLevel.milk_type_id,
      value: parLevel.par_value.toString(),
    });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const saveParLevel = async () => {
    if (!editing) return;

    const newValue = parseInt(editing.value, 10);
    if (isNaN(newValue) || newValue < 0 || newValue > 999) {
      toast.error('Par value must be between 0 and 999');
      return;
    }

    setSaving(true);
    try {
      await apiClient.updateParLevel(editing.milkTypeId, { par_value: newValue });
      toast.success('Par level updated');
      setEditing(null);
      await loadParLevels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update par level');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setEditing(prev => prev ? { ...prev, value } : null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveParLevel();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Separate dairy and non-dairy
  const dairyLevels = parLevels.filter(p => p.milk_type_category === 'dairy');
  const nonDairyLevels = parLevels.filter(p => p.milk_type_category === 'non_dairy');

  const renderParLevelRow = (parLevel: MilkCountParLevel) => {
    const isEditing = editing?.milkTypeId === parLevel.milk_type_id;
    const isDairy = parLevel.milk_type_category === 'dairy';

    return (
      <div
        key={parLevel.milk_type_id}
        className="flex items-center gap-3 px-4 py-3 bg-card border border-neutral-300/80 rounded-xl"
      >
        {/* Category Icon */}
        <div className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isDairy ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
        )}>
          {isDairy ? <Milk className="w-4 h-4" /> : <Leaf className="w-4 h-4" />}
        </div>

        {/* Milk Name */}
        <p className="flex-1 truncate">{parLevel.milk_type_name}</p>

        {/* Par Value — tap to edit */}
        {isEditing ? (
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={editing.value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={saveParLevel}
            className="w-16 h-9 text-center text-base font-bold shrink-0"
            maxLength={3}
            disabled={saving}
          />
        ) : (
          <button
            onClick={() => startEditing(parLevel)}
            className="w-16 h-9 text-center text-base font-bold tabular-nums shrink-0 rounded-lg border border-dashed border-border hover:border-foreground/30 hover:bg-muted/50 transition-colors cursor-text"
            aria-label={`Edit par level for ${parLevel.milk_type_name}`}
          >
            {saving && editing?.milkTypeId === parLevel.milk_type_id ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              parLevel.par_value
            )}
          </button>
        )}
      </div>
    );
  };

  const renderSection = (
    label: string,
    levels: MilkCountParLevel[]
  ) => {
    if (levels.length === 0) return null;
    return (
      <section>
        <h2 className="text-xs font-medium tracking-wide uppercase text-muted-foreground mb-2 px-1">
          {label} ({levels.length})
        </h2>
        <div className="space-y-2">
          {levels.map(renderParLevelRow)}
        </div>
      </section>
    );
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island */}
          <div className="sticky top-16 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                "bg-white/70 backdrop-blur-md",
                
                "px-5 py-4 md:px-6 md:py-5",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Top row: Back */}
              <div className="flex items-center justify-between mb-4">
                <BackButton
                  href="/admin"
                  label="Admin Panel"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Milk Count Pars
              </h1>
              <p className="text-sm text-muted-foreground">
                Set target inventory levels for milk ordering
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : parLevels.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Milk className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Milk Types Found</h3>
                <p className="text-sm text-muted-foreground">
                  Milk types need to be seeded in the database.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {renderSection('Dairy', dairyLevels)}
                {renderSection('Non-Dairy', nonDairyLevels)}
              </div>
            )}
          </div>
      </div>
    </ProtectedRoute>
  );
}
