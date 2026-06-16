// Parses individual Received header values.

export interface ReceivedHop {
  from: string;
  fromIp?: string;
  by: string;
  with: string;
  tls?: string;
  timestamp?: Date;
  viaFrontend: boolean;
}

export function parseReceived(value: string): ReceivedHop {
  const fromMatch = /\bfrom\s+(\S+)(?:\s+\(([^)]+)\))?/i.exec(value);
  const byMatch = /\bby\s+(\S+)/i.exec(value);
  // Broadened to match ESMTP, ESMTPS, ESMTPA, LMTP, MAPI, HTTP variants, and other common protocols
  const withMatch = /\bwith\s+((?:Microsoft SMTP Server|HTTPS?A?|ESMTPS?A?|LMTP|SMTP|mapi)[^;(]*)/i.exec(value);
  const tlsMatch = /version=(TLS\S+),\s*cipher=(\S+)/i.exec(value);
  // Accept dates with or without the optional day-name prefix (RFC 5322 §3.3)
  const dateMatch = /;\s*(.+)$/.exec(value);

  const fromHost = fromMatch?.[1] ?? '(unknown)';
  // RFC 5321 §4.4: IPv6 addresses are tagged as "IPv6:addr" — strip the tag before extracting
  const fromIpRaw = fromMatch?.[2]?.replace(/^IPv6:/i, '') ?? '';
  const fromIp = fromIpRaw.match(/[\da-f:./]+/i)?.[0];
  const by = byMatch?.[1] ?? '(unknown)';
  let proto = withMatch?.[1]?.trim() ?? '(unknown)';
  proto = proto.replace(/\s+id\s+\S+.*$/i, '').trim();

  let timestamp: Date | undefined;
  if (dateMatch) {
    const d = new Date(dateMatch[1].trim());
    if (!isNaN(d.getTime())) timestamp = d;
  }

  return {
    from: fromIp ? `${fromHost} (${fromIp})` : fromHost,
    fromIp,
    by,
    with: proto,
    tls: tlsMatch ? `${tlsMatch[1]} / ${tlsMatch[2]}` : undefined,
    timestamp,
    viaFrontend: /via Frontend Transport/i.test(value),
  };
}
