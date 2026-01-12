const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-password.js <password>');
  console.error('\nExample: node generate-password.js "MySecurePassword123"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n=== PASSWORD HASH GENERATED ===');
  console.log('\nFor AWS Environment Variables:');
  console.log('Variable: ADMIN_PASSWORD_HASH');
  console.log(`Value: ${hash}`);
  console.log('\nIMPORTANT:');
  console.log('- Copy the ENTIRE hash value (starts with $2a$10$)');
  console.log('- Do NOT add any spaces before or after');
  console.log('- Make sure the hash is on a single line');
  console.log('- The hash should be exactly 60 characters long');
  console.log(`\nHash length: ${hash.length} characters`);
  console.log(`\nFor .env.local file:`);
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

