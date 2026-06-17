#!/usr/bin/env node

/**
 * Generate a bcrypt hash for admin password
 * Usage: node scripts/hash-password.js
 * 
 * This script prompts for a password and outputs its bcrypt hash
 * which can be used in the ADMIN_PASSWORD environment variable
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter password to hash: ', async (password) => {
  try {
    const hash = await bcrypt.hash(password, 12);
    console.log('\n✅ Bcrypt Hash Generated:\n');
    console.log(hash);
    console.log('\n📋 Update your .env.local file:');
    console.log(`ADMIN_PASSWORD=${hash}\n`);
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
  rl.close();
});
