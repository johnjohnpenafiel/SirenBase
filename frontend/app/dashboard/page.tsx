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

                {/* Tool 3: Milk Count */}
                <ToolCard
                  title="Milk Count"
                  description="Milk counting with automated calculations"
                  route="/tools/milk-count"
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

            {!isAdmin && (
              <p className="mt-6 text-xs text-muted-foreground/60 text-center">
                Need admin access? Contact your store manager.
              </p>
            )}

            {/* Activity Feed Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2.5 py-1 rounded-full">
                  Recent
                </span>
                <h2 className="text-sm font-medium text-muted-foreground">
                  Activity
                </h2>
              </div>
              <ActivityFeed variant="dashboard" limit={6} />
            </div>
          </div>
      </div>
    </ProtectedRoute>
  );
}
