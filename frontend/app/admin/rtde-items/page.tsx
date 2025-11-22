/**
 * RTD&E Items & Pars Management Page
 *
 * Placeholder page for Phase 6B.
 * Will be replaced with full item management interface (add/edit/delete/reorder).
 */
'use client';

import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';

export default function RTDEItemsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div>
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
                RTD&E Items & Pars
              </h1>
              <p className="text-muted-foreground">
                Manage RTD&E display items and par levels
              </p>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-6">
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Coming in Phase 6B
                </h2>
                <p className="text-muted-foreground mb-6">
                  This page will include full RTD&E item management with:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Add/edit/delete RTD&E items
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Set par levels for each item
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Drag-and-drop reordering to match display layout
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">•</span>
                    Enable/disable seasonal items
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Placeholder page created during Phase 6A (Admin Dashboard Restructure)
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
