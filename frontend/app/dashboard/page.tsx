/**
 * Dashboard - Tool Selection Grid
 *
 * Displays available tools for partners to access.
 * Shows admin panel card only for admin role users.
 */
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ToolCard } from '@/components/shared/ToolCard';
import { useAuth } from '@/hooks/use-auth';
import { Package, Milk, Box, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">SirenBase Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || 'Partner'}! Select a tool to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Tool 1: Inventory Tracking - Active */}
              <ToolCard
                title="Inventory Tracking"
                description="Track basement inventory with 4-digit codes"
                route="/tools/tracking/inventory"
                icon={<Package className="w-8 h-8 text-primary" />}
              />

              {/* Tool 2: Milk Count - Coming Soon */}
              <ToolCard
                title="Milk Count"
                description="FOH/BOH counting with automated calculations"
                route="/tools/milk-count"
                icon={<Milk className="w-8 h-8 text-muted-foreground" />}
                isDisabled={true}
              />

              {/* Tool 3: RTD&E - Coming Soon */}
              <ToolCard
                title="RTD&E Count"
                description="Display restocking with pull lists"
                route="/tools/rtde"
                icon={<Box className="w-8 h-8 text-muted-foreground" />}
                isDisabled={true}
              />

              {/* Admin Panel - Admin Only */}
              {isAdmin && (
                <ToolCard
                  title="Admin Panel"
                  description="Manage users and system settings"
                  route="/admin"
                  icon={<ShieldCheck className="w-8 h-8 text-amber-600" />}
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
