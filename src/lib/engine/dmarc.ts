// DMARC org-domain resolution via iterative DNS lookup.
// Tries _dmarc.<domain>, then walks up to _dmarc.<parent>, stopping at registrable domain.
// Does not bundle a PSL; uses DNS to detect where the record lives.

import { queryDmarcRecord } from './dns/client';

export interface DmarcLookup {
  record: string;
  domain: string;       // domain where the record was found
  orgDomain: string;    // org domain (may differ from queried domain if inherited)
  inherited: boolean;
  policy: string;
}

const MAX_DMARC_WALK = 5; // no legitimate org domain needs more than 5 labels

export async function resolveDmarc(fromDomain: string): Promise<DmarcLookup | undefined> {
  const labels = fromDomain.split('.');
  for (let i = 0; i < Math.min(labels.length - 1, MAX_DMARC_WALK); i++) {
    const candidate = labels.slice(i).join('.');
    const record = await queryDmarcRecord(candidate);
    if (record) {
      const inherited = i > 0;
      return {
        record,
        domain: candidate,
        orgDomain: candidate,
        inherited,
        policy: extractDmarcPolicy(record, inherited),
      };
    }
  }
  return undefined;
}

function extractDmarcPolicy(record: string, isSubdomain: boolean): string {
  // When inheriting from a parent org domain, RFC 7489 §6.3 says the sp= tag governs subdomains.
  if (isSubdomain) {
    const sp = /\bsp=(none|quarantine|reject)\b/i.exec(record);
    if (sp) return `sp=${sp[1].toLowerCase()} (subdomain policy)`;
  }
  const m = /\bp=(none|quarantine|reject)\b/i.exec(record);
  return m ? `p=${m[1].toLowerCase()}` : 'p=none';
}
