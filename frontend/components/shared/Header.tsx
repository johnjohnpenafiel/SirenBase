/**
 * Header Component
 *
 * Global navigation header shared across all pages.
 * Shows user info and navigation links.
 */
'use client';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">SirenBase</h1>
        </div>

        <nav className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </a>
          {/* Authentication and user menu will be added here */}
        </nav>
      </div>
    </header>
  );
}
