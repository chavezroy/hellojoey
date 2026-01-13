import { NextResponse } from 'next/server';

// Test endpoint to verify environment variables are accessible
export async function GET() {
  const adminHash = process.env.ADMIN_PASSWORD_HASH || '';
  
  // Test decoding
  let decodedHash = '';
  let decodeError = null;
  if (adminHash && !adminHash.startsWith('$')) {
    try {
      decodedHash = Buffer.from(adminHash, 'base64').toString('utf8');
    } catch (e: any) {
      decodeError = e.message;
    }
  } else {
    decodedHash = adminHash;
  }
  
  return NextResponse.json({
    hasAdminPasswordHash: !!process.env.ADMIN_PASSWORD_HASH,
    adminPasswordHashLength: adminHash.length,
    adminPasswordHashPrefix: adminHash.substring(0, 20),
    adminPasswordHashSuffix: adminHash.substring(Math.max(0, adminHash.length - 20)),
    startsWithDollar: adminHash.startsWith('$'),
    decodedHashLength: decodedHash.length,
    decodedHashPrefix: decodedHash.substring(0, 10),
    decodedHashStartsWithDollar: decodedHash.startsWith('$'),
    decodeError: decodeError,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env)
      .filter(key => key.toUpperCase().includes('ADMIN'))
      .sort(),
    // Don't expose the full hash value for security
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

