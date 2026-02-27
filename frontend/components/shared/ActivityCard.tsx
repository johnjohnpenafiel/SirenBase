/**
 * Activity Row Component
 *
 * Compact single-line row displaying an activity event.
 * Used inside ActivityFeed's wrapping card.
 *
 * Follows "Earned Space" design language:
 * - Tool icon with accent color instead of text labels
 * - User initials circle instead of full name
 * - Compact relative timestamps
 */
"use client";

import { cn } from "@/lib/utils";
import {
  Plus,
  CornerUpRight,
  Milk,
  ShoppingBasket,
  UserPlus,
  UserMinus,
  Settings,
  Package,
} from "lucide-react";
import type {
  DashboardActivity,
  AdminActivity,
  DashboardActivityType,
  AdminActivityType,
} from "@/types";

/**
 * Format timestamp to compact relative time.
 * "now", "5m", "2h", "3d", or "Jan 4"
 */
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/** Extract initials from a name (e.g. "Sarah Johnson" → "SJ") */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface IconConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

/** Icon + color per activity type — uses tool accent colors */
const ICON_CONFIG: Record<
  DashboardActivityType | AdminActivityType,
  IconConfig
> = {
  // Dashboard — tool accent colors
  inventory_add: { icon: Plus, color: "text-green-500" },
  inventory_remove: { icon: CornerUpRight, color: "text-red-500" },
  milk_order_foh: { icon: Milk, color: "text-sky-500" },
  milk_order_boh: { icon: Milk, color: "text-sky-500" },
  milk_order_morning: { icon: Milk, color: "text-sky-500" },
  milk_order_completed: { icon: Milk, color: "text-sky-500" },
  rtde_completed: { icon: ShoppingBasket, color: "text-emerald-500" },
  // Admin
  user_created: { icon: UserPlus, color: "text-emerald-500" },
  user_deleted: { icon: UserMinus, color: "text-red-500" },
  milk_par_updated: { icon: Settings, color: "text-amber-500" },
  rtde_item_created: { icon: Package, color: "text-emerald-500" },
  rtde_item_updated: { icon: Package, color: "text-amber-500" },
  rtde_item_deleted: { icon: Package, color: "text-red-500" },
};

const DEFAULT_CONFIG: IconConfig = {
  icon: Settings,
  color: "text-muted-foreground/50",
};

export interface ActivityCardProps {
  activity: DashboardActivity | AdminActivity;
  variant?: "dashboard" | "admin";
}

export function ActivityCard({
  activity,
  variant = "dashboard",
}: ActivityCardProps) {
  const config = ICON_CONFIG[activity.type] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const userName =
    variant === "dashboard"
      ? (activity as DashboardActivity).user_name
      : (activity as AdminActivity).admin_name;
  const initials = getInitials(userName || "??");

  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-black/5 rounded-lg">
      {/* Tool icon — fixed-width container keeps icons visually aligned */}
      <div className="w-5 shrink-0 flex items-center justify-center">
        <Icon
          className={cn("size-4", config.color)}
          aria-hidden="true"
        />
      </div>

      {/* Description */}
      <p className="flex-1 text-xs text-neutral-800 truncate min-w-0">
        {activity.description}
      </p>

      {/* Initials circle */}
      <div className="size-6 rounded-full bg-black/10 flex items-center justify-center shrink-0">
        <span className="text-[9px] font-bold text-neutral-600">
          {initials}
        </span>
      </div>

      {/* Time — fixed width so varying text ("now", "52m", "4h") doesn't shift layout */}
      <span className="w-6 text-right text-[11px] text-neutral-500 tabular-nums shrink-0">
        {formatTimestamp(activity.timestamp)}
      </span>
    </div>
  );
}
