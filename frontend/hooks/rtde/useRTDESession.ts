/**
 * useRTDESession - Core session management hook for RTD&E tool
 *
 * Manages all session state, data loading, and business logic:
 * - Session loading and transformation from API
 * - Auto-save with debouncing (500ms)
 * - Phase transitions with validation
 * - Optimistic updates for toggle operations
 * - Session completion and lifecycle
 *
 * Extracted from session page to reduce file size and improve testability.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import type {
  RTDESessionWithPhase,
  RTDEItem,
  RTDESessionPhase,
} from "@/components/tools/rtde/types";
import type {
  RTDESessionItem as APISessionItem,
  GetRTDESessionResponse,
} from "@/types";
import {
  validateAllItemsCounted,
  calculateNeedQuantity,
} from "@/components/tools/rtde/utils";

// Constants
const MIN_SAVING_DISPLAY_MS = 800;
const DEBOUNCE_SAVE_MS = 500;

interface UseRTDESessionOptions {
  sessionId: string;
}

interface UseRTDESessionReturn {
  // Core state
  loading: boolean;
  sessionData: RTDESessionWithPhase | null;
  phase: RTDESessionPhase;
  currentIndex: number;
  saving: boolean;

  // Validation dialog state
  showValidationDialog: boolean;
  uncountedItems: RTDEItem[];
  setShowValidationDialog: (open: boolean) => void;

  // Navigation
  jumpToItem: (index: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;

  // Count management
  handleCountChange: (newCount: number) => void;

  // Phase transitions
  handleStartPull: () => void;
  handleContinueWithExclusions: () => void;
  handleGoBack: () => void;

  // Pull management
  handleTogglePulled: (itemId: string, currentlyPulled: boolean) => Promise<void>;

  // Session lifecycle
  handleCompleteSession: () => Promise<void>;
  handleStartFresh: () => Promise<void>;
  completing: boolean;
  completed: boolean;
}

export function useRTDESession({
  sessionId,
}: UseRTDESessionOptions): UseRTDESessionReturn {
  const router = useRouter();

  // Core state
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<RTDESessionPhase>("counting");
  const [sessionData, setSessionData] = useState<RTDESessionWithPhase | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  // Validation dialog state
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [uncountedItems, setUncountedItems] = useState<RTDEItem[]>([]);

  // Completion state
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track when saving indicator started (for minimum display time)
  const savingStartTimeRef = useRef<number | null>(null);

  // Load session data on mount
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Arrow key navigation (counting phase only)
  useEffect(() => {
    if (phase !== "counting" || !sessionData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < sessionData.items.length - 1
      ) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, sessionData, currentIndex]);

  /**
   * Load session from API and transform to internal format
   * NOTE: Backend defaults counted_quantity to 0, frontend treats 0 as "uncounted" (null)
   */
  const loadSession = async () => {
    try {
      setLoading(true);
      const response: GetRTDESessionResponse = await apiClient.getRTDESession(
        sessionId
      );

      // Transform API items to internal RTDEItem format
      const items: RTDEItem[] = response.items.map(
        (apiItem: APISessionItem) => ({
          itemId: apiItem.item_id,
          name: apiItem.name,
          brand: apiItem.brand,
          imageFilename: apiItem.image_filename,
          icon: apiItem.icon,
          parLevel: apiItem.par_level,
          displayOrder: apiItem.display_order,
          countedQuantity:
            apiItem.counted_quantity === 0 ? null : apiItem.counted_quantity,
          needQuantity: calculateNeedQuantity(
            apiItem.par_level,
            apiItem.counted_quantity === 0 ? null : apiItem.counted_quantity
          ),
          isPulled: apiItem.is_pulled,
        })
      );

      setSessionData({
        sessionId: response.session.id,
        startedAt: response.session.started_at,
        expiresAt: response.session.expires_at,
        status: response.session.status,
        items,
        phase: "counting",
        currentItemIndex: 0,
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load session"));
      router.push("/tools/rtde");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save count with debouncing (500ms delay)
   * Shows "Saving..." immediately, keeps visible through debounce + API call
   * Uses minimum display time to prevent brief flashes during rapid clicks
   */
  const saveCount = useCallback(
    async (itemId: string, count: number | null) => {
      // Clear any pending save timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Show "Saving..." immediately when user starts interaction
      setSaving(true);
      if (!savingStartTimeRef.current) {
        savingStartTimeRef.current = Date.now();
      }

      // Debounce the actual API call
      saveTimerRef.current = setTimeout(async () => {
        try {
          await apiClient.updateRTDECount(sessionId, {
            item_id: itemId,
            counted_quantity: count ?? 0,
          });
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "Failed to save count"));
        } finally {
          // Ensure minimum display time for smooth fade animation
          const elapsed =
            Date.now() - (savingStartTimeRef.current || Date.now());
          const remaining = Math.max(0, MIN_SAVING_DISPLAY_MS - elapsed);

          setTimeout(() => {
            setSaving(false);
            savingStartTimeRef.current = null;
          }, remaining);
        }
      }, DEBOUNCE_SAVE_MS);
    },
    [sessionId]
  );

  /**
   * Handle count change - optimistic UI update + debounced save
   */
  const handleCountChange = useCallback(
    (newCount: number) => {
      if (!sessionData) return;

      const currentItem = sessionData.items[currentIndex];

      // Update local state immediately (optimistic update)
      const updatedItems = sessionData.items.map((item) =>
        item.itemId === currentItem.itemId
          ? {
              ...item,
              countedQuantity: newCount,
              needQuantity: calculateNeedQuantity(item.parLevel, newCount),
            }
          : item
      );

      setSessionData({
        ...sessionData,
        items: updatedItems,
      });

      // Save to backend with debounce
      saveCount(currentItem.itemId, newCount);
    },
    [sessionData, currentIndex, saveCount]
  );

  /**
   * Navigation handlers
   */
  const jumpToItem = useCallback(
    (index: number) => {
      if (phase === "counting") {
        setCurrentIndex(index);
      }
    },
    [phase]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (sessionData && currentIndex < sessionData.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [sessionData, currentIndex]);

  /**
   * Phase Transition: Counting → Pulling
   * Validates counting status before phase transition.
   */
  const handleStartPull = useCallback(() => {
    if (!sessionData) return;

    const validation = validateAllItemsCounted(sessionData.items);

    if (validation.allCounted) {
      // All items counted - proceed to pull phase
      setPhase("pulling");
    } else {
      // Show validation dialog with uncounted items
      setUncountedItems(validation.uncountedItems);
      setShowValidationDialog(true);
    }
  }, [sessionData]);

  /**
   * Validation Dialog: "Continue" (Exclude Uncounted Items)
   * User chose to proceed to pull phase with uncounted items excluded.
   */
  const handleContinueWithExclusions = useCallback(() => {
    setShowValidationDialog(false);
    setUncountedItems([]);
    setPhase("pulling");
  }, []);

  /**
   * Handle "Go Back & Count" from validation dialog
   * Returns to first uncounted item in counting phase
   */
  const handleGoBack = useCallback(() => {
    setShowValidationDialog(false);
    if (uncountedItems.length > 0 && sessionData) {
      const firstUncountedIndex = sessionData.items.findIndex(
        (item) => item.itemId === uncountedItems[0].itemId
      );
      if (firstUncountedIndex >= 0) {
        setCurrentIndex(firstUncountedIndex);
      }
    }
    setUncountedItems([]);
  }, [uncountedItems, sessionData]);

  /**
   * Toggle Item Pulled Status (Pulling Phase)
   * Marks items as pulled/unpulled with optimistic updates.
   */
  const handleTogglePulled = useCallback(
    async (itemId: string, currentlyPulled: boolean) => {
      if (!sessionData) return;

      try {
        // Optimistic update
        const updatedItems = sessionData.items.map((item) =>
          item.itemId === itemId ? { ...item, isPulled: !currentlyPulled } : item
        );

        setSessionData({
          ...sessionData,
          items: updatedItems,
        });

        // Save to backend
        await apiClient.markRTDEItemPulled(sessionId, {
          item_id: itemId,
          is_pulled: !currentlyPulled,
        });
      } catch (error: unknown) {
        // Revert on error
        const revertedItems = sessionData.items.map((item) =>
          item.itemId === itemId ? { ...item, isPulled: currentlyPulled } : item
        );

        setSessionData({
          ...sessionData,
          items: revertedItems,
        });
        toast.error(getErrorMessage(error, "Failed to update item"));
      }
    },
    [sessionData, sessionId]
  );

  /**
   * Complete Session - Permanently deletes session and all data
   */
  const handleCompleteSession = useCallback(async () => {
    try {
      setCompleting(true);
      await apiClient.completeRTDESession(sessionId);
      // Show success animation before redirecting
      setCompleting(false);
      setCompleted(true);
      // Wait for animation to play, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to complete session"));
      setCompleting(false);
    }
  }, [sessionId, router]);

  /**
   * Handle "Start Fresh" from Resume Dialog
   * Abandons current session, creates new one, and redirects
   */
  const handleStartFresh = useCallback(async () => {
    try {
      // Backend auto-abandons old session when starting new
      const newSession = await apiClient.startRTDESession({});
      router.replace(`/tools/rtde/session/${newSession.session_id}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to start new session"));
    }
  }, [router]);

  return {
    // Core state
    loading,
    sessionData,
    phase,
    currentIndex,
    saving,

    // Validation dialog state
    showValidationDialog,
    uncountedItems,
    setShowValidationDialog,

    // Navigation
    jumpToItem,
    handlePrevious,
    handleNext,

    // Count management
    handleCountChange,

    // Phase transitions
    handleStartPull,
    handleContinueWithExclusions,
    handleGoBack,

    // Pull management
    handleTogglePulled,

    // Session lifecycle
    handleCompleteSession,
    handleStartFresh,
    completing,
    completed,
  };
}
