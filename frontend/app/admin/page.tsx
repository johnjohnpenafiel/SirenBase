/**
 * Admin Panel Page
 *
 * Modular admin dashboard with cards for different management modules.
 * Only accessible to users with admin role.
 */
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { AdminModuleCard } from '@/components/admin/AdminModuleCard';
import { Users, Package, Milk } from 'lucide-react';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div>
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Manage system settings and configurations</p>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Management Module */}
                <AdminModuleCard
                  title="User Management"
                  description="Add, edit, and remove user accounts"
                  route="/admin/users"
                  icon={<Users className="h-8 w-8" />}
                />

                {/* RTD&E Items & Pars Module */}
                <AdminModuleCard
                  title="RTD&E Items & Pars"
                  description="Manage RTD&E items and par levels"
                  route="/admin/rtde-items"
                  icon={<Package className="h-8 w-8" />}
                />

                {/* Milk Count Pars Module */}
                <AdminModuleCard
                  title="Milk Count Pars"
                  description="Configure milk par levels"
                  route="/admin/milk-pars"
                  icon={<Milk className="h-8 w-8" />}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
