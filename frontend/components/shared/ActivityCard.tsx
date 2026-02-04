/**
 * Activity Card Component
 *
 * Compact card displaying a single activity event.
 * Follows "Earned Space" design language:
 * - Colored badges for action type identification
 * - Tight spacing, dense information
 * - Small muted icons
 * - Monospace font for badges
 */
"use client";

import { cn } from "@/lib/utils";
import {
  Plus,
  Minus,
  Milk,
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
 * Format timestamp to relative or absolute time.
 * Shows "5m ago", "2h ago", or "Jan 4, 2:30 PM" for older.
 */
function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

interface BadgeConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BADGE_CONFIG: Record<
  DashboardActivityType | AdminActivityType,
  BadgeConfig
> = {
  // Dashboard activities
  inventory_add: {
    label: "Added",
    color: "bg-green-700 text-green-100",
    icon: Plus,
  },
  inventory_remove: {
    label: "Removed",
    color: "bg-red-700 text-red-100",
    icon: Minus,
  },
  milk_count_foh: {
    label: "FOH",
    color: "bg-sky-700 text-sky-100",
    icon: Milk,
  },
  milk_count_boh: {
    label: "BOH",
    color: "bg-sky-700 text-sky-100",
    icon: Milk,
  },
  milk_count_morning: {
    label: "Morning",
    color: "bg-sky-700 text-sky-100",
    icon: Milk,
  },
  milk_count_completed: {
    label: "Done",
    color: "bg-sky-800 text-sky-100",
    icon: Milk,
  },
  // Admin activities
  user_created: {
    label: "Created",
    color: "bg-emerald-700 text-emerald-100",
    icon: UserPlus,
  },
  user_deleted: {
    label: "Deleted",
    color: "bg-red-800 text-red-100",
    icon: UserMinus,
  },
  milk_par_updated: {
    label: "Par",
    color: "bg-amber-800 text-amber-100",
    icon: Settings,
  },
  rtde_item_created: {
    label: "Added",
    color: "bg-emerald-700 text-emerald-100",
    icon: Package,
  },
  rtde_item_updated: {
    label: "Updated",
    color: "bg-amber-800 text-amber-100",
    icon: Package,
  },
  rtde_item_deleted: {
    label: "Deleted",
    color: "bg-red-800 text-red-100",
    icon: Package,
  },
};

const DEFAULT_CONFIG: BadgeConfig = {
  label: "Action",
  color: "bg-neutral-700 text-neutral-100",
  icon: Settings,
};

export interface ActivityCardProps {
  activity: DashboardActivity | AdminActivity;
  variant?: "dashboard" | "admin";
}

export function ActivityCard({
  activity,
  variant = "dashboard",
}: ActivityCardProps) {
  const config = BADGE_CONFIG[activity.type] || DEFAULT_CONFIG;
  const Icon = config.icon;
  const userName =
    variant === "dashboard"
      ? (activity as DashboardActivity).user_name
      : (activity as AdminActivity).admin_name;

  return (
    <div className="p-3.5 border border-neutral-300/60 rounded-xl bg-card">
      {/* Top row: Badge and icon */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            "text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full",
            config.color
          )}
        >
          {config.label}
        </span>
        <Icon className="size-4 text-muted-foreground/50" />
      </div>

      {/* Description */}
      <p className="text-sm font-medium text-foreground leading-snug">
        {activity.description}
      </p>

      {/* Metadata row */}
      <p className="text-xs text-muted-foreground mt-1">
        {userName}
        <span className="text-muted-foreground/50 mx-1.5">·</span>
        <span className="text-muted-foreground/70">
          {formatTimestamp(activity.timestamp)}
        </span>
      </p>
    </div>
  );
}
