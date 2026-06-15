// Derives the three top-level verdicts from parsed fields.

import type { Verdict } from '@/lib/types';

interface VerdictInput {
  spf?: string;
  spfIp?: string;
  dkim?: string;
  dkimDomain?: string;
  dmarc?: string;
  dmarcAction?: string;
  compauth?: string;
  compauthReason?: string;
  arc?: string;
  oda?: string;
  scl?: string;
  sfv?: string;
  cat?: string;
  bcl?: string;
  dest?: string;
  ofr?: string;
  ucf?: string;
  jmr?: string;
  kl?: string;
}

export function deriveAuthVerdict(i: VerdictInput): Verdict {
  const evidence: string[] = [];
  let status: Verdict['status'] = 'pass';
  let state = 'Authenticated & aligned';

  if (i.spf) evidence.push(`spf=${i.spf}${i.spfIp ? ` (connecting IP ${i.spfIp})` : ''}`);
  if (i.dkim) evidence.push(`dkim=${i.dkim}${i.dkimDomain ? ` (d=${i.dkimDomain})` : ''}`);
  if (i.dmarc) evidence.push(`dmarc=${i.dmarc}${i.dmarcAction ? ` action=${i.dmarcAction}` : ''}`);
  if (i.compauth) {
    const r = i.compauthReason ? ` reason=${i.compauthReason}` : '';
    evidence.push(`compauth=${i.compauth}${r}`);
  }
  if (i.arc && i.arc !== 'none') evidence.push(`ARC chain: arc=${i.arc}${i.oda ? ` oda=${i.oda}` : ''}${i.oda ? ` ltdi=${i.oda}` : ''}`);

  const failed = [i.spf, i.dkim, i.dmarc].filter(r => r && !['pass', 'none'].includes(r));
  if (failed.length > 0 || i.compauth === 'fail') {
    status = 'fail';
    state = 'Authentication failed';
  } else if (i.compauth === 'softpass' || i.compauth === 'none') {
    status = 'warn';
    state = 'Partial / implicit authentication';
  }

  return { state, status, evidence };
}

export function deriveDispositionVerdict(i: VerdictInput): Verdict {
  const evidence: string[] = [];
  let status: Verdict['status'] = 'pass';
  let state = 'Not spam';

  const scl = parseInt(i.scl ?? '-1');
  if (!isNaN(scl)) evidence.push(`SCL:${scl}${scl >= 5 ? ' (spam threshold exceeded)' : scl >= 1 ? ' (low spam probability)' : ''}`);
  if (i.sfv) evidence.push(`SFV:${i.sfv}`);
  if (i.cat && i.cat !== 'NONE') evidence.push(`CAT:${i.cat}`);
  if (i.bcl) evidence.push(`BCL:${i.bcl}`);

  if (i.cat && ['PHSH', 'MALW', 'SPOOF', 'UIMP', 'DIMP', 'GIMP', 'BIMP'].includes(i.cat)) {
    status = 'fail';
    state = `Threat detected (CAT:${i.cat})`;
  } else if (i.sfv === 'SPM' || scl >= 5) {
    status = 'warn';
    state = 'Spam';
  } else if (i.cat === 'BULK' || (parseInt(i.bcl ?? '0') >= 4)) {
    status = 'warn';
    state = 'Bulk mail';
  }

  return { state, status, evidence };
}

export function deriveDeliveryVerdict(i: VerdictInput): Verdict {
  const evidence: string[] = [];
  let status: Verdict['status'] = 'pass';
  let state = 'Inbox';

  if (i.dest === 'I') { evidence.push('dest:I (Inbox)'); state = 'Inbox'; status = 'pass'; }
  else if (i.dest === 'J') { evidence.push('dest:J (Junk Email folder)'); state = 'Junk'; status = 'warn'; }
  else if (i.dest === 'Q') { evidence.push('dest:Q (Quarantine)'); state = 'Quarantine'; status = 'fail'; }
  else if (i.dest) { evidence.push(`dest:${i.dest}`); }

  if (i.ofr) evidence.push(`OFR:${i.ofr}`);
  if (i.kl === '0') evidence.push('No block-list match (kl:0)');
  if (i.ucf && i.ucf !== '0') evidence.push(`User filtering applied (ucf:${i.ucf})`);
  if (i.jmr && i.jmr !== '0') evidence.push(`Junk mail rule active (jmr:${i.jmr})`);

  return { state, status, evidence };
}
