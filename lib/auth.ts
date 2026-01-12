import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Read environment variables at runtime instead of module load time
// This ensures they're available in AWS Amplify and other deployment environments
export function getAdminPasswordHash(): string {
  const rawHash = process.env.ADMIN_PASSWORD_HASH || '';
  
  // Enhanced debug logging BEFORE processing
  console.log('ADMIN_PASSWORD_HASH raw from env:', {
    exists: !!rawHash,
    length: rawHash.length,
    prefix: rawHash.substring(0, 20),
    suffix: rawHash.substring(Math.max(0, rawHash.length - 10)),
    startsWithDollar: rawHash.startsWith('$'),
    nodeEnv: process.env.NODE_ENV,
  });
  
  if (!rawHash) {
    console.error('ADMIN_PASSWORD_HASH is not set in environment variables');
    return '';
  }
  
  let hash = rawHash;
  
  // If hash appears to be base64 encoded (no $ at start), decode it
  // This is a workaround for Next.js variable expansion issues with $ characters
  if (hash && !hash.startsWith('$')) {
    try {
      const decoded = Buffer.from(hash, 'base64').toString('utf8');
      console.log('Base64 decode successful:', {
        originalLength: hash.length,
        decodedLength: decoded.length,
        decodedPrefix: decoded.substring(0, 10),
        decodedStartsWithDollar: decoded.startsWith('$'),
      });
      hash = decoded;
    } catch (e) {
      // If decoding fails, use the value as-is
      console.error('Failed to decode base64 hash:', e);
      console.warn('Using hash as-is (may not be valid bcrypt hash)');
    }
  }
  
  // Debug logging AFTER processing
  if (!hash) {
    console.error('ADMIN_PASSWORD_HASH is empty after processing');
  } else {
    console.log('ADMIN_PASSWORD_HASH final:', {
      exists: true,
      length: hash.length,
      prefix: hash.substring(0, 10),
      endsWith: hash.substring(hash.length - 5),
      startsWithDollar: hash.startsWith('$'),
      isValidFormat: hash.startsWith('$2a$') || hash.startsWith('$2b$'),
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

