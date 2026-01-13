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
import { Label } from "@/components/ui/label";
import { Minus, Plus, Milk, Leaf, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div
      className={cn(
        "bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3 p-3 md:p-4">
        {/* Category Icon */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            isDairy ? "bg-blue-50 text-blue-500" : "bg-green-50 text-green-500"
          )}
        >
          {isDairy ? (
            <Milk className="w-5 h-5" />
          ) : (
            <Leaf className="w-5 h-5" />
          )}
        </div>

        {/* Milk Name & Night BOH */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{milkName}</h3>
          <p className="text-xs text-muted-foreground">
            Night BOH: {nightBohCount}
          </p>
        </div>

        {/* Count Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleDecrement}
            disabled={value === 0}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
          >
            <Minus className="h-4 w-4" strokeWidth={2.5} />
          </Button>

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
              className="w-12 h-9 text-lg font-bold text-center border-2 border-primary/60 rounded-lg"
              maxLength={3}
            />
          ) : (
            <button
              onClick={handleValueClick}
              className="w-12 h-9 flex items-center justify-center rounded-lg text-lg font-bold tabular-nums bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {value}
            </button>
          )}

          <Button
            onClick={handleIncrement}
            disabled={value >= 999}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 h-9 w-9"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 md:px-4 md:pb-4 border-t border-border/30 pt-3 space-y-3">
          {/* Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={method === "boh_count" ? "default" : "outline"}
              size="sm"
              onClick={() => onMethodChange("boh_count")}
              className="flex-1 text-xs"
            >
              Count Current BOH
            </Button>
            <Button
              variant={method === "direct_delivered" ? "default" : "outline"}
              size="sm"
              onClick={() => onMethodChange("direct_delivered")}
              className="flex-1 text-xs"
            >
              Enter Delivered
            </Button>
          </div>

          {/* Calculated Values */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground mb-1">
                {method === "boh_count" ? "Entering" : "Calculated"}
              </p>
              <p className="font-semibold">
                Current BOH: {currentBoh}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground mb-1">
                {method === "direct_delivered" ? "Entering" : "Calculated"}
              </p>
              <p className="font-semibold">
                Delivered: {delivered}
              </p>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground">
            {method === "boh_count"
              ? "Enter what you count in BOH now. Delivered = Current BOH - Night BOH"
              : "Enter delivered quantity directly. Current BOH = Night BOH + Delivered"}
          </p>
        </div>
      )}
    </div>
  );
}
