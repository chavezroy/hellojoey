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

    // Read admin password (hardcoded)
    const ADMIN_PASSWORD = getAdminPassword();

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

