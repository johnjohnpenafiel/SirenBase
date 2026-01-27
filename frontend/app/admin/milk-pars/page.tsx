/**
 * Milk Count Pars Management Page
 *
 * Admin interface for managing milk type par levels.
 * Par levels determine the target inventory for ordering calculations.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Milk, Leaf, Loader2, Check, X, Edit2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { MilkCountParLevel, MilkCategory } from '@/types';

interface EditingState {
  milkTypeId: string;
  value: string;
}

export default function MilkParsPage() {
  const router = useRouter();
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

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

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
        className="flex items-center gap-3 p-4 bg-card border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
      >
        {/* Category Icon */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            isDairy ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
          )}
        >
          {isDairy ? <Milk className="w-5 h-5" /> : <Leaf className="w-5 h-5" />}
        </div>

        {/* Milk Name */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{parLevel.milk_type_name}</p>
          {parLevel.updated_by_name && (
            <p className="text-xs text-muted-foreground">
              Updated by {parLevel.updated_by_name} &middot;{' '}
              {new Date(parLevel.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Par Value */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={editing.value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-20 h-10 text-center text-lg font-bold"
                maxLength={3}
                disabled={saving}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={saveParLevel}
                disabled={saving}
                className="h-10 w-10 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelEditing}
                disabled={saving}
                className="h-10 w-10 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <div className="w-20 h-10 flex items-center justify-center bg-muted/50 rounded-lg">
                <span className="text-lg font-bold">{parLevel.par_value}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditing(parLevel)}
                className="h-10 w-10"
                aria-label={`Edit par level for ${parLevel.milk_type_name}`}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header Section */}
          <div
            className={cn(
              "relative z-10 transition-all duration-300 ease-out",
              isScrolled
                ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
                : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
            )}
          >
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
              <BackButton
                variant="full"
                href="/admin"
                label="Back to Admin Panel"
                className="mb-4"
              />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Milk Count Pars
              </h1>
              <p className="text-muted-foreground">
                Configure target inventory levels for milk ordering
              </p>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : parLevels.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Milk className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Milk Types Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Milk types need to be seeded in the database.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Info Card */}
                  <Card className="bg-blue-50/50 border-blue-200">
                    <CardContent className="py-4">
                      <p className="text-sm text-blue-800">
                        <strong>Par levels</strong> are the target inventory quantities.
                        When completing a milk count, the system calculates: <br />
                        <code className="bg-blue-100 px-1 rounded">Order = Par - (FOH + BOH + Delivered)</code>
                      </p>
                    </CardContent>
                  </Card>

                  {/* Dairy Section */}
                  {dairyLevels.length > 0 && (
                    <section>
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        <Milk className="h-4 w-4 text-blue-500" />
                        Dairy ({dairyLevels.length})
                      </h2>
                      <div className="space-y-2">
                        {dairyLevels.map(renderParLevelRow)}
                      </div>
                    </section>
                  )}

                  {/* Non-Dairy Section */}
                  {nonDairyLevels.length > 0 && (
                    <section>
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        <Leaf className="h-4 w-4 text-green-500" />
                        Non-Dairy ({nonDairyLevels.length})
                      </h2>
                      <div className="space-y-2">
                        {nonDairyLevels.map(renderParLevelRow)}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
