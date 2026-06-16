// Parses X-Microsoft-Antispam-Mailbox-Delivery header.
// Format: key:value;key:value;...

export interface MailboxDeliveryTokens {
  ucf?: string;
  jmr?: string;
  auth?: string;
  dest?: string;
  wl?: string;
  pcwl?: string;
  kl?: string;
  OFR?: string;
  ENG?: string;
}

const MBD_KEYS = new Set<string>(['ucf', 'jmr', 'auth', 'dest', 'wl', 'pcwl', 'kl', 'OFR', 'ENG']);

export function parseMailboxDelivery(value: string): MailboxDeliveryTokens {
  const tokens: MailboxDeliveryTokens = {};
  for (const part of value.split(';')) {
    const colon = part.indexOf(':');
    if (colon < 1) continue;
    const key = part.slice(0, colon).trim();
    const val = part.slice(colon + 1).trim();
    if (MBD_KEYS.has(key)) {
      tokens[key as keyof MailboxDeliveryTokens] = val;
    }
  }
  return tokens;
}

const DEST_MAP: Record<string, { meaning: string; status: string }> = {
  I: { meaning: 'Inbox — delivered to inbox.',               status: 'pass' },
  J: { meaning: 'Junk Email folder — routed to junk.',      status: 'warn' },
  Q: { meaning: 'Quarantine — held in quarantine.',          status: 'fail' },
  D: { meaning: 'Deleted Items folder.',                     status: 'warn' },
};

export function destInfo(dest: string): { meaning: string; status: string } {
  return DEST_MAP[dest] ?? { meaning: `dest:${dest} — unknown destination code.`, status: 'info' };
}
