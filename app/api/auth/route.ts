import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setSession, createSession, ADMIN_PASSWORD_HASH } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    // If no hash is set, use the password directly (for initial setup)
    // In production, you should set ADMIN_PASSWORD_HASH in environment variables
    if (!ADMIN_PASSWORD_HASH) {
      // For development: allow any password if hash not set
      // In production, this should be an error
      if (process.env.NODE_ENV === 'production') {
        console.error('ADMIN_PASSWORD_HASH is not set in environment variables');
        return NextResponse.json(
          { error: 'Admin password not configured' },
          { status: 500 }
        );
      }
      const sessionToken = createSession();
      await setSession(sessionToken);
      return NextResponse.json({ success: true });
    }

    // Debug logging (remove in production if needed)
    console.log('Password verification attempt:', {
      hashExists: !!ADMIN_PASSWORD_HASH,
      hashLength: ADMIN_PASSWORD_HASH.length,
      hashPrefix: ADMIN_PASSWORD_HASH.substring(0, 7), // First 7 chars should be $2a$10$
    });

    const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!isValid) {
      console.error('Password verification failed:', {
        hashLength: ADMIN_PASSWORD_HASH.length,
        hashPrefix: ADMIN_PASSWORD_HASH.substring(0, 7),
      });
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const sessionToken = createSession();
    await setSession(sessionToken);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

