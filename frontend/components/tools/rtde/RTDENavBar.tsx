/**
 * RTD&E Navigation Bar Component
 *
 * Apple-inspired adaptive navigation for RTD&E counting sessions:
 * - Mobile (< md): Fixed bottom bar with glassmorphism blur effect
 * - Desktop (>= md): Left sidebar with subtle gradient background
 *
 * Features:
 * - Smooth transitions and hover effects
 * - Active state with shadow and scale
 * - Icon-only on mobile with refined typography
 * - Backdrop blur for premium feel on mobile
 *
 * Navigation items:
 * - Count: Return to counting interface
 * - Pull List: View items needed (includes Complete Session button)
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ClipboardList, Hash } from 'lucide-react';

interface RTDENavBarProps {
  sessionId: string;
  className?: string;
}

export function RTDENavBar({ sessionId, className }: RTDENavBarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Count',
      href: `/tools/rtde/count/${sessionId}`,
      icon: Hash,
      description: 'Count items',
    },
    {
      label: 'Pull List',
      href: `/tools/rtde/pull-list/${sessionId}`,
      icon: ClipboardList,
      description: 'View items needed',
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile, refined with gradient */}
      <nav
        className={cn(
          'hidden md:flex md:flex-col md:w-56 lg:w-64',
          'border-r border-border/30',
          'bg-gradient-to-b from-card to-muted/10',
          className
        )}
        aria-label="RTD&E session navigation"
      >
        <div className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5',
                  'rounded-xl text-sm font-semibold',
                  'transition-all duration-200 ease-out',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Apple-style glassmorphism */}
      <nav
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-40',
          'border-t border-border/30',
          'bg-background/80 backdrop-blur-xl',
          'shadow-[0_-4px_12px_rgba(0,0,0,0.08)]',
          'safe-area-inset-bottom',
          className
        )}
        aria-label="RTD&E session navigation"
      >
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1',
                  'min-w-[80px] px-4 py-2.5',
                  'rounded-xl',
                  'text-xs font-semibold',
                  'transition-all duration-200',
                  active
                    ? 'text-primary scale-105'
                    : 'text-muted-foreground active:scale-95'
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={item.description}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-transform duration-200',
                    active && 'scale-110'
                  )}
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'text-[0.6875rem] uppercase tracking-wide',
                    active && 'font-bold'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Spacer - Prevents content from hiding behind bottom nav */}
      <div className="md:hidden h-20" aria-hidden="true" />
    </>
  );
}
