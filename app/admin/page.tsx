import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      redirect('/admin/login');
    }

    return <AdminDashboard />;
  } catch (error: any) {
    console.error('Admin page error:', error);
    // Return error page instead of redirecting to avoid infinite loops
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 p-8">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Error Loading Admin</h1>
          <p className="text-sm mb-4">{error?.message || 'Unknown error'}</p>
          <a href="/admin/login" className="text-neon-green underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }
}

