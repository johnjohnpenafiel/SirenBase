/**
 * User Management Page
 *
 * Admin-only page for managing user accounts.
 *
 * Follows Design/layout.md guidelines:
 * - App-like scrolling (h-dvh layout with overflow-y-auto)
 * - Frosted island header pattern with back button and actions
 * - Dynamic scroll shadow
 * - Rounded-2xl cards and table container
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/shared/Header';
import { BackButton } from '@/components/shared/BackButton';
import { Button } from '@/components/ui/button';
import { AddUserDialog } from '@/components/admin/AddUserDialog';
import { DeleteUserDialog } from '@/components/admin/DeleteUserDialog';
import apiClient from '@/lib/api';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import { toast } from 'sonner';
import { Plus, UserCheck, Shield, Loader2, Users, Ellipsis, Trash2 } from 'lucide-react';

// Mobile user card with contextual action overlay
function UserCard({ user, onDelete }: { user: User; onDelete: (user: User) => void }) {
  const [isActionMode, setIsActionMode] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActionMode) return;
    function handleMouseDown(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsActionMode(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isActionMode]);

  const handleAction = useCallback((actionFn: () => void) => {
    setIsActionMode(false);
    actionFn();
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative p-4 bg-card border border-neutral-300/80 rounded-2xl"
    >
      <div
        className={cn(
          "transition-all duration-200",
          isActionMode ? "opacity-30 blur-[2px] pointer-events-none" : "opacity-100 blur-0"
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm font-mono text-muted-foreground mb-1">{user.partner_number}</p>
            {user.role === 'admin' ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                <UserCheck className="h-3 w-3 mr-1" />
                Staff
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="ml-4 flex-shrink-0"
            onClick={() => setIsActionMode(true)}
            aria-label="User actions"
          >
            <Ellipsis className="size-4" />
          </Button>
        </div>
      </div>

      {isActionMode && (
        <div className={cn(
          "absolute inset-0 rounded-2xl",
          "flex items-center justify-center gap-3",
          "animate-fade-in"
        )}>
          <Button
            variant="outline"
            size="default"
            className="min-w-[120px]"
            onClick={() => handleAction(() => onDelete(user))}
          >
            <Trash2 className="size-4" />
            <span className="ml-2">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 16);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response.users);
    } catch (error: any) {
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

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex flex-col h-dvh">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="h-dvh overflow-y-auto" onScroll={handleScroll}>
        <Header />
          {/* Sticky Frosted Island */}
          <div className="sticky top-[68px] z-10 px-4 md:px-8 pt-2 pb-4 md:pt-3 md:pb-6">
            <div
              className={cn(
                "max-w-6xl mx-auto rounded-2xl",
                isScrolled ? "bg-white/70 backdrop-blur-md" : "bg-white/95 backdrop-blur-md",
                
                "px-5 py-4 md:px-6 md:py-5",
                "transition-all duration-300 ease-out",
                isScrolled && "shadow-[0_4px_8px_-4px_rgba(0,0,0,0.08)]"
              )}
            >
              {/* Top row: Back + Action */}
              <div className="flex items-center justify-between mb-4">
                <BackButton
                  href="/admin"
                  label="Admin Panel"
                />
                <Button
                  size="icon"
                  className="md:w-auto md:px-4"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Add User</span>
                </Button>
              </div>
              <h1 className="text-xl md:text-3xl font-normal tracking-tight text-black">
                User Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage partner accounts and access
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-8">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first user to get started.
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-card rounded-2xl border border-neutral-300/80 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-gray-300">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Partner #
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-5 py-3.5 text-sm font-mono font-semibold text-foreground">
                            {user.partner_number}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-foreground">{user.name}</td>
                          <td className="px-5 py-3.5 text-sm">
                            {user.role === 'admin' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Staff
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-sm">
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
                <div className="md:hidden space-y-3">
                  {users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onDelete={setUserToDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

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
