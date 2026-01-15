/**
 * On Order Row Component
 *
 * Row component for entering on-order quantities from IMS.
 * Simple +/- counter interface for each milk type.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Milk, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MilkCategory } from "@/types";

interface OnOrderRowProps {
  milkTypeId: string;
  milkName: string;
  category: MilkCategory;
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export function OnOrderRow({
  milkTypeId,
  milkName,
  category,
  value,
  onValueChange,
  className,
}: OnOrderRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const isDairy = category === "dairy";

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, 999);
    onValueChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, 0);
    onValueChange(newValue);
  };

  const handleValueClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setInputValue("");
      return;
    }
    if (/^\d+$/.test(val)) {
      const numValue = parseInt(val, 10);
      if (numValue <= 999) {
        setInputValue(val);
      }
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
      onValueChange(numValue);
    } else {
      setInputValue(value.toString());
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Category Icon */}
        <div
          className={cn(
            "shrink-0 w-[72px] h-[72px] rounded-xl flex items-center justify-center",
            isDairy ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
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
          <h3 className="font-semibold text-foreground text-base">{milkName}</h3>
          <p className="text-xs text-muted-foreground">
            Currently on order
          </p>
        </div>

        {/* Count Display */}
        <div className="shrink-0">
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
              className="w-14 h-[92px] text-3xl font-bold text-center border-2 border-primary/60 rounded-lg"
              maxLength={3}
            />
          ) : (
            <button
              onClick={handleValueClick}
              className="w-14 h-[92px] flex items-center justify-center rounded-lg text-3xl font-bold tabular-nums bg-muted/30 hover:bg-muted/50 transition-colors active:scale-95"
            >
              {value}
            </button>
          )}
        </div>

        {/* Vertical +/- Button Stack */}
        <div className="flex flex-col gap-1 shrink-0">
          {/* Increment Button (top) */}
          <Button
            onClick={handleIncrement}
            disabled={value >= 999}
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-lg"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </Button>

          {/* Decrement Button (bottom) */}
          <Button
            onClick={handleDecrement}
            disabled={value === 0}
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-lg"
          >
            <Minus className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
