/**
 * RTD&E Count Card Component
 *
 * Large, touch-friendly card for counting RTD&E items.
 * Features:
 * - Large emoji icon and item name
 * - +/- buttons (48px height) for quick counting
 * - Direct input by clicking count (numeric keyboard on mobile)
 * - Live "Need" calculation (par - current count)
 * - Mobile-optimized with large touch targets
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RTDECountCardProps {
  itemName: string;
  icon: string; // Emoji
  parLevel: number;
  currentCount: number;
  onCountChange: (newCount: number) => void;
  className?: string;
}

export function RTDECountCard({
  itemName,
  icon,
  parLevel,
  currentCount,
  onCountChange,
  className,
}: RTDECountCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentCount.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value when currentCount changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentCount.toString());
    }
  }, [currentCount, isEditing]);

  // Handle increment
  const handleIncrement = () => {
    const newCount = Math.min(currentCount + 1, 999); // Max 999
    onCountChange(newCount);
  };

  // Handle decrement
  const handleDecrement = () => {
    const newCount = Math.max(currentCount - 1, 0); // Min 0
    onCountChange(newCount);
  };

  // Enable direct editing mode
  const handleCountClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string while typing
    if (value === '') {
      setInputValue('');
      return;
    }
    // Only allow digits
    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (numValue <= 999) {
        setInputValue(value);
      }
    }
  };

  // Handle input blur (save changes)
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
      onCountChange(numValue);
    } else {
      // Reset to current count if invalid
      setInputValue(currentCount.toString());
    }
    setIsEditing(false);
  };

  // Handle Enter key (save and exit editing)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(currentCount.toString());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-6 p-6 md:p-8 bg-card border border-border rounded-2xl transition-all duration-200',
        className
      )}
    >
      {/* Emoji Icon with Background */}
      <div className="flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-muted">
        <div className="text-5xl md:text-6xl select-none" aria-hidden="true">
          {icon}
        </div>
      </div>

      {/* Item Name */}
      <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground leading-tight">
        {itemName}
      </h2>

      {/* Par Level Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Par Level:</span>
        <span className="text-lg font-bold text-foreground">{parLevel}</span>
      </div>

      {/* Count Controls */}
      <div className="flex items-center gap-4 w-full max-w-sm mt-2">
        {/* Decrement Button */}
        <Button
          onClick={handleDecrement}
          disabled={currentCount === 0}
          variant="outline"
          size="lg"
          className={cn(
            "h-14 w-14 md:h-16 md:w-16 p-0 shrink-0 rounded-xl border-2 transition-all duration-150",
            "active:scale-95 disabled:opacity-40"
          )}
          aria-label={`Decrease count for ${itemName}`}
        >
          <Minus className="h-6 w-6 md:h-7 md:w-7" />
        </Button>

        {/* Current Count Display / Input */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {isEditing ? (
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="h-16 md:h-20 text-4xl md:text-5xl font-bold text-center border-2 border-primary rounded-xl"
              maxLength={3}
              aria-label={`Enter count for ${itemName}`}
            />
          ) : (
            <button
              onClick={handleCountClick}
              className={cn(
                "h-16 md:h-20 w-full flex items-center justify-center rounded-xl transition-all duration-150",
                "text-4xl md:text-5xl font-bold text-foreground",
                "hover:bg-muted/50 active:scale-95"
              )}
              aria-label={`Current count: ${currentCount}. Click to edit.`}
            >
              {currentCount}
            </button>
          )}
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Count</span>
        </div>

        {/* Increment Button */}
        <Button
          onClick={handleIncrement}
          disabled={currentCount >= 999}
          variant="outline"
          size="lg"
          className={cn(
            "h-14 w-14 md:h-16 md:w-16 p-0 shrink-0 rounded-xl border-2 transition-all duration-150",
            "active:scale-95 disabled:opacity-40"
          )}
          aria-label={`Increase count for ${itemName}`}
        >
          <Plus className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Tap count to type directly
      </p>
    </div>
  );
}
