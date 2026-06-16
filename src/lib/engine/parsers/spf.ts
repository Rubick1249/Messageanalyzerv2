// Recursive SPF resolver following include: and redirect= chains per RFC 7208.
// Only does DNS lookups for domains extracted from the SPF record — no raw header text sent.

import { queryTxt } from '../dns/client';
import { ipInCidr } from '../cidr';

export interface SpfCidrResult {
  cidr: string;
  match: boolean;
  lookupCount: number;
  resolvedVia: string;  // the domain where the matching CIDR was found
}

const MAX_LOOKUPS = 10; // RFC 7208 §4.6.4

export async function resolveSpfCidr(
  connectingIp: string,
  domain: string,
  _counter: { n: number } = { n: 0 }
): Promise<SpfCidrResult | undefined> {
  if (_counter.n >= MAX_LOOKUPS) return undefined;

  const records = await queryTxt(domain);
  _counter.n++;

  const record = records.find(r => r.startsWith('v=spf1'));
  if (!record) return undefined;

  // Direct ip4:/ip6: mechanisms — no DNS lookup needed
  // Capture qualifier: + (pass), - (fail), ~ (softfail), ? (neutral). Default is +.
  for (const m of record.matchAll(/([+\-~?]?)(?:ip4|ip6):([^\s]+)/gi)) {
    const qualifier = m[1] || '+';
    if (qualifier === '-' || qualifier === '~' || qualifier === '?') continue;
    if (ipInCidr(connectingIp, m[2])) {
      return { cidr: m[2], match: true, lookupCount: _counter.n, resolvedVia: domain };
    }
  }

  // include: mechanisms — each costs one DNS lookup
  for (const m of record.matchAll(/\binclude:([^\s]+)/gi)) {
    if (_counter.n >= MAX_LOOKUPS) break;
    const result = await resolveSpfCidr(connectingIp, m[1], _counter);
    if (result?.match) return result;
  }

  // redirect= mechanism
  const redirect = /\bredirect=([^\s]+)/i.exec(record)?.[1];
  if (redirect && _counter.n < MAX_LOOKUPS) {
    return resolveSpfCidr(connectingIp, redirect, _counter);
  }

  return undefined;
}

export async function fetchSpfRecord(domain: string): Promise<string | undefined> {
  const records = await queryTxt(domain);
  return records.find(r => r.startsWith('v=spf1'));
}
