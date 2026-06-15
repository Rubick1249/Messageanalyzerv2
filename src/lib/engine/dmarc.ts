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

export async function resolveDmarc(fromDomain: string): Promise<DmarcLookup | undefined> {
  const labels = fromDomain.split('.');
  // Try from most specific to least, but stop before single-label (TLD)
  for (let i = 0; i < labels.length - 1; i++) {
    const candidate = labels.slice(i).join('.');
    const record = await queryDmarcRecord(candidate);
    if (record) {
      return {
        record,
        domain: candidate,
        orgDomain: candidate,
        inherited: i > 0,
        policy: extractDmarcPolicy(record),
      };
    }
  }
  return undefined;
}

function extractDmarcPolicy(record: string): string {
  const m = /\bp=(none|quarantine|reject)\b/i.exec(record);
  return m ? `p=${m[1].toLowerCase()}` : 'p=none';
}
