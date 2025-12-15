/**
 * Dashboard - Tool Selection Grid
 *
 * Displays available tools for partners to access.
 * Shows admin panel card only for admin role users.
 *
 * Follows DESIGN.md guidelines:
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
import { Package, Milk, ScanEye, ShieldCheck } from "lucide-react";
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
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header Section - Shadow fades in when content scrolls beneath */}
          <div
            className={cn(
              "relative z-10 transition-all duration-300 ease-out",
              isScrolled
                ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
                : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
            )}
          >
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
              <h1 className="text-3xl font-bold mb-1 text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "Partner"}!
              </p>
            </div>
          </div>

          {/* Scrollable Tools Grid */}
          <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tool 1: Inventory Tracking - Active */}
                <ToolCard
                  title="Inventory Tracking"
                  description="Track basement inventory with 4-digit codes"
                  route="/tools/tracking/inventory"
                  icon={<Package className="w-12 h-12 text-primary" />}
                />

                {/* Tool 2: Milk Count - Coming Soon */}
                <ToolCard
                  title="Milk Count"
                  description="FOH/BOH counting with automated calculations"
                  route="/tools/milk-count"
                  icon={<Milk className="w-12 h-12 text-muted-foreground" />}
                  isDisabled={true}
                />

                {/* Tool 3: RTD&E - Active */}
                <ToolCard
                  title="RTD&E Count"
                  description="Display restocking with pull lists"
                  route="/tools/rtde"
                  icon={<ScanEye className="w-12 h-12 text-primary" />}
                />

                {/* Admin Panel - Admin Only */}
                {isAdmin && (
                  <ToolCard
                    title="Admin Panel"
                    description="Manage users and system settings"
                    route="/admin"
                    icon={<ShieldCheck className="w-12 h-12 text-amber-600" />}
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
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
