/**
 * Root Page - Redirects to Dashboard
 *
 * The root path (/) redirects users to the dashboard where they can
 * select from available tools.
 */
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
