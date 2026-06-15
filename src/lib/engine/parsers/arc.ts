// Parses ARC-Seal, ARC-Message-Signature, ARC-Authentication-Results, and
// the Microsoft-proprietary X-MS-Exchange-Organization-ARC-Result header.

export interface ArcHeaders {
  seals: string[];
  sigs: string[];
  authResults: string[];
  msArcResult?: string;
}

export interface ArcSetParsed {
  instance: number;
  cv: string;
  oda?: string;
  ltdi?: string;
  authResultValue: string;
  spf?: string;
  dkim?: string;
  dmarc?: string;
}

export function parseArcSets(headers: ArcHeaders): ArcSetParsed[] {
  const sets: ArcSetParsed[] = [];

  for (const ar of headers.authResults) {
    const iMatch = /i=(\d+)/i.exec(ar);
    if (!iMatch) continue;
    const instance = parseInt(iMatch[1], 10);

    const cvFromSeal = headers.seals
      .map(s => { const m = /i=(\d+).*\bcv=(none|pass|fail)\b/i.exec(s); return m && parseInt(m[1]) === instance ? m[2] : null; })
      .find(Boolean) ?? 'none';

    const set: ArcSetParsed = {
      instance,
      cv: cvFromSeal.toLowerCase(),
      authResultValue: ar,
    };

    set.spf = /\bspf=(pass|fail|none|softfail)\b/i.exec(ar)?.[1]?.toLowerCase();
    set.dkim = /\bdkim=(pass|fail|none)\b/i.exec(ar)?.[1]?.toLowerCase();
    set.dmarc = /\bdmarc=(pass|fail|none)\b/i.exec(ar)?.[1]?.toLowerCase();

    sets.push(set);
  }

  // Parse oda / ltdi from X-MS-Exchange-Organization-ARC-Result
  if (headers.msArcResult) {
    const oda = /oda=(\d+)/i.exec(headers.msArcResult)?.[1];
    const ltdi = /ltdi=(\d+)/i.exec(headers.msArcResult)?.[1];
    for (const set of sets) {
      if (oda !== undefined) set.oda = oda;
      if (ltdi !== undefined) set.ltdi = ltdi;
    }
  }

  sets.sort((a, b) => a.instance - b.instance);
  return sets;
}
