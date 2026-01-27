/**
 * Morning Count Row Component
 *
 * Row component for morning milk counting with method selection.
 * Partners can either:
 * - Option A: Enter current BOH count (app calculates delivered)
 * - Option B: Enter delivered directly (app calculates current BOH)
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Minus, Plus, Milk, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MilkCategory, MilkCountMorningMethod } from "@/types";

interface MorningCountRowProps {
  milkTypeId: string;
  milkName: string;
  category: MilkCategory;
  nightBohCount: number;
  method: MilkCountMorningMethod;
  value: number; // Either current_boh or delivered depending on method
  onMethodChange: (method: MilkCountMorningMethod) => void;
  onValueChange: (value: number) => void;
  className?: string;
}

export function MorningCountRow({
  milkTypeId,
  milkName,
  category,
  nightBohCount,
  method,
  value,
  onMethodChange,
  onValueChange,
  className,
}: MorningCountRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  const isDairy = category === "dairy";

  // Calculate derived values
  const currentBoh = method === "boh_count" ? value : nightBohCount + value;
  const delivered = method === "boh_count" ? Math.max(0, value - nightBohCount) : value;

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
    <Collapsible className={cn("group/collapsible", className)}>
      <div className="bg-card border border-gray-200 rounded-2xl overflow-hidden">
        {/* Main Row */}
        <div className="flex items-center gap-4 p-4">
          {/* CollapsibleTrigger: Icon + Name area */}
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-4 flex-1 min-w-0 text-left">
              {/* Category Icon - Neutral */}
              <div
                className={cn(
                  "shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center",
                  "border-2 border-dashed transition-all",
                  "bg-muted text-muted-foreground border-gray-300",
                  "group-data-[state=open]/collapsible:border-solid group-data-[state=open]/collapsible:border-sky-500"
                )}
              >
                {isDairy ? (
                  <Milk className="w-9 h-9" />
                ) : (
                  <Leaf className="w-9 h-9" />
                )}
              </div>

              {/* Milk Name & Night BOH */}
              <div className="flex-1 min-w-0">
                <h3 className="font-normal text-foreground text-base">{milkName}</h3>
                <p className="text-xs text-muted-foreground">
                  Night BOH: {nightBohCount}
                </p>
              </div>
            </button>
          </CollapsibleTrigger>

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
                className="w-14 h-[92px] text-3xl font-bold text-center border-2 border-primary/60 rounded-2xl"
                maxLength={3}
              />
            ) : (
              <button
                onClick={handleValueClick}
                className={cn(
                  "w-14 h-[92px]",
                  "flex items-center justify-center",
                  "rounded-2xl",
                  "text-3xl font-bold tabular-nums",
                  "bg-muted/30 hover:bg-muted/50",
                  "transition-all duration-150",
                  "active:scale-[0.98]",
                  "focus-visible:ring-2 focus-visible:ring-primary/50"
                )}
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
              className={cn(
                "size-11",
                "rounded-2xl",
                "border-2 border-gray-200",
                "bg-gray-100 text-gray-700 hover:bg-gray-200",
                "transition-all duration-150 ease-out",
                "hover:scale-[1.02]",
                "active:scale-[0.98]",
                "disabled:opacity-30 disabled:hover:scale-100"
              )}
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </Button>

            {/* Decrement Button (bottom) */}
            <Button
              onClick={handleDecrement}
              disabled={value === 0}
              variant="outline"
              size="icon"
              className={cn(
                "size-11",
                "rounded-2xl",
                "border-2 border-gray-200",
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

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-3 pb-3 md:px-4 md:pb-4 border-t border-gray-200 pt-3 space-y-3">
            {/* Method Selection */}
            <div className="flex gap-2">
              <Button
                variant={method === "boh_count" ? "default" : "outline"}
                onClick={() => onMethodChange("boh_count")}
                className="flex-1 h-11"
              >
                Current BOH
              </Button>
              <Button
                variant={method === "direct_delivered" ? "default" : "outline"}
                onClick={() => onMethodChange("direct_delivered")}
                className="flex-1 h-11"
              >
                Enter Delivered
              </Button>
            </div>

            {/* Calculated Values */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/30 rounded-2xl p-2">
                <p className="text-xs text-muted-foreground mb-1">
                  {method === "boh_count" ? "Entering" : "Calculated"}
                </p>
                <p className="font-semibold">
                  Current BOH: {currentBoh}
                </p>
              </div>
              <div className="bg-muted/30 rounded-2xl p-2">
                <p className="text-xs text-muted-foreground mb-1">
                  {method === "direct_delivered" ? "Entering" : "Calculated"}
                </p>
                <p className="font-semibold">
                  Delivered: {delivered}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
