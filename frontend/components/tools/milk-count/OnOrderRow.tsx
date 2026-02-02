/**
 * On Order Row Component
 *
 * Row component for entering on-order quantities from IMS.
 * Simple +/- counter interface for each milk type.
 */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Milk, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCounterInput } from "@/hooks/use-counter-input";
import type { MilkCategory } from "@/types";

interface OnOrderRowProps {
  milkName: string;
  category: MilkCategory;
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export function OnOrderRow({
  milkName,
  category,
  value,
  onValueChange,
  className,
}: OnOrderRowProps) {
  const {
    inputRef,
    inputValue,
    isEditing,
    handleIncrement,
    handleDecrement,
    handleInputFocus,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useCounterInput({ value, onChange: onValueChange });

  const isDairy = category === "dairy";

  return (
    <div
      className={cn(
        "bg-card border border-neutral-300/80 rounded-2xl overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Category Icon */}
        <div
          className={cn(
            "shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center",
            "bg-muted",
            isDairy ? "text-blue-500/80" : "text-green-500/80"
          )}
        >
          {isDairy ? (
            <Milk className="w-9 h-9" />
          ) : (
            <Leaf className="w-9 h-9" />
          )}
        </div>

        {/* Milk Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-normal text-foreground text-base">{milkName}</h3>
          <p className="text-xs text-muted-foreground">
            On order
          </p>
        </div>

        {/* Count Display */}
        <div className="shrink-0">
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            className={cn(
              "w-14 h-[92px] px-0",
              "text-3xl font-bold text-center tabular-nums",
              "rounded-2xl",
              "transition-all duration-200",
              isEditing
                ? "border-2 border-primary/60"
                : [
                    "border-transparent bg-muted/30",
                    "hover:bg-muted/50",
                    "cursor-pointer",
                  ]
            )}
            maxLength={3}
            aria-label={`${milkName} on order: ${value}. Tap to edit.`}
          />
        </div>

        {/* Vertical +/- Button Stack */}
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            onClick={handleIncrement}
            disabled={value >= 999}
            variant="outline"
            size="icon"
            className={cn(
              "size-11",
              "rounded-2xl",
              "border-2 border-gray-300/50",
              "bg-gray-100 text-gray-700 hover:bg-gray-200",
              "transition-all duration-150 ease-out",
              "hover:scale-[1.02]",
              "active:scale-[0.98]",
              "disabled:opacity-30 disabled:hover:scale-100"
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Button>

          <Button
            onClick={handleDecrement}
            disabled={value === 0}
            variant="outline"
            size="icon"
            className={cn(
              "size-11",
              "rounded-2xl",
              "border-2 border-gray-300/50",
              "bg-gray-100 text-gray-700 hover:bg-gray-200",
              "transition-all duration-150 ease-out",
              "hover:scale-[1.02]",
              "active:scale-[0.98]",
              "disabled:opacity-30 disabled:hover:scale-100"
            )}
          >
            <Minus className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
