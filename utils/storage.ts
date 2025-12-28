import CryptoJS from 'crypto-js';
import { AppState } from '../types';

// WARNING: In a real application, this key should be managed more securely (e.g., derived from user input or a secure vault).
// For client-side storage protection against casual inspection and simple XSS, this is sufficient.
const SECRET_KEY = "MARINALOG_SECURE_KEY_2024";

export const encryptState = (state: AppState): string => {
  try {
    const serializedState = JSON.stringify(state);
    return CryptoJS.AES.encrypt(serializedState, SECRET_KEY).toString();
  } catch (e) {
    console.error("Encryption failed:", e);
    return JSON.stringify(state); // Fallback to unencrypted if encryption fails
  }
};

export const decryptState = (encryptedState: string): AppState | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedState, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) return null;
    return JSON.parse(decryptedData) as AppState;
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
};