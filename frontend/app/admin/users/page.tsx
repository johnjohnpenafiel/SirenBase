/**
 * User Management Page
 *
 * Admin-only page for managing user accounts.
 * Moved from main admin panel to enable modular admin dashboard.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import { AddUserDialog } from '@/components/admin/AddUserDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import apiClient from '@/lib/api';
import type { User } from '@/types';
import { toast } from 'sonner';
import { Plus, UserCheck, Shield, Loader2, ArrowLeft } from 'lucide-react';

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response.users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load users';
      toast.error(`Failed to load users: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
    setAddDialogOpen(false);
  };

  const handleUserDeleted = () => {
    fetchUsers();
    setUserToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed Header Section */}
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
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add User</span>
                </Button>
              </div>
              <p className="text-muted-foreground">Manage user accounts and access</p>
            </div>
          </div>

          {/* Scrollable Content Area - ONLY this scrolls */}
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl mx-auto px-4 md:px-8 py-6">
              {/* Users Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Partner #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-foreground">
                          {user.partner_number}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{user.name}</td>
                        <td className="px-4 py-3 text-sm">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Staff
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUserToDelete(user)}
                            className="hover:border-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border">
                {users.map((user) => (
                  <div key={user.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-sm font-mono text-muted-foreground">{user.partner_number}</p>
                      </div>
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Staff
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                        className="hover:border-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <p className="text-sm text-primary font-medium">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{users.length}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Admins</p>
                <p className="text-3xl font-bold text-foreground">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
            </div>
          </div>
        </main>

        {/* Dialogs */}
        <AddUserDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onUserAdded={handleUserAdded}
        />

        {userToDelete && (
          <DeleteUserDialog
            user={userToDelete}
            open={!!userToDelete}
            onOpenChange={(open) => !open && setUserToDelete(null)}
            onUserDeleted={handleUserDeleted}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
