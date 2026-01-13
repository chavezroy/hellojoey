import { NextRequest, NextResponse } from 'next/server';
import { verifyPlainPassword, setSession, createSession, getAdminPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    // Debug logging
    console.log('=== AUTH ROUTE DEBUG ===');
    console.log('Environment check:', {
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      adminPasswordLength: process.env.ADMIN_PASSWORD?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });

    // Read plain text password from environment variables
    const ADMIN_PASSWORD = getAdminPassword();

    console.log('After getAdminPassword():', {
      passwordExists: !!ADMIN_PASSWORD,
      passwordLength: ADMIN_PASSWORD.length,
      isEmpty: ADMIN_PASSWORD === '',
    });

    // If no password is set, return error
    if (!ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD is not set in environment variables');
      console.error('Available ADMIN env vars:', Object.keys(process.env)
        .filter(key => key.toUpperCase().includes('ADMIN'))
        .sort());
      return NextResponse.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // Verify password (plain text comparison)
    const isValid = verifyPlainPassword(password, ADMIN_PASSWORD);
    
    console.log('Password verification:', {
      isValid,
      inputLength: password.length,
      expectedLength: ADMIN_PASSWORD.length,
    });
    
    if (!isValid) {
      console.error('Password verification failed');
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

