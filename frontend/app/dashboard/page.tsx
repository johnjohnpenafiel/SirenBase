/**
 * Dashboard - Tool Selection Grid
 *
 * Displays available tools for partners to access.
 * Shows admin panel card only for admin role users.
 *
 * Follows DESIGN.md guidelines:
 * - App-like scrolling (h-screen layout with overflow-y-auto)
 * - Nature theme color tokens
 * - Responsive grid (1/2/3 columns)
 */
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { ToolCard } from "@/components/shared/ToolCard";
import { useAuth } from "@/hooks/use-auth";
import { Package, Milk, Box, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl mx-auto p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "Partner"}!
              </p>
            </div>

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
                icon={<Box className="w-12 h-12 text-primary" />}
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
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
