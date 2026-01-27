/**
 * Resume Session Dialog
 *
 * Modal shown when user navigates to an active RTD&E session.
 * Allows user to either:
 * - Resume: Continue counting from where they left off
 * - Start Fresh: Abandon current session and create a new one
 */
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ResumeSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionStartedAt: string; // ISO timestamp
  itemsCounted: number;
  totalItems: number;
  onStartFresh: () => void;
}

export function ResumeSessionDialog({
  open,
  onOpenChange,
  sessionStartedAt,
  itemsCounted,
  totalItems,
  onStartFresh,
}: ResumeSessionDialogProps) {
  const handleResume = () => {
    // Just close the dialog - we're already on the session page
    onOpenChange(false);
  };

  const handleStartFresh = () => {
    onStartFresh();
    onOpenChange(false);
  };

  const timeAgo = formatDistanceToNow(new Date(sessionStartedAt), {
    addSuffix: true,
  });
  const progress = Math.round((itemsCounted / totalItems) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6" showCloseButton={false}>
        <DialogHeader className="bg-gray-100 rounded-xl px-4 pt-3 pb-3">
          <DialogTitle>Active Session Found</DialogTitle>
          <DialogDescription>
            You have an active RTD&E counting session in progress.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Session Info Card */}
          <div className="bg-muted/50 border border-gray-200 rounded-2xl px-5 py-4 space-y-3">
            {/* Time Started */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Started{" "}
                <span className="font-medium text-foreground">{timeAgo}</span>
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
              <div className="w-full bg-gray-200/60 rounded-full h-2.5 overflow-hidden border border-gray-300/50">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
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
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Starting fresh will discard current progress.</strong>{" "}
                All counts from the current session will be lost.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            onClick={handleResume}
            className="w-full"
          >
            Resume Session
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleStartFresh}
            className="w-full"
          >
            Start Fresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
