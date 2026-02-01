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

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { ToolCard } from "@/components/shared/ToolCard";
import { useAuth } from "@/hooks/use-auth";
import { Package, Milk, ShoppingBasket, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Threshold of 16px before shadow activates - feels more intentional
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          {/* Sticky Frosted Island - content scrolls beneath */}
          <div className="sticky top-0 z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                "bg-gray-100/60 backdrop-blur-md",
                "border border-gray-200",
                "px-5 py-8 md:px-6 md:py-10",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              <h1 className="text-3xl font-bold mb-1 text-neutral-700">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name || "Partner"}!
              </p>
            </div>
          </div>

          {/* Tools Grid - scrolls under the sticky island */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tool 1: Inventory Tracking - Active */}
                <ToolCard
                  title="Inventory Tracking"
                  description="Track basement inventory"
                  route="/tools/tracking/inventory"
                  icon={
                    <div className="w-14 h-14 rounded-full bg-stone-500/15 flex items-center justify-center">
                      <Package className="w-7 h-7 text-stone-500" />
                    </div>
                  }
                />

                {/* Tool 2: RTD&E - Active */}
                <ToolCard
                  title="RTD&E Display"
                  description="Display restocking with pull lists"
                  route="/tools/rtde"
                  icon={
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <ShoppingBasket className="w-7 h-7 text-emerald-500" />
                    </div>
                  }
                />

                {/* Tool 3: Milk Count - Active */}
                <ToolCard
                  title="Milk Count"
                  description="Milk counting with automated calculations"
                  route="/tools/milk-count"
                  icon={
                    <div className="w-14 h-14 rounded-full bg-sky-500/15 flex items-center justify-center">
                      <Milk className="w-7 h-7 text-sky-500" />
                    </div>
                  }
                />

                {/* Admin Panel - Admin Only */}
                {isAdmin && (
                  <ToolCard
                    title="Admin Panel"
                    description="Manage users and system settings"
                    route="/admin"
                    icon={
                      <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-amber-500" />
                      </div>
                    }
                    isAdminOnly={true}
                  />
                )}
            </div>

            {!isAdmin && (
              <p className="mt-8 text-sm text-muted-foreground text-center">
                Need admin access? Contact your store manager.
              </p>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
