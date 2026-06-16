// Parses X-Forefront-Antispam-Report header.
// Format: KEY:VALUE;KEY:VALUE;...

export interface ForerontTokens {
  CIP?: string;
  CTRY?: string;
  LANG?: string;
  SCL?: string;
  SFV?: string;
  CAT?: string;
  DIR?: string;
  IPV?: string;
  H?: string;
  PTR?: string;
  SFTY?: string;
  BCL?: string;
  SRV?: string;
  SFS?: string;
}

const FOREFRONT_KEYS = new Set<string>([
  'CIP', 'CTRY', 'LANG', 'SCL', 'SFV', 'CAT', 'DIR', 'IPV', 'H', 'PTR', 'SFTY', 'BCL', 'SRV', 'SFS',
]);

export function parseForefront(value: string): ForerontTokens {
  const tokens: ForerontTokens = {};
  for (const part of value.split(';')) {
    const colon = part.indexOf(':');
    if (colon < 1) continue;
    const key = part.slice(0, colon).trim();
    const val = part.slice(colon + 1).trim();
    if (FOREFRONT_KEYS.has(key)) {
      tokens[key as keyof ForerontTokens] = val;
    }
  }
  return tokens;
}

const SFV_MAP: Record<string, string> = {
  NSPM: 'Not spam — evaluated and determined to be clean.',
  SPM: 'Spam — message classified as spam.',
  SCL6: 'High spam confidence (SCL 6).',
  SKS: 'Skipped spam filtering — safe sender list.',
  SKN: 'Skipped — non-spam rule applied.',
  SKI: 'Skipped — intra-org.',
  SKB: 'Skipped — blocked sender.',
  SKA: 'Skipped — allowed sender.',
  BLK: 'Blocked by bulk confidence level.',
  SFE: 'Skipped — user safe sender.',
};

export function sfvMeaning(sfv: string): string {
  return SFV_MAP[sfv] ?? `SFV:${sfv} — see Microsoft header field definitions.`;
}

const IPV_MAP: Record<string, string> = {
  CAL: 'Connecting IP was on a Customer Allow List — IP-reputation checks bypassed by admin policy.',
  NLI: 'IP not listed on any IP reputation list.',
  CRL: 'Connecting IP was on a Customer Block List.',
};

export function ipvMeaning(ipv: string): string {
  return IPV_MAP[ipv] ?? `IPV:${ipv}`;
}

const CAT_MAP: Record<string, { label: string; status: string }> = {
  NONE:  { label: 'None',        status: 'pass' },
  BULK:  { label: 'Bulk',        status: 'warn' },
  PHSH:  { label: 'Phishing',    status: 'fail' },
  MALW:  { label: 'Malware',     status: 'fail' },
  SPOOF: { label: 'Spoofing',    status: 'fail' },
  GIMP:  { label: 'Gmail impersonation', status: 'fail' },
  UIMP:  { label: 'User impersonation',  status: 'fail' },
  DIMP:  { label: 'Domain impersonation', status: 'fail' },
  BIMP:  { label: 'Brand impersonation', status: 'fail' },
  HSPM:  { label: 'High-confidence spam', status: 'fail' },
  SPM:   { label: 'Spam',        status: 'warn' },
};

export function catInfo(cat: string): { label: string; status: string } {
  return CAT_MAP[cat] ?? { label: cat, status: 'info' };
}
