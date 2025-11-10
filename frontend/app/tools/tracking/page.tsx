/**
 * Inventory Tracking Tool - Landing Page
 *
 * Auto-redirects to the main inventory page.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TrackingToolPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the inventory page
    router.push('/tools/tracking/inventory');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading inventory...</p>
      </div>
    </div>
  );
}
