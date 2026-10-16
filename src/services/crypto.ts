/**
 * In-browser Cryptographic Utility for IncidentKit
 * Uses the standard Web Crypto API (crypto.subtle) available in modern browsers.
 * All operations run 100% locally on the user's CPU. Zero bytes are uploaded to any server.
 */

/**
 * Converts an ArrayBuffer to a lowercase hexadecimal string.
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calculates the SHA-256 hash of an arbitrary UTF-8 string.
 */
export async function calculateStringSha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Calculates the SHA-256 hash of a local browser File object.
 * Reads the file completely in memory using FileReader or ArrayBuffer.
 */
export async function calculateFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return bufferToHex(hashBuffer);
}

/**
 * Validates whether a given string is a valid 64-character lowercase or uppercase hexadecimal SHA-256 hash.
 */
export function isValidSha256(hash: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(hash.trim());
}

/**
 * Formats a SHA-256 hash for human readability with optional truncation.
 */
export function formatHashDisplay(hash: string, truncate = false): string {
  if (!hash) return 'N/A';
  if (!truncate || hash.length <= 16) return hash.toLowerCase();
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`.toLowerCase();
}
