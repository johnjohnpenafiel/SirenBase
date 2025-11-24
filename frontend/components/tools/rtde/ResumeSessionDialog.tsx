/**
 * Resume Session Dialog Component
 *
 * Shown when user tries to start a new RTD&E session but has an active one.
 * Allows user to either:
 * - Resume the existing session
 * - Start a fresh session (abandons current session)
 */
'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ResumeSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionStartedAt: string; // ISO timestamp
  itemsCounted: number;
  totalItems: number;
  onStartFresh: () => void;
}

export function ResumeSessionDialog({
  open,
  onOpenChange,
  sessionId,
  sessionStartedAt,
  itemsCounted,
  totalItems,
  onStartFresh,
}: ResumeSessionDialogProps) {
  const router = useRouter();

  const handleResume = () => {
    router.push(`/tools/rtde/session/${sessionId}`);
    onOpenChange(false);
  };

  const handleStartFresh = () => {
    onStartFresh();
    onOpenChange(false);
  };

  const timeAgo = formatDistanceToNow(new Date(sessionStartedAt), { addSuffix: true });
  const progress = Math.round((itemsCounted / totalItems) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Active Session Found</DialogTitle>
          <DialogDescription>
            You have an active RTD&E counting session in progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info Card */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            {/* Time Started */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Started <span className="font-medium text-foreground">{timeAgo}</span>
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {itemsCounted} of {totalItems} items counted
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${progress}% complete`}
                />
              </div>
            </div>
          </div>

          {/* Warning for Starting Fresh */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Starting fresh will discard current progress
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-200">
                All counts from the current session will be lost.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="secondary"
            onClick={handleResume}
            className="flex-1 sm:flex-initial"
          >
            Resume Session
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleStartFresh}
            className="flex-1 sm:flex-initial"
          >
            Start Fresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
