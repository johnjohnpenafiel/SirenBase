/**
 * Dashboard - Tool Selection Grid
 *
 * Displays available tools for partners to access.
 * Shows admin panel card only for admin role users.
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Design system color tokens
 * - Responsive grid (1/2/3 columns)
 * - Dynamic scroll shadow on fixed header
 */
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { ToolCard } from "@/components/shared/ToolCard";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { MilkOrderProgress } from "@/components/shared/MilkOrderProgress";
import { RTDETimerCircle } from "@/components/shared/RTDETimerCircle";
import { useAuth } from "@/hooks/use-auth";
import { Package, Milk, ShoppingBasket, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <ProtectedRoute>
      <div className="h-dvh overflow-y-auto">
        <Header />
          {/* Tools Grid */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {/* Tool 1: Inventory Tracking */}
                <ToolCard
                  title="Inventory"
                  description="Track basement inventory"
                  route="/tools/tracking/inventory"
                  accent="stone"
                  toolNumber="01"
                  icon={<Package className="size-5 text-stone-400" />}
                />

                {/* Tool 2: RTD&E */}
                <ToolCard
                  title="RTD&E"
                  description="Display restocking with pull lists"
                  route="/tools/rtde"
                  accent="emerald"
                  toolNumber="02"
                  icon={<ShoppingBasket className="size-5 text-emerald-400" />}
                />

                {/* Tool 3: Milk Order */}
                <ToolCard
                  title="Milk Order"
                  description="Milk ordering with automated calculations"
                  route="/tools/milk-order"
                  accent="sky"
                  toolNumber="03"
                  icon={<Milk className="size-5 text-sky-400" />}
                />

                {/* Admin Panel - Admin Only */}
                {isAdmin && (
                  <ToolCard
                    title="Admin"
                    description="Manage users and settings"
                    route="/admin"
                    accent="amber"
                    icon={<ShieldCheck className="size-5 text-amber-400" />}
                    isAdminOnly={true}
                  />
                )}
            </div>


            {/* Activity Section */}
            <div className="mt-6">
              <h2 className="inline-block text-[11px] text-white bg-black px-2.5 py-0.5 rounded-full mb-2 ml-2">
                Overview
              </h2>

              {/* Status Circles */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <MilkOrderProgress />
                <RTDETimerCircle />
              </div>

              {/* Activity Log */}
              <ActivityFeed variant="dashboard" limit={5} />
            </div>
          </div>
      </div>
    </ProtectedRoute>
  );
}
