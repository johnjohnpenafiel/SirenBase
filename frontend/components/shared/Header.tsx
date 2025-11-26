/**
 * Header Component
 *
 * Global navigation header shared across all pages.
 * Follows DESIGN.md adaptive interface guidelines:
 * - Desktop: Dashboard button + User icon with name → dropdown with Logout
 * - Mobile: Dashboard icon + User icon only → dropdown with Logout
 * - Sticky positioning with backdrop blur for app-like feel
 * - Uses Nature theme color tokens
 */
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Home } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">SirenBase</h1>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Dashboard Link - Always visible */}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home
                    strokeWidth={1.5}
                    className="size-6 mt-2 md:mt-0 md:size-5 md:mr-2 text-popover-foreground"
                  />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>

              {/* User Dropdown - Adaptive (icon+name on desktop, icon only on mobile) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    aria-label="User menu"
                  >
                    <User
                      strokeWidth={1.5}
                      className="size-6 md:size-5 md:mr-2 text-popover-foreground"
                    />
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
