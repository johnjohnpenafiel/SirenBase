/**
 * Activity Feed Component
 *
 * Fetches and displays recent activity from the API.
 * Renders all rows inside a single wrapping card with dividers.
 *
 * Supports two variants:
 * - dashboard: Shows inventory + milk count + RTD&E activities
 * - admin: Shows admin-specific actions (user management, config changes)
 */
"use client";

import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import apiClient from "@/lib/api";
import type { DashboardActivity, AdminActivity } from "@/types";
import { ActivityCard } from "./ActivityCard";
import { ActivityFeedSkeleton } from "./ActivityFeedSkeleton";

export interface ActivityFeedProps {
  variant: "dashboard" | "admin";
  limit?: number;
}

export function ActivityFeed({ variant, limit = 5 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<
    (DashboardActivity | AdminActivity)[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (variant === "dashboard") {
          const response = await apiClient.getRecentActivity({ limit });
          setActivities(response.activities);
        } else {
          const response = await apiClient.getAdminActivity({ limit });
          setActivities(response.activities);
        }
      } catch (err) {
        setError("Failed to load activity");
        console.error("Activity fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [variant, limit]);

  if (isLoading) {
    return <ActivityFeedSkeleton count={Math.min(limit, 4)} />;
  }

  if (error) {
    return (
      <div className="p-4 text-center border border-neutral-300/80 rounded-2xl bg-card">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 text-center border border-neutral-300/80 rounded-2xl bg-card">
        <Activity className="size-5 text-muted-foreground/30 mx-auto mb-1.5" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-300/80 rounded-2xl bg-neutral-100 p-1.5 flex flex-col gap-1">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} variant={variant} />
      ))}
    </div>
  );
}
