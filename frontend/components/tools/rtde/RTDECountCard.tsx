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
        'flex flex-col items-center gap-4 p-6 bg-card border border-border rounded-xl shadow-sm',
        className
      )}
    >
      {/* Emoji Icon */}
      <div className="text-6xl md:text-7xl select-none" aria-hidden="true">
        {icon}
      </div>

      {/* Item Name */}
      <h2 className="text-xl md:text-2xl font-semibold text-center text-foreground">
        {itemName}
      </h2>

      {/* Par Level Info */}
      <p className="text-sm text-muted-foreground">
        Par: <span className="font-medium text-foreground">{parLevel}</span>
      </p>

      {/* Count Controls */}
      <div className="flex items-center gap-4 w-full max-w-xs">
        {/* Decrement Button */}
        <Button
          onClick={handleDecrement}
          disabled={currentCount === 0}
          variant="outline"
          size="lg"
          className="h-12 w-12 p-0 shrink-0 touch-none"
          aria-label={`Decrease count for ${itemName}`}
        >
          <Minus className="h-6 w-6" />
        </Button>

        {/* Current Count Display / Input */}
        <div className="flex-1 flex flex-col items-center gap-1">
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
              className="h-14 text-3xl font-bold text-center border-2 border-primary"
              maxLength={3}
              aria-label={`Enter count for ${itemName}`}
            />
          ) : (
            <button
              onClick={handleCountClick}
              className="h-14 w-full flex items-center justify-center text-3xl font-bold text-foreground hover:bg-muted/50 rounded-md transition-colors"
              aria-label={`Current count: ${currentCount}. Click to edit.`}
            >
              {currentCount}
            </button>
          )}
          <span className="text-xs text-muted-foreground">Current</span>
        </div>

        {/* Increment Button */}
        <Button
          onClick={handleIncrement}
          disabled={currentCount >= 999}
          variant="outline"
          size="lg"
          className="h-12 w-12 p-0 shrink-0 touch-none"
          aria-label={`Increase count for ${itemName}`}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Helper Text (mobile only) */}
      <p className="text-xs text-muted-foreground text-center md:hidden">
        Tap count to type directly
      </p>
    </div>
  );
}
