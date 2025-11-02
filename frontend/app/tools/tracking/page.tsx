/**
 * Inventory Tracking Tool - Landing Page
 *
 * Auto-redirects to the main inventory page.
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    </div>
  );
}
