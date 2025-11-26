/**
 * RTD&E Pull List Page
 *
 * Shows items that need to be pulled from BOH to reach par levels.
 * Features:
 * - Checkbox list of items with quantities
 * - Mark items as pulled
 * - Progress tracking
 * - Complete session button
 */
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { RTDEPullListItem } from '@/components/tools/rtde/RTDEPullListItem';
import { RTDENavBar } from '@/components/tools/rtde/RTDENavBar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle2, Package } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import type { RTDEPullListItem as PullListItemType } from '@/types';

interface PullListPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function RTDEPullListPage({ params }: PullListPageProps) {
  const router = useRouter();
  // Fix [BUG-006]: Unwrap params Promise with React.use()
  const { sessionId } = use(params);

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [pullList, setPullList] = useState<PullListItemType[]>([]);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Load pull list
  useEffect(() => {
    loadPullList();
  }, [sessionId]);

  const loadPullList = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getRTDEPullList(sessionId);
      setPullList(response.pull_list);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to load pull list';
      toast.error(errorMessage);
      router.push('/tools/rtde');
    } finally {
      setLoading(false);
    }
  };

  // Toggle item pulled status
  const handleTogglePulled = async (itemId: string, currentlyPulled: boolean) => {
    try {
      // Optimistic update
      setPullList((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, is_pulled: !currentlyPulled } : item
        )
      );

      // Save to backend
      await apiClient.markRTDEItemPulled(sessionId, {
        item_id: itemId,
        is_pulled: !currentlyPulled,
      });
    } catch (error: any) {
      // Revert on error
      setPullList((prev) =>
        prev.map((item) =>
          item.item_id === itemId ? { ...item, is_pulled: currentlyPulled } : item
        )
      );
      toast.error('Failed to update item');
    }
  };

  // Complete session
  const handleCompleteSession = async () => {
    try {
      setCompleting(true);
      await apiClient.completeRTDESession(sessionId);
      toast.success('Session completed successfully!');
      router.push('/tools/rtde');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to complete session';
      toast.error(errorMessage);
    } finally {
      setCompleting(false);
      setShowCompleteDialog(false);
    }
  };

  // Calculate progress
  const pulledCount = pullList.filter((item) => item.is_pulled).length;
  const totalCount = pullList.length;
  const progress = totalCount > 0 ? Math.round((pulledCount / totalCount) * 100) : 0;
  const allPulled = pulledCount === totalCount && totalCount > 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading pull list...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex md:flex-row overflow-hidden">
          {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
          <RTDENavBar sessionId={sessionId} />

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header Section - Fixed */}
            <div className="border-b border-border/30 bg-background">
              <div className="container max-w-4xl mx-auto px-4 py-4 md:py-6">
                <h1 className="text-lg font-medium text-muted-foreground text-center mb-4">
                  Pull List
                </h1>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">
                    Items needed to reach par levels
                  </p>
                </div>

                {/* Progress - Enhanced with gradient and glow */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[0.8125rem] text-muted-foreground font-medium">
                      {pulledCount} of {totalCount} items pulled
                    </span>
                    <span className="text-[0.8125rem] font-semibold tabular-nums">{progress}%</span>
                  </div>

                  <div className="relative w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    {/* Glow effect behind progress */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-green-600/40 blur-sm transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />

                    {/* Actual progress bar */}
                    <div
                      className="relative h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-green-600/30"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pull List Items - Scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="container max-w-4xl mx-auto px-4 py-6">
                {pullList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    {/* Icon with subtle gradient background */}
                    <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-muted/50 to-muted shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                      <Package className="h-12 w-12 text-muted-foreground/60" strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      All items at par!
                    </h3>

                    <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
                      No items need to be pulled from BOH. Your display is fully stocked.
                    </p>

                    <Button
                      onClick={() => setShowCompleteDialog(true)}
                      size="lg"
                      className="h-12 px-6 rounded-xl shadow-md"
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Complete Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pullList.map((item) => (
                      <RTDEPullListItem
                        key={item.item_id}
                        itemName={item.name}
                        icon={item.icon}
                        quantityNeeded={item.need_quantity}
                        isPulled={item.is_pulled}
                        onToggle={() => handleTogglePulled(item.item_id, item.is_pulled)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer - Complete Session Button */}
            <div className="shrink-0 border-t border-border/30 bg-background">
              <div className="container max-w-4xl mx-auto px-4 py-4 md:py-6 pb-20 md:pb-6">
                <Button
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={completing}
                  size="lg"
                  className="w-full md:w-auto h-12 px-6 rounded-xl shadow-md"
                >
                  {completing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Complete Session
                    </>
                  )}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Complete Session Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              {allPulled
                ? 'All items have been pulled. Completing this session will mark it as finished and it will be removed.'
                : `You still have ${totalCount - pulledCount} items not marked as pulled. Are you sure you want to complete this session?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteSession} disabled={completing}>
              {completing ? 'Completing...' : 'Complete Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
