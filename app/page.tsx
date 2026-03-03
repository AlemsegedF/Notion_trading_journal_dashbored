import { redirect } from 'next/navigation';

/**
 * Root Page
 * Redirects to the dashboard
 */
export default function Home() {
  redirect('/dashboard');
}
