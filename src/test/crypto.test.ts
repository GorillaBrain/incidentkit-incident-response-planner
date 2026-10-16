import { describe, it, expect } from 'vitest'
import {
  calculateStringSha256,
  isValidSha256,
  formatHashDisplay,
} from '../services/crypto'

describe('Web Crypto SHA-256 Service', () => {
  it('hashes an empty string matching the canonical NIST SHA-256 test vector', async () => {
    const hash = await calculateStringSha256('');
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('hashes "test" matching the canonical SHA-256 hash', async () => {
    const hash = await calculateStringSha256('test');
    expect(hash).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });

  it('hashes "The quick brown fox jumps over the lazy dog" correctly', async () => {
    const hash = await calculateStringSha256('The quick brown fox jumps over the lazy dog');
    expect(hash).toBe('d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592');
  });

  it('validates 64-character hexadecimal SHA-256 strings', () => {
    expect(isValidSha256('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')).toBe(true);
    expect(isValidSha256('E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855')).toBe(true);
    expect(isValidSha256('not-a-hash')).toBe(false);
    expect(isValidSha256('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85')).toBe(false); // 63 chars
    expect(isValidSha256('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8555')).toBe(false); // 65 chars
    expect(isValidSha256('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')).toBe(false); // non-hex
  });

  it('formats hash display with optional truncation', () => {
    const full = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(formatHashDisplay(full, false)).toBe(full);
    expect(formatHashDisplay(full, true)).toBe('e3b0c442...7852b855');
    expect(formatHashDisplay('', true)).toBe('N/A');
  });
});
