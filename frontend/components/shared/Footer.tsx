/**
 * Footer Component
 *
 * Global footer shared across all pages.
 * Follows DESIGN.md guidelines:
 * - Uses Nature theme color tokens
 * - Minimal and clean design
 * - Responsive layout (stacked mobile, inline desktop)
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SirenBase. All rights reserved.</p>

          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="Help documentation"
            >
              Help
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="Privacy policy"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="Terms of service"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
