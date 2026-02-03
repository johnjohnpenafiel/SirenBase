/**
 * Header Component
 *
 * Split navbar design with transparent gap between elements.
 * Left: Logo pill | Right: Icon circles (Home + Profile)
 * Scrolling content is visible through the gap between elements.
 *
 * - Sticky positioning with backdrop blur for app-like feel
 * - Uses design system color tokens
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Home } from "lucide-react";

const frostedGlass =
  "bg-white/70 backdrop-blur-md border-2 border-neutral-400/50 shadow-[0_1px_3px_-2px_rgba(0,0,0,0.06)]";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as Element;
      if (target?.classList?.contains("overflow-y-auto")) {
        setIsScrolled(target.scrollTop > 16);
      }
    };
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => document.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full px-4 md:px-8 pt-3">
      <div className={cn(
        "max-w-6xl mx-auto h-14 flex justify-between items-center rounded-full backdrop-blur-md px-2",
        "transition-all duration-300 ease-out",
        isScrolled ? "bg-white/70" : "bg-white/95"
      )}>
        {/* Left: Logo pill */}
        <div
          className={`h-11 px-5 flex items-center`}
        >
          <h1 className="text-xl font-medium text-foreground">sirenbase</h1>
        </div>

        {/* Right: Navigation circles */}
        <nav className="flex items-center gap-2 pr-3 md:pr-4">
          {isAuthenticated ? (
            <>
              {/* Dashboard Link */}
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="rounded-full" aria-label="Dashboard">
                  <Home strokeWidth={1.5} className="size-5" />
                </Button>
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="rounded-full" aria-label="User menu">
                    <Settings strokeWidth={1.5} className="size-5" />
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
              <button
                className={`h-11 px-5 rounded-full flex items-center justify-center text-sm font-medium transition-colors hover:bg-white/90 ${frostedGlass}`}
              >
                Login
              </button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
