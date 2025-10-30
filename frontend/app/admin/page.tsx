/**
 * Global Admin Panel
 *
 * Manage users and global settings across all tools.
 * Access restricted to admin role users only.
 */
export default function AdminPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">
          Manage users and system settings
        </p>

        <div className="space-y-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-sm text-muted-foreground">
              Add, remove, and manage authorized users
            </p>
          </div>

          <div className="p-6 border rounded-lg opacity-50">
            <h2 className="text-xl font-semibold mb-4">System Settings</h2>
            <p className="text-sm text-muted-foreground">
              Coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
