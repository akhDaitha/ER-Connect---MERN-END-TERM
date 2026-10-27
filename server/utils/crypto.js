const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for AES-GCM

function getKey() {
  if (!env.CHAT_KEY) {
    throw new Error('CHAT_KEY is not defined in environment variables');
  }
  const keyBuffer = Buffer.from(env.CHAT_KEY, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('CHAT_KEY must be a 32-byte hexadecimal string (64 characters)');
  }
  return keyBuffer;
}

/**
 * Encrypts plaintext string using AES-256-GCM.
 * @param {string} plaintext - Raw text to encrypt
 * @returns {{ iv: string, data: string, tag: string }} Hex-encoded components
 */
function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    data: encrypted,
    tag: tag.toString('hex')
  };
}

/**
 * Decrypts AES-256-GCM ciphertext using the stored iv, data, and auth tag.
 * @param {string} ivHex - Hex-encoded 12-byte IV
 * @param {string} dataHex - Hex-encoded ciphertext
 * @param {string} tagHex - Hex-encoded 16-byte authentication tag
 * @returns {string} Decrypted plaintext string
 */
function decrypt(ivHex, dataHex, tagHex) {
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(dataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};
