/**
 * Milk Count Pars Management Page
 *
 * Placeholder page for Tool 2 (Milk Count System).
 * Will be implemented during Phase 5 development.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Milk } from 'lucide-react';

export default function MilkParsPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-dvh">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header Section */}
          <div
            className={cn(
              "relative z-10 transition-all duration-300 ease-out",
              isScrolled
                ? "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]"
                : "shadow-[0_0px_0px_0px_rgba(0,0,0,0)]"
            )}
          >
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
              </Button>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Milk Count Pars
              </h1>
              <p className="text-muted-foreground">
                Configure milk count par levels (Tool 2)
              </p>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            <div className="container max-w-6xl mx-auto px-4 md:px-8 pt-2 pb-6">
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Milk className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Coming in Phase 5
                </h2>
                <p className="text-muted-foreground mb-6">
                  This page will be implemented during Tool 2 (Milk Count System) development and will include:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Manage milk types and par levels
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Configure FOH/BOH target quantities
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Set automatic ordering thresholds
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Update seasonal milk offerings
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Placeholder page created during Phase 6A (Admin Dashboard Restructure)
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
