/**
 * Morning Count Row Component
 *
 * Row component for morning milk counting with method selection.
 * Partners can either:
 * - Option A: Enter current BOH count (app calculates delivered)
 * - Option B: Enter delivered directly (app calculates current BOH)
 */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Minus, Plus, Milk, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCounterInput } from "@/hooks/use-counter-input";
import type { MilkCategory, MilkCountMorningMethod } from "@/types";

interface MorningCountRowProps {
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
  milkName,
  category,
  nightBohCount,
  method,
  value,
  onMethodChange,
  onValueChange,
  className,
}: MorningCountRowProps) {
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

  // Calculate derived values
  const currentBoh = method === "boh_count" ? value : nightBohCount + value;
  const delivered = method === "boh_count" ? Math.max(0, value - nightBohCount) : value;

  return (
    <Collapsible className={cn("group/collapsible", className)}>
      <div className="bg-card border border-neutral-300/80 rounded-2xl overflow-hidden">
        {/* Main Row */}
        <div className="flex items-center gap-4 p-4">
          {/* CollapsibleTrigger: Icon + Name area */}
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-4 flex-1 min-w-0 text-left">
              {/* Category Icon */}
              <div
                className={cn(
                  "shrink-0 w-[72px] h-[72px] rounded-2xl flex items-center justify-center",
                  "border-2 border-dashed transition-all",
                  "bg-muted border-gray-300",
                  isDairy ? "text-blue-500/80" : "text-green-500/80",
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
              aria-label={`${milkName} count: ${value}. Tap to edit.`}
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

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-3 pb-3 md:px-4 md:pb-4 border-t border-gray-300 pt-3 space-y-3">
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
