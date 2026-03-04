import CryptoJS from 'crypto-js';

const MASTER_KEY = process.env.NEXT_PUBLIC_MASTER_ENCRYPTION_KEY || 'default-secret-key-32-chars-long-!!!';

/**
 * Encrypts a string using AES-256 with the master key.
 */
export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, MASTER_KEY).toString();
};

/**
 * Decrypts a string using AES-256 with the master key.
 */
export const decrypt = (ciphertext: string): string => {
  if (!ciphertext || typeof ciphertext !== 'string') return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, MASTER_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return ciphertext; // Fallback to original text if decryption returns nothing (e.g. not encrypted)
    return decrypted;
  } catch (error) {
    console.warn('Decryption failed, returning plain text:', error);
    return ciphertext; // Fallback to original text
  }
};

/**
 * Simulates generating a key pair for a user.
 * In a real E2E system, this would be RSA or Elliptic Curve.
 * For this local clone, we'll store a "user secret" that we use to derive a key.
 */
export const generateUserKeys = () => {
  const privateKey = CryptoJS.lib.WordArray.random(32).toString();
  const publicKey = CryptoJS.SHA256(privateKey).toString();
  return { publicKey, privateKey };
};
