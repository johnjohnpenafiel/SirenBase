/**
 * Admin Panel Page
 *
 * Modular admin dashboard with cards for different management modules.
 * Only accessible to users with admin role.
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern
 * - Amber-500 admin accent color
 * - Dynamic scroll shadow
 */
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { AdminModuleCard } from '@/components/admin/AdminModuleCard';
import { Users, Package, Milk } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island */}
          <div className="sticky top-16 z-10 px-4 md:px-8 pt-2 pb-2 md:pt-3 md:pb-3">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                "bg-white/70 backdrop-blur-md",
                
                "px-5 py-5 md:px-6 md:py-6",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              <h1 className="text-3xl font-semibold tracking-tight text-black">
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage system settings and configurations
              </p>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <AdminModuleCard
                title="User Management"
                description="Add, edit, and remove user accounts"
                route="/admin/users"
                icon={
                  <div className="w-14 h-14 rounded-full bg-neutral-500/15 flex items-center justify-center">
                    <Users className="w-7 h-7 text-neutral-600" />
                  </div>
                }
              />

              <AdminModuleCard
                title="RTDE Items/Pars"
                description="Manage RTD&E items and par levels"
                route="/admin/rtde-items"
                icon={
                  <div className="w-14 h-14 rounded-full bg-neutral-500/15 flex items-center justify-center">
                    <Package className="w-7 h-7 text-neutral-600" />
                  </div>
                }
              />

              <AdminModuleCard
                title="Milk Count Pars"
                description="Configure milk par levels"
                route="/admin/milk-pars"
                icon={
                  <div className="w-14 h-14 rounded-full bg-neutral-500/15 flex items-center justify-center">
                    <Milk className="w-7 h-7 text-neutral-600" />
                  </div>
                }
              />
            </div>
          </div>
      </div>
    </ProtectedRoute>
  );
}
