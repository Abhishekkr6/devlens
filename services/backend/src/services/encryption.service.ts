import crypto from 'crypto';
import logger from '../utils/logger';

// AES-256-CBC configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_key_must_be_32_bytes_long!';
const IV_LENGTH = 16;

if (process.env.NODE_ENV === 'production' && (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 32)) {
    logger.error('CRITICAL: ENCRYPTION_KEY is missing or invalid in production!');
    process.exit(1);
}

/**
 * Encrypt a string using AES-256-CBC
 * @param text - The plaintext to encrypt
 * @returns The encrypted string in format: iv:encryptedData
 */
export const encrypt = (text: string): string => {
    if (!text) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        // Support both 64-char Hex string (recommended) and 32-char raw string
        const key = ENCRYPTION_KEY.length === 64
            ? Buffer.from(ENCRYPTION_KEY, 'hex')
            : Buffer.from(ENCRYPTION_KEY);

        // Ensure key is 32 bytes
        if (key.length !== 32) {
            throw new Error(`Encryption key must be 32 bytes. Received ${key.length} bytes (Check if env var is set correctly)`);
        }

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
        logger.error({ error }, 'Encryption failed');
        throw new Error('Encryption failed');
    }
};

/**
 * Decrypt a string using AES-256-CBC
 * @param text - The encrypted string in format: iv:encryptedData
 * @returns The decrypted plaintext
 */
export const decrypt = (text: string): string => {
    if (!text) return text;

    // If text doesn't look like iv:encrypted (e.g. old plain text tokens), return as is or handle migration
    if (!text.includes(':')) {
        logger.warn('Attempted to decrypt non-encrypted text. Returning original.');
        return text;
    }

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift() as string, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const key = ENCRYPTION_KEY.length === 64
            ? Buffer.from(ENCRYPTION_KEY, 'hex')
            : Buffer.from(ENCRYPTION_KEY);

        if (key.length !== 32) {
            throw new Error('Encryption key must be 32 bytes');
        }

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    } catch (error) {
        logger.error({ error }, 'Decryption failed');
        // In production, we might not want to return null/empty, but throw to prevent bad data usage
        throw new Error('Decryption failed');
    }
};
