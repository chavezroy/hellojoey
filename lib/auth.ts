import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Read admin password from environment variables (plain text for simplicity)
// This ensures it's available in AWS Amplify and other deployment environments
export function getAdminPassword(): string {
  // Try multiple ways to get the password for AWS Amplify compatibility
  let password = process.env.ADMIN_PASSWORD || '';
  
  // Fallback: Try reading from AWS Systems Manager if available
  // This is a workaround for AWS Amplify environment variable issues
  if (!password && process.env.AWS_REGION) {
    // For now, we'll use a hardcoded fallback for testing
    // In production, you could use AWS Parameter Store here
    console.warn('ADMIN_PASSWORD not in process.env, checking alternatives...');
  }
  
  // Debug: Log all environment variables that contain "ADMIN" or "PASSWORD"
  const relevantEnvVars = Object.keys(process.env)
    .filter(key => 
      key.toUpperCase().includes('ADMIN') || 
      key.toUpperCase().includes('PASSWORD')
    )
    .reduce((acc, key) => {
      acc[key] = {
        exists: true,
        length: process.env[key]?.length || 0,
      };
      return acc;
    }, {} as Record<string, { exists: boolean; length: number }>);
  
  console.log('Environment variables check:', {
    allRelevantVars: relevantEnvVars,
    hasAdminPassword: 'ADMIN_PASSWORD' in process.env,
    nodeEnv: process.env.NODE_ENV,
    awsRegion: process.env.AWS_REGION,
  });
  
  console.log('Admin password check:', {
    exists: !!password,
    length: password.length,
    nodeEnv: process.env.NODE_ENV,
    directAccess: process.env.ADMIN_PASSWORD ? 'EXISTS' : 'MISSING',
  });
  
  if (!password) {
    console.warn('ADMIN_PASSWORD is not set in environment variables');
    console.warn('Sample process.env keys:', Object.keys(process.env).sort().slice(0, 20));
  }
  
  return password;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-change-in-production';
const SESSION_COOKIE_NAME = 'admin_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Simple plain text password comparison
export function verifyPlainPassword(inputPassword: string, correctPassword: string): boolean {
  return inputPassword === correctPassword;
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

