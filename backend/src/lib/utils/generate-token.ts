import crypto from 'crypto';

/**
 * Generates a secure random token for use in authentication sessions
 * @param length The length of the token to generate (default: 32)
 * @returns A secure random token string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
