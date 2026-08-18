import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Helper to derive a 32-byte key from our configured secret
const getSecretKey = () => {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'supersecretkeyfortestingpurposesonly';
  return crypto.scryptSync(secret, 'salt', 32);
};

/**
 * Encrypts a text string.
 * @param {string} text
 * @returns {string|null} encrypted string formatted as iv:encryptedData
 */
export const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts an encrypted string formatted as iv:encryptedData.
 * @param {string} text
 * @returns {string|null} decrypted plain text
 */
export const decrypt = (text) => {
  if (!text) return null;
  try {
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
};
