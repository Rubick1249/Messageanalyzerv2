// DoH DNS client. Uses Cloudflare with Google as fallback.
// Only TXT record lookups are needed for SPF, DKIM, and DMARC.
// Per spec: only domain names extracted from the header are sent — no raw header text.

import { cacheGet, cacheSet } from './cache';

const RESOLVERS = [
  'https://cloudflare-dns.com/dns-query',
  'https://dns.google/resolve',
];

interface DoHResponse {
  Status: number;
  Answer?: Array<{ type: number; data: string }>;
}

async function queryOnce(resolver: string, name: string, type: 'TXT'): Promise<string[]> {
  const url = `${resolver}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/dns-json' },
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as DoHResponse;
  if (json.Status !== 0) return [];
  return (json.Answer ?? [])
    .filter(r => r.type === 16) // TXT = 16
    .map(r => r.data.replace(/^"|"$/g, '').replace(/"\s*"/g, '')); // strip quotes, join chunks
}

export async function queryTxt(name: string): Promise<string[]> {
  const key = `TXT:${name}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  for (const resolver of RESOLVERS) {
    try {
      const records = await queryOnce(resolver, name, 'TXT');
      cacheSet(key, records);
      return records;
    } catch {
      // try next resolver
    }
  }
  return [];
}

export async function querySpfRecord(domain: string): Promise<string | undefined> {
  const records = await queryTxt(domain);
  return records.find(r => r.startsWith('v=spf1'));
}

export async function queryDmarcRecord(domain: string): Promise<string | undefined> {
  const records = await queryTxt(`_dmarc.${domain}`);
  return records.find(r => r.startsWith('v=DMARC1'));
}

export async function queryDkimSelector(selector: string, domain: string): Promise<string | undefined> {
  const records = await queryTxt(`${selector}._domainkey.${domain}`);
  return records.find(r => r.includes('p='));
}
