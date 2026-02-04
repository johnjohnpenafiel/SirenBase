/**
 * Morning Count Row Component
 *
 * Row component for morning milk counting with method selection.
 * Follows "Earned Space" design language:
 * - Small, subordinate icons (size-5)
 * - Neutral category pill with night BOH badge
 * - Tight, purposeful layout
 * - Tactile interactions
 */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Minus, Plus, Milk, Leaf, ChevronDown } from "lucide-react";
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
        <div className="flex items-center gap-3 p-4">
          {/* Left: Icon + Name + Badges (Collapsible trigger) */}
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-3 flex-1 min-w-0 text-left">
              {/* Category Icon - Small and subordinate */}
              <div
                className={cn(
                  "shrink-0 size-10 rounded-xl flex items-center justify-center",
                  "bg-muted transition-all",
                  isDairy ? "text-sky-400" : "text-emerald-400",
                  "group-data-[state=open]/collapsible:ring-2 group-data-[state=open]/collapsible:ring-sky-500/50"
                )}
              >
                {isDairy ? (
                  <Milk className="size-5" />
                ) : (
                  <Leaf className="size-5" />
                )}
              </div>

              {/* Name + Badges */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-base truncate">{milkName}</h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  {/* Night BOH badge - Black monospace */}
                  <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2 py-0.5 rounded-full">
                    BOH {nightBohCount}
                  </span>
                  {/* Category pill - Neutral */}
                  <span className="text-[10px] font-medium tracking-wide capitalize bg-neutral-200/50 border border-neutral-300 px-2 py-0.5 rounded-full">
                    {isDairy ? "Dairy" : "Non-Dairy"}
                  </span>
                  {/* Expand indicator */}
                  <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>

          {/* Right: Counter controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Decrement Button */}
            <Button
              onClick={handleDecrement}
              disabled={value === 0}
              variant="outline"
              size="icon"
              className={cn(
                "size-11 rounded-xl",
                "border border-neutral-300/80",
                "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                "active:scale-[0.98]",
                "disabled:opacity-30"
              )}
            >
              <Minus className="size-4" strokeWidth={2.5} />
            </Button>

            {/* Count Input */}
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
                "w-16 h-11 px-0",
                "text-2xl font-bold text-center tabular-nums",
                "rounded-xl",
                "transition-all duration-200",
                isEditing
                  ? "border-2 border-primary/60 ring-2 ring-primary/10"
                  : [
                      "border-transparent bg-neutral-100",
                      "hover:bg-neutral-200/70",
                      "cursor-pointer",
                    ]
              )}
              maxLength={3}
              aria-label={`${milkName} count: ${value}. Tap to edit.`}
            />

            {/* Increment Button */}
            <Button
              onClick={handleIncrement}
              disabled={value >= 999}
              variant="outline"
              size="icon"
              className={cn(
                "size-11 rounded-xl",
                "border border-neutral-300/80",
                "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                "active:scale-[0.98]",
                "disabled:opacity-30"
              )}
            >
              <Plus className="size-4" strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-neutral-200 pt-3 space-y-3">
            {/* Method Selection */}
            <div className="flex gap-2">
              <Button
                variant={method === "boh_count" ? "default" : "outline"}
                onClick={() => onMethodChange("boh_count")}
                className="flex-1 h-10 text-sm active:scale-[0.98]"
              >
                Current BOH
              </Button>
              <Button
                variant={method === "direct_delivered" ? "default" : "outline"}
                onClick={() => onMethodChange("direct_delivered")}
                className="flex-1 h-10 text-sm active:scale-[0.98]"
              >
                Enter Delivered
              </Button>
            </div>

            {/* Calculated Values */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={cn(
                "rounded-xl p-3 border",
                method === "boh_count"
                  ? "bg-sky-50 border-sky-200"
                  : "bg-muted/30 border-neutral-200"
              )}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                  {method === "boh_count" ? "Entering" : "Calculated"}
                </p>
                <p className="font-bold text-lg tabular-nums">
                  {currentBoh}
                </p>
                <p className="text-xs text-muted-foreground">Current BOH</p>
              </div>
              <div className={cn(
                "rounded-xl p-3 border",
                method === "direct_delivered"
                  ? "bg-sky-50 border-sky-200"
                  : "bg-muted/30 border-neutral-200"
              )}>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                  {method === "direct_delivered" ? "Entering" : "Calculated"}
                </p>
                <p className="font-bold text-lg tabular-nums">
                  {delivered}
                </p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
