/**
 * BackButton Component
 *
 * Reusable navigation back button following DESIGN.md guidelines:
 * - Uses `variant="outline"` for secondary/navigation actions
 * - Default size (44px) for WCAG-compliant touch targets
 *
 * Supports two modes:
 * 1. Navigation: Provide `href` to navigate to a page
 * 2. Custom action: Provide `onClick` for custom behavior (e.g., state changes)
 *
 * Supports three display variants:
 * 1. "default": Icon + responsive text (text hidden on mobile, shown on desktop)
 * 2. "icon-only": Icon only, compact square button for tight headers
 * 3. "full": Icon + text always visible (for admin pages with space)
 */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** The label text. Required for default/full variants, optional for icon-only */
  label?: string;
  /** The destination path to navigate to (optional if onClick is provided) */
  href?: string;
  /** Custom click handler (optional if href is provided) */
  onClick?: () => void;
  /** Display variant: "default" (responsive text), "icon-only", or "full" (always show text) */
  variant?: "default" | "icon-only" | "full";
  /** Additional CSS classes */
  className?: string;
}

export function BackButton({
  href,
  label,
  onClick,
  variant = "default",
  className
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  // Icon-only: compact square button
  if (variant === "icon-only") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        className={cn("shrink-0", className)}
        aria-label={label || "Go back"}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    );
  }

  // Full: always show text (for admin pages)
  if (variant === "full") {
    return (
      <Button
        variant="outline"
        onClick={handleClick}
        className={cn(className)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {label}
      </Button>
    );
  }

  // Default: responsive text (hidden on mobile)
  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className={cn(className)}
    >
      <ArrowLeft className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">{label}</span>
    </Button>
  );
}
