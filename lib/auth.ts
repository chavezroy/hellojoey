import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Read environment variables at runtime instead of module load time
// This ensures they're available in AWS Amplify and other deployment environments
export function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH || '';
  // Debug logging to help diagnose issues
  if (!hash) {
    console.warn('ADMIN_PASSWORD_HASH is not set in environment variables');
  } else {
    console.log('ADMIN_PASSWORD_HASH loaded:', {
      exists: true,
      length: hash.length,
      prefix: hash.substring(0, 10),
      endsWith: hash.substring(hash.length - 5),
    });
  }
  return hash;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production';
const SESSION_COOKIE_NAME = 'admin_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSession(): string {
  // Simple session token (in production, use JWT or proper session management)
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
}

export async function setSession(sessionToken: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error('Error setting session:', error);
    throw error;
  }
}

export async function getSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

export { SESSION_SECRET };

