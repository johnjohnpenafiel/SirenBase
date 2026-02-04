/**
 * Admin Panel Page
 *
 * Modular admin dashboard with cards for different management modules.
 * Only accessible to users with admin role.
 *
 * Follows "Earned Space" design language:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Dense 2-column mobile, 3-column desktop grid
 * - Small inline icons with amber accent
 * - Black/amber monospace badges
 */
"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/shared/Header";
import { AdminModuleCard } from "@/components/admin/AdminModuleCard";
import { Users, Package, Milk } from "lucide-react";

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="h-dvh overflow-y-auto">
        <Header />

        {/* Module Cards Grid */}
        <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <AdminModuleCard
              title="Users"
              description="Manage partner accounts"
              route="/admin/users"
              moduleId="01"
              icon={<Users className="size-5 text-amber-400" />}
            />

            <AdminModuleCard
              title="RTDE Items"
              description="Items and par levels"
              route="/admin/rtde-items"
              moduleId="02"
              icon={<Package className="size-5 text-amber-400" />}
            />

            <AdminModuleCard
              title="Milk Pars"
              description="Milk par levels"
              route="/admin/milk-pars"
              moduleId="03"
              icon={<Milk className="size-5 text-amber-400" />}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
