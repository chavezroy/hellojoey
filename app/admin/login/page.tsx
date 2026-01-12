'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page min-h-screen flex items-center justify-center bg-black py-8 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-[rgba(37,0,115,0.3)] backdrop-blur-[7px] p-8 sm:p-10 rounded-lg border-2 border-neon-green shadow-lg shadow-neon-green/20"
        >
          <h1 className="text-neon-green text-3xl sm:text-4xl mb-8 font-upheaval uppercase text-center font-bold">
            Admin Login
          </h1>
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500/50 text-red-300 rounded">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="mb-6">
            <label className="block mb-2 text-sm uppercase font-medium text-neon-green">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green font-upheaval uppercase transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-neon-green text-black font-upheaval uppercase text-lg font-bold hover:bg-[#00cc00] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-green/50 hover:shadow-neon-green/70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

