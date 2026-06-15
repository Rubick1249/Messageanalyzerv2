// Classifies each Received hop by role and produces a human-readable owner description.
// Classification is based on the `by` hostname (the server that received the message),
// since that's what the hop record documents.

import type { Hop } from '@/lib/types';
import type { ReceivedHop } from './parsers/received';

// M365 EOP inbound frontier: eop-eur03.prod.protection.outlook.com, mail.protection.outlook.com
const IS_EOP_FRONTIER = /\.(?:eop-[a-z0-9]+\.prod\.protection\.outlook\.com|mail\.protection\.outlook\.com)$/i;
// M365 EOP sender-side outbound relay
const IS_EOP_OUTBOUND = /\.outbound\.protection\.outlook\.com$/i;
// M365 transport / CA frontend nodes
const IS_M365_TRANSPORT = /\.(?:outlook\.office365\.com|outlook\.office\.com)$/i;
// M365 mailbox backend servers (prd/apcprd/eurprd/namprd)
const IS_M365_MAILBOX = /\.(?:namprd|eurprd|apcprd|braprd|indprd|jpnprd|ausprd|canprd)\d*\.prod\.outlook\.com$/i;
// Any Microsoft-owned sending infrastructure
const IS_MICROSOFT = /\.(?:microsoft\.com|protection\.outlook\.com|outlook\.com|office365\.com|office\.com|msn\.com|hotmail\.com|live\.com)$/i;

// Region inferred from datacenter prefix in the `by` hostname
const REGION_PATTERNS: [RegExp, string][] = [
  [/^nam\d/i, 'North America'],
  [/^bn\d/i,  'North America'],  // BN = Boydton VA
  [/^by\d/i,  'North America'],  // BY = Quincy WA
  [/^co\d/i,  'North America'],
  [/^dm\d/i,  'North America'],
  [/^eur/i,   'Europe'],
  [/^am\d/i,  'Europe'],         // AM = Amsterdam
  [/^db\d/i,  'Europe'],         // DB = Dublin
  [/^vi\d/i,  'Europe'],         // VI = Vienna
  [/^apc/i,   'Asia Pacific'],
  [/^sg\d/i,  'Asia Pacific'],   // SG = Singapore
  [/^mn\d/i,  'Asia Pacific'],   // MN = Asia Pacific routing
  [/^bra/i,   'Brazil'],
  [/^ind/i,   'India'],
  [/^jpn/i,   'Japan'],
  [/^aus/i,   'Australia'],
];

function inferRegion(hostname: string): string | undefined {
  const short = hostname.split('.')[0].toLowerCase();
  for (const [re, region] of REGION_PATTERNS) {
    if (re.test(short)) return region;
  }
  return undefined;
}

