import bcrypt from 'bcrypt';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

/**
 * Hash a password using bcrypt
 * Use this when setting up a new admin password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Verify admin password (supports both plain text and hashed formats)
 * Falls back to plain text comparison for backward compatibility
 */
export async function verifyAdminPassword(
  passwordInput: string
): Promise<boolean> {
  // If ADMIN_PASSWORD starts with $ it's a bcrypt hash
  if (ADMIN_PASSWORD.startsWith('$2')) {
    return verifyPassword(passwordInput, ADMIN_PASSWORD);
  }

  // Fallback to plain text comparison (for existing setups)
  return passwordInput === ADMIN_PASSWORD;
}

/**
 * Generate a hash for a new admin password
 * Call this once to get the hash, then set it as ADMIN_PASSWORD in .env
 */
export async function generateAdminPasswordHash(
  password: string
): Promise<string> {
  return hashPassword(password);
}
