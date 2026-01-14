import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string (YYYY-MM-DD) as a local date, not UTC.
 *
 * JavaScript's `new Date("2026-01-13")` parses as UTC midnight, which
 * displays as the previous day in timezones behind UTC (e.g., Pacific).
 *
 * This function ensures the date is interpreted as local midnight.
 *
 * @param dateStr - Date string in YYYY-MM-DD format (from API)
 * @returns Date object representing local midnight on that date
 *
 * @example
 * // If user is in Pacific timezone (UTC-8):
 * new Date("2026-01-13")        // → Jan 12, 2026 4:00 PM (wrong!)
 * parseLocalDate("2026-01-13")  // → Jan 13, 2026 12:00 AM (correct!)
 */
export function parseLocalDate(dateStr: string): Date {
  // Append time component to force local timezone interpretation
  return new Date(dateStr + "T00:00:00");
}

/**
 * Debounces a function call by delaying execution until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay (default: 300ms)
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
