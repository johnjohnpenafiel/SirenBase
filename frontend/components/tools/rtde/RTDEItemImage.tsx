/**
 * RTD&E Item Image Component
 *
 * Displays product images with fallback hierarchy:
 * 1. Product image (if image_filename exists)
 * 2. Emoji icon (if icon exists)
 * 3. Universal placeholder icon (CupSoda from Lucide)
 *
 * Uses Next.js Image component for optimization when showing product images.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import { CupSoda } from "lucide-react";
import { cn } from "@/lib/utils";

// Size presets matching the design system
const SIZE_CONFIG = {
  xs: {
    container: "w-8 h-8",
    image: 32,
    emoji: "text-base",
    icon: "h-4 w-4",
  },
  sm: {
    container: "w-9 h-9",
    image: 36,
    emoji: "text-lg",
    icon: "h-5 w-5",
  },
  md: {
    container: "w-12 h-12",
    image: 48,
    emoji: "text-2xl",
    icon: "h-6 w-6",
  },
  lg: {
    // Viewport-responsive: shrinks from 112px down to 64px on very short viewports
    container: "w-[clamp(4rem,12vh,7rem)] h-[clamp(4rem,12vh,7rem)] md:w-36 md:h-36",
    image: 144, // Will be used for both mobile and desktop with responsive sizing
    emoji: "text-[clamp(2rem,6vh,3.5rem)] md:text-[5rem]",
    icon: "h-[clamp(2rem,6vh,3.5rem)] w-[clamp(2rem,6vh,3.5rem)] md:h-[4.5rem] md:w-[4.5rem]",
  },
} as const;

type ImageSize = keyof typeof SIZE_CONFIG;

interface RTDEItemImageProps {
  /** Product image filename (e.g., "ethos-water.jpeg") */
  imageFilename?: string | null;
  /** Emoji icon fallback */
  icon?: string | null;
  /** Size preset */
  size?: ImageSize;
  /** Additional container className */
  className?: string;
  /** Whether to apply grayscale effect (used when item is marked as pulled) */
  grayscale?: boolean;
  /** Alt text for the image */
  alt?: string;
}

export function RTDEItemImage({
  imageFilename,
  icon,
  size = "md",
  className,
  grayscale = false,
  alt = "RTD&E item",
}: RTDEItemImageProps) {
  const [imageError, setImageError] = useState(false);

  const config = SIZE_CONFIG[size];

  // Determine what to display based on fallback hierarchy
  const showImage = imageFilename && !imageError;
  const showEmoji = !showImage && icon;

  // Build image src path
  const imageSrc = imageFilename ? `/images/rtde/${imageFilename}` : "";

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "rounded-full",
        "bg-gradient-to-br from-muted/50 to-muted",
        "shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]",
        config.container,
        grayscale && "grayscale",
        className
      )}
    >
      {showImage ? (
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes={`${config.image}px`}
            className="object-cover"
            onError={() => setImageError(true)}
            priority={size === "lg"} // Prioritize loading for large images (main count card)
          />
        </div>
      ) : showEmoji ? (
        <span
          className={cn("select-none", config.emoji)}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : (
        <CupSoda
          className={cn("text-muted-foreground/60", config.icon)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
