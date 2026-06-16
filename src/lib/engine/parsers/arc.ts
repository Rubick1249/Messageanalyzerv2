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

    const sealCv = headers.seals
      .map(s => { const m = /i=(\d+).*\bcv=(none|pass|fail)\b/i.exec(s); return m && parseInt(m[1]) === instance ? m[2] : null; })
      .find(Boolean);

    // Use 'missing-seal' sentinel when no ARC-Seal matches this instance — not 'none',
    // which RFC 8617 reserves for a valid first-sealer with no prior chain.
    const cvFromSeal = sealCv ?? 'missing-seal';

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

  sets.sort((a, b) => a.instance - b.instance);

  // oda/ltdi from X-MS-Exchange-Organization-ARC-Result reflect the overall chain evaluation
  // result — apply only to the highest-instance (most recent) set.
  if (headers.msArcResult && sets.length > 0) {
    const oda = /oda=(\d+)/i.exec(headers.msArcResult)?.[1];
    const ltdi = /ltdi=(\d+)/i.exec(headers.msArcResult)?.[1];
    const maxSet = sets[sets.length - 1];
    if (maxSet) {
      if (oda !== undefined) maxSet.oda = oda;
      if (ltdi !== undefined) maxSet.ltdi = ltdi;
    }
  }

  return sets;
}
