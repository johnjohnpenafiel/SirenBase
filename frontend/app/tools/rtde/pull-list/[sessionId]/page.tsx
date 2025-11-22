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
import { Footer } from '@/components/shared/Footer';
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
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row h-screen">
        {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
        <RTDENavBar sessionId={sessionId} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex flex-col overflow-auto">
            {/* Header Section */}
            <div className="border-b bg-background">
              <div className="container max-w-4xl mx-auto px-4 py-4 md:py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Pull List</h1>
                    <p className="text-muted-foreground mt-1">
                      Items needed to reach par levels
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCompleteDialog(true)}
                    disabled={completing}
                    size="sm"
                    className="hidden sm:flex"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Session
                      </>
                    )}
                  </Button>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {pulledCount} of {totalCount} items pulled
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
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

            {/* Pull List Items */}
            <div className="flex-1 overflow-auto">
              <div className="container max-w-4xl mx-auto px-4 py-6">
                {pullList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">All items at par!</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      No items need to be pulled from BOH.
                    </p>
                    <Button onClick={() => setShowCompleteDialog(true)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
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

                {/* Complete Session Button (Mobile) */}
                {pullList.length > 0 && (
                  <div className="mt-6 sm:hidden">
                    <Button
                      onClick={() => setShowCompleteDialog(true)}
                      disabled={completing}
                      className="w-full"
                    >
                      {completing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete Session
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </main>
          <Footer />
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
