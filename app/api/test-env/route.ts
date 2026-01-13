import { NextResponse } from 'next/server';

// Test endpoint to verify environment variables are accessible
export async function GET() {
  const adminHash = process.env.ADMIN_PASSWORD_HASH || '';
  
  return NextResponse.json({
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    adminPasswordHashLength: adminHash.length,
    adminPasswordHashPrefix: adminHash.substring(0, 20),
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env)
      .filter(key => key.toUpperCase().includes('ADMIN'))
      .sort(),
    // Don't expose the actual hash value for security
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

