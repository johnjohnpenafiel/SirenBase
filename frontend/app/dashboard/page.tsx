/**
 * Dashboard - Tool Selection Grid
 *
 * Displays available tools for partners to access.
 * Shows admin panel card only for admin role users.
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">SirenBase Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Select a tool to get started
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tool cards will be implemented here */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Inventory Tracking</h2>
            <p className="text-sm text-muted-foreground">
              Track basement inventory with 4-digit codes
            </p>
          </div>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-xl font-semibold mb-2">Milk Count</h2>
            <p className="text-sm text-muted-foreground">
              Coming soon...
            </p>
          </div>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-xl font-semibold mb-2">RTD&E Count</h2>
            <p className="text-sm text-muted-foreground">
              Coming soon...
            </p>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">
              Manage users and settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
