import { NextResponse } from 'next/server';

// Test endpoint to verify environment variables are accessible
export async function GET() {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
  
  return NextResponse.json({
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: adminPassword.length,
    adminPasswordExists: adminPassword !== '',
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    adminPasswordHashLength: adminPasswordHash.length,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env)
      .filter(key => key.toUpperCase().includes('ADMIN'))
      .sort(),
    // Don't expose the actual password value for security
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

