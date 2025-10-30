/**
 * Inventory Tracking Tool - Landing Page
 *
 * Main page for the basement inventory tracking system.
 */
export default function TrackingToolPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Inventory Tracking</h1>
        <p className="text-muted-foreground mb-8">
          Track basement inventory with unique 4-digit codes
        </p>

        <div className="space-y-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• View and manage inventory items</li>
              <li>• Add new items with generated codes</li>
              <li>• Remove items from inventory</li>
              <li>• View action history</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Full interface coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
