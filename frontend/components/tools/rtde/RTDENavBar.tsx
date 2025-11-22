/**
 * RTD&E Navigation Bar Component
 *
 * Adaptive navigation for RTD&E counting sessions:
 * - Mobile (< md): Fixed bottom navigation bar
 * - Desktop (>= md): Left sidebar navigation
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
      {/* Desktop Sidebar - Hidden on mobile */}
      <nav
        className={cn(
          'hidden md:flex md:flex-col md:w-48 lg:w-56 border-r bg-card',
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
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <nav
        className={cn(
          'md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur safe-area-inset-bottom',
          className
        )}
        aria-label="RTD&E session navigation"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 min-w-[72px] px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground active:bg-muted active:text-foreground'
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={item.description}
              >
                <Icon
                  className={cn(
                    'h-6 w-6',
                    active && 'text-primary'
                  )}
                  aria-hidden="true"
                />
                <span className="text-[11px]">{item.label}</span>
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
