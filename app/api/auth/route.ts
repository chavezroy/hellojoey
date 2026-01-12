import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setSession, createSession, getAdminPasswordHash } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    // Read hash at runtime to ensure it's available in AWS Amplify
    const ADMIN_PASSWORD_HASH = getAdminPasswordHash();

    // If no hash is set, use the password directly (for initial setup)
    // In production, you should set ADMIN_PASSWORD_HASH in environment variables
    if (!ADMIN_PASSWORD_HASH) {
      // For development: allow any password if hash not set
      // In production, this should be an error
      if (process.env.NODE_ENV === 'production') {
        console.error('ADMIN_PASSWORD_HASH is not set in environment variables');
        console.error('Raw env var check:', {
          ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH ? 'EXISTS' : 'MISSING',
          length: process.env.ADMIN_PASSWORD_HASH?.length || 0,
          firstChars: process.env.ADMIN_PASSWORD_HASH?.substring(0, 20) || 'N/A',
        });
        return NextResponse.json(
          { error: 'Admin password not configured' },
          { status: 500 }
        );
      }
      const sessionToken = createSession();
      await setSession(sessionToken);
      return NextResponse.json({ success: true });
    }

    // Enhanced debug logging
    console.log('Password verification attempt:', {
      hashExists: !!ADMIN_PASSWORD_HASH,
      hashLength: ADMIN_PASSWORD_HASH.length,
      hashPrefix: ADMIN_PASSWORD_HASH.substring(0, 10),
      hashSuffix: ADMIN_PASSWORD_HASH.substring(ADMIN_PASSWORD_HASH.length - 5),
      passwordLength: password.length,
      nodeEnv: process.env.NODE_ENV,
      envVarExists: !!process.env.ADMIN_PASSWORD_HASH,
      envVarLength: process.env.ADMIN_PASSWORD_HASH?.length || 0,
    });

    // Verify password
    const isValid = await verifyPassword(password, ADMIN_PASSWORD_HASH);
    
    if (!isValid) {
      console.error('Password verification failed:', {
        hashLength: ADMIN_PASSWORD_HASH.length,
        hashPrefix: ADMIN_PASSWORD_HASH.substring(0, 10),
        hashSuffix: ADMIN_PASSWORD_HASH.substring(ADMIN_PASSWORD_HASH.length - 5),
        passwordLength: password.length,
        passwordPrefix: password.substring(0, 3) + '***',
      });
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    console.log('Password verification successful');
    const sessionToken = createSession();
    await setSession(sessionToken);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Auth error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