function describeBy(byHost: string, role: Hop['role'], fromHost: string, delaySec: number): string {
  const byLow = byHost.toLowerCase();
  const fromLow = fromHost.split(' ')[0].toLowerCase();

  if (role === 'final-delivery') {
    return `${byHost} — Exchange Online mailbox server delivering to recipient's mailbox via HTTPS submission.`;
  }
  if (role === 'recipient-ingress') {
    if (IS_EOP_FRONTIER.test(byLow)) {
      const externalSender = !IS_MICROSOFT.test(fromLow) && !IS_EOP_OUTBOUND.test(fromLow);
      if (externalSender) {
        return `${byHost} — Exchange Online Protection (EOP) inbound gateway. First Microsoft server to receive this message from the external sender. Performs connection filtering, spam/malware scanning, and anti-spoofing checks.`;
      }
      return `${byHost} — Exchange Online Protection (EOP) inbound gateway (recipient-side). Receives message from sender's EOP outbound and applies recipient-side filtering policies.`;
    }
  }
  if (role === 'sender-egress') {
    return `${byHost} — Exchange Online Protection (EOP) outbound relay (sender-side). The sending tenant's EOP processed and relayed this message outbound.`;
  }
  if (role === 'internal-transport') {
    if (IS_EOP_FRONTIER.test(fromLow) || IS_EOP_OUTBOUND.test(fromLow)) {
      return `${byHost} — Exchange Online transport frontend. Message passed EOP filtering and entered internal mail routing.`;
    }
    if (IS_M365_TRANSPORT.test(byLow)) {
      const holdNote = delaySec > 60 ? ` (${delaySec}s hold — may indicate Safe Attachments detonation or mail flow rule delay)` : '';
      return `${byHost} — Exchange Online transport service. Internal message routing between Microsoft datacenters${holdNote}.`;
    }
    if (IS_M365_MAILBOX.test(byLow)) {
      const holdNote = delaySec > 60 ? ` (${delaySec}s hold — consistent with Safe Attachments detonation)` : '';
      return `${byHost} — Exchange Online mailbox database server. Message queued for delivery to recipient's mailbox store${holdNote}.`;
    }
    return `${byHost} — Exchange Online internal transport.`;
  }
  if (role === 'origin') {
    if (IS_EOP_OUTBOUND.test(byLow)) {
      return `${byHost} — Exchange Online EOP outbound relay. The original sending service submitted the message here for outbound delivery.`;
    }
    return `${byHost} — Message origin / first recorded hop.`;
  }
  if (role === 'foreign') {
    return `${byHost} — External mail server (not part of Microsoft 365 infrastructure). This hop occurred outside Microsoft's network.`;
  }
  return byHost;
}

export function classifyHops(received: ReceivedHop[]): Hop[] {
  // Received headers are in reverse-chronological order in the raw text (newest first).
  // Reverse to produce a chronological delivery path.
  const chrono = [...received].reverse();

  return chrono.map((h, i) => {
    const byLow = h.by.toLowerCase();
    const fromLow = h.from.split(' ')[0].toLowerCase();
    const isLast = i === chrono.length - 1;

    let role: Hop['role'];

    // Last hop via HTTPS is always the mailbox delivery submission
    if (isLast && h.with.toUpperCase().includes('HTTPS')) {
      role = 'final-delivery';
    }
    // EOP outbound on the `by` side = sender's EOP relay
    else if (IS_EOP_OUTBOUND.test(byLow)) {
      role = 'sender-egress';
    }
    // EOP outbound on the `from` side, EOP frontier on `by` = sender-side EOP → recipient EOP
    else if (IS_EOP_OUTBOUND.test(fromLow) && IS_EOP_FRONTIER.test(byLow)) {
      role = 'sender-egress';
    }
    // External (non-Microsoft) sender hitting EOP frontier = first-contact inbound
    else if (!IS_MICROSOFT.test(fromLow) && IS_EOP_FRONTIER.test(byLow)) {
      role = 'recipient-ingress';
    }
    // EOP frontier on `by` (any case not covered above)
    else if (IS_EOP_FRONTIER.test(byLow)) {
      role = 'recipient-ingress';
    }
    // Both sides are internal Microsoft infrastructure
    else if (IS_MICROSOFT.test(byLow)) {
      role = 'internal-transport';
    }
    // Non-Microsoft on both sides (rare: foreign relay pre-EOP)
    else if (!IS_MICROSOFT.test(fromLow) && !IS_MICROSOFT.test(byLow)) {
      role = i === 0 ? 'origin' : 'foreign';
    }
    else {
      role = 'unknown';
    }

    const prev = chrono[i - 1];
    const delaySeconds = (prev?.timestamp && h.timestamp)
      ? Math.max(0, Math.round((h.timestamp.getTime() - prev.timestamp.getTime()) / 1000))
      : 0;

    const region = inferRegion(h.by) ?? inferRegion(h.from.split(' ')[0]);

    return {
      index: i,
      from: h.from,
      by: h.by,
      with: h.with,
      tls: h.tls,
      delaySeconds,
      role,
      owner: describeBy(h.by, role, h.from, delaySeconds),
      region,
    };
  });
}
