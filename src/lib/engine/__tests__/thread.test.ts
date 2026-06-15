import { describe, it, expect } from 'vitest';
import { decodeThreadIndex } from '../parsers/thread';

// Round-trip: build a Thread-Index with a known date and verify.
// 2024-01-15T09:00:00Z in FILETIME:
//   Unix ms = 1705309200000, FILETIME = Unix_ms * 10000 + 116444736000000000 = 133497828000000000
//   Top 5 bytes (big-endian): 0x01 0xDA 0x56 0xB9 0x5D
//   Header = [0x01, 0x01, 0xDA, 0x56, 0xB9, 0x5D] + 16 zero bytes = 22 bytes
function makeThreadIndex(year: number, month: number, day: number, h: number, m: number, replyDepth: number): string {
  const unixMs = Date.UTC(year, month - 1, day, h, m, 0);
  const ft = BigInt(unixMs) * 10000n + 116444736000000000n;
  // Take top 5 bytes
  const b0 = Number((ft >> 56n) & 0xffn);
  const b1 = Number((ft >> 48n) & 0xffn);
  const b2 = Number((ft >> 40n) & 0xffn);
  const b3 = Number((ft >> 32n) & 0xffn);
  const b4 = Number((ft >> 24n) & 0xffn);
  // 22-byte header: [0x01, b0, b1, b2, b3, b4, ...16 zero GUID bytes]
  const header = [0x01, b0, b1, b2, b3, b4, ...Array(16).fill(0)];
  // Each reply adds 5 zero bytes
  const replies = Array(replyDepth * 5).fill(0);
  const all = new Uint8Array([...header, ...replies]);
  return btoa(String.fromCharCode(...all));
}

describe('Thread-Index decoder', () => {
  it('decodes a known 2024-01-15T09:00:00Z with 0 replies', () => {
    const idx = makeThreadIndex(2024, 1, 15, 9, 0, 0);
    const result = decodeThreadIndex(idx);
    expect(result).not.toBeUndefined();
    expect(result!.replyDepth).toBe(0);
    expect(result!.rootTime.getUTCFullYear()).toBe(2024);
    expect(result!.rootTime.getUTCMonth()).toBe(0); // January = 0
    expect(result!.rootTime.getUTCDate()).toBe(15);
  });

  it('counts reply depth correctly', () => {
    const idx = makeThreadIndex(2024, 2, 20, 14, 32, 2);
    const result = decodeThreadIndex(idx);
    expect(result!.replyDepth).toBe(2);
    expect(result!.rootTime.getUTCFullYear()).toBe(2024);
  });

  it('decodes fixture1 synthetic index without crashing', () => {
    // Synthetic value — checks structure, not exact date
    const result = decodeThreadIndex('AQHaGPQ+YhxmlJQ7fEGKJi/S3xSwAw==');
    expect(result).not.toBeUndefined();
    expect(result!.replyDepth).toBe(0); // 22 bytes = 0 reply blocks
    expect(result!.rootTime).toBeInstanceOf(Date);
    expect(isNaN(result!.rootTime.getTime())).toBe(false);
  });

  it('decodes fixture2 synthetic index without crashing', () => {
    // Synthetic 22-byte value — 0 reply blocks regardless of Phase 1 assumption
    const result = decodeThreadIndex('AQHaKQz3mBpRlX5tiFH7YnT8wCe4Dw==');
    expect(result).not.toBeUndefined();
    expect(result!.replyDepth).toBe(0); // synthetic value only has header block
    expect(result!.rootTime).toBeInstanceOf(Date);
  });

  it('returns undefined for too-short input', () => {
    expect(decodeThreadIndex('AQAA')).toBeUndefined();
  });

  it('returns undefined for invalid base64', () => {
    expect(decodeThreadIndex('not-valid-!!!!')).toBeUndefined();
  });
});
