const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-password.js <password>');
  console.error('\nExample: node generate-password.js "MySecurePassword123"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  const base64Hash = Buffer.from(hash).toString('base64');
  
  console.log('\n=== PASSWORD HASH GENERATED ===');
  console.log('\nFor AWS Environment Variables (use base64 version to avoid $ expansion issues):');
  console.log('Variable: ADMIN_PASSWORD_HASH');
  console.log(`Value (base64): ${base64Hash}`);
  console.log(`\nOr use raw hash (if your platform supports $ characters):`);
  console.log(`Value (raw): ${hash}`);
  console.log('\nIMPORTANT:');
  console.log('- Copy the ENTIRE hash value');
  console.log('- Do NOT add any spaces before or after');
  console.log('- Make sure the hash is on a single line');
  console.log('- The raw hash should be exactly 60 characters long');
  console.log(`\nRaw hash length: ${hash.length} characters`);
  console.log(`Base64 hash length: ${base64Hash.length} characters`);
  console.log(`\nFor .env.local file (recommended - base64 encoded):`);
  console.log(`ADMIN_PASSWORD_HASH=${base64Hash}`);
  console.log(`\nOr raw format (may have issues with Next.js $ expansion):`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  
  // Verify the hash can be used
  bcrypt.compare(password, hash).then((match) => {
    if (match) {
      console.log('✓ Hash verification: SUCCESS - This hash will work with your password\n');
    } else {
      console.log('✗ Hash verification: FAILED - Something went wrong\n');
    }
  });
});

