import { useState, useEffect } from "react";

/**
 * Delays showing a loading state to prevent skeleton flash on fast loads.
 *
 * If loading finishes before the delay threshold, the skeleton is never shown.
 * If loading takes longer than the threshold, the skeleton appears.
 *
 * @param loading - The actual loading state from data fetching
 * @param delay - Milliseconds to wait before showing skeleton (default 300ms)
 * @returns Whether to show the loading skeleton
 */
export function useDelayedLoading(loading: boolean, delay = 300): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }

    const timer = setTimeout(() => setShowLoading(true), delay);
    return () => clearTimeout(timer);
  }, [loading, delay]);

  return showLoading;
}
