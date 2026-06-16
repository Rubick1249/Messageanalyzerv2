// Decodes Thread-Index per [MS-OXOMSG] §2.2.1.3.
// Structure: 22-byte header block (5-byte FILETIME + 16-byte GUID + 1 byte) + N×5-byte response blocks.

export interface ThreadIndexDecoded {
  rootTime: Date;
  replyDepth: number;
}

export function decodeThreadIndex(base64: string): ThreadIndexDecoded | undefined {
  try {
    if (base64.length > 2048) return undefined; // guard against oversized user input before atob
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    if (bytes.length < 22) return undefined;

    // Byte 0 is a reserved version byte (always 0x01, per MS-OXOMSG §2.2.1.3).
    // Bytes 1–5: 5 most-significant bytes of a 64-bit FILETIME (100-ns intervals since 1601-01-01).
    // Bytes 6–21: GUID. Each subsequent 5-byte block = one reply level.
    const hi = (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
    const lo = bytes[5] << 24; // lower 3 bytes are lost (truncation gives ~minute resolution)

    // FILETIME = 100-ns ticks since 1601-01-01 00:00:00 UTC
    // Convert to milliseconds since Unix epoch (1970-01-01):
    //   ms = (FILETIME - 116444736000000000) / 10000
    // Using BigInt for precision:
    const filetime = (BigInt(hi >>> 0) << 32n) | BigInt(lo >>> 0);
    const EPOCH_OFFSET = 116444736000000000n;
    const ms = Number((filetime - EPOCH_OFFSET) / 10000n);

    const rootTime = new Date(ms);
    if (isNaN(rootTime.getTime())) return undefined;

    // Each 5-byte block after the 22-byte header = one reply level
    const replyDepth = Math.max(0, Math.floor((bytes.length - 22) / 5));

    return { rootTime, replyDepth };
  } catch {
    return undefined;
  }
}
