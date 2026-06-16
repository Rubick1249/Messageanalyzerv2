// Main analysis entry point. Takes raw header text, returns AnalysisResult.
// All DNS lookups happen here. If DNS is unavailable, fields render as 'unavailable'.

import type { AnalysisResult, Field, ArcSet, AuthStamp, MsipLabel } from '@/lib/types';
import { tokenize, getFirst, getAll } from './tokenizer';
import { parseAuthResults } from './parsers/auth-results';
import { parseReceived } from './parsers/received';
import { parseForefront, sfvMeaning, ipvMeaning, catInfo } from './parsers/forefront';
import { parseMailboxDelivery, destInfo } from './parsers/mailbox-delivery';
import { parseArcSets } from './parsers/arc';
import { parseMsipLabels } from './parsers/msip';
import { decodeThreadIndex } from './parsers/thread';
import { compauthReasonMeaning } from './parsers/compauth';
import { classifyHops } from './hops';
import { synthesizeImpersonation } from './impersonation';
import { deriveAuthVerdict, deriveDispositionVerdict, deriveDeliveryVerdict } from './verdicts';
import { resolveDmarc } from './dmarc';
import { resolveSpfCidr, fetchSpfRecord } from './parsers/spf';
import { queryDkimSelector } from './dns/client';

function field<T>(
  label: string, raw: string, value: T | null,
  tier: Field<T>['tier'], explanation: string,
  opts: Partial<Pick<Field<T>, 'docUrl' | 'note' | 'status'>> = {}
): Field<T> {
  return { label, raw, value, tier, explanation, ...opts };
}

export async function analyze(rawHeaders: string): Promise<AnalysisResult> {
  const fields = tokenize(rawHeaders);

  // ── Standard headers ──────────────────────────────────────────────────────
  const subject   = getFirst(fields, 'subject') ?? '';
  const msgId     = getFirst(fields, 'message-id') ?? '';
  const fromRaw   = getFirst(fields, 'from') ?? '';
  const toRaw     = getFirst(fields, 'to') ?? '';
  const ccRaw     = getFirst(fields, 'cc');
  const dateRaw   = getFirst(fields, 'date') ?? '';
  const contentType = getFirst(fields, 'content-type') ?? '';
  const mimeVer   = getFirst(fields, 'mime-version');
  const hasAttach = getFirst(fields, 'x-ms-has-attach') ?? '';
  const threadIdx = getFirst(fields, 'thread-index') ?? '';
  const replyTo   = getFirst(fields, 'reply-to');

  // ── NMI ───────────────────────────────────────────────────────────────────
  const nmiRaw = getFirst(fields, 'x-ms-exchange-organization-network-message-id') ?? '';

  // ── Authentication-Results ────────────────────────────────────────────────
  const arValues = getAll(fields, 'authentication-results');
  const msArValue = getFirst(fields, 'x-ms-exchange-authentication-results') ?? '';

  const primaryAr = arValues[0] ? parseAuthResults(arValues[0]) : parseAuthResults(msArValue);

  // ── Received chain ────────────────────────────────────────────────────────
  const receivedValues = getAll(fields, 'received');
  const parsedReceived = receivedValues.map(parseReceived);
  const hops = classifyHops(parsedReceived);

  // ── Dates / latency ───────────────────────────────────────────────────────
  const sentDate = dateRaw ? new Date(dateRaw) : null;
  const lastReceived = parsedReceived[0]?.timestamp; // newest first
  const latencySeconds = (sentDate && lastReceived && !isNaN(sentDate.getTime()))
    ? Math.max(0, Math.round((lastReceived.getTime() - sentDate.getTime()) / 1000))
    : null;

  // ── Forefront ────────────────────────────────────────────────────────────
  const ffRaw = getFirst(fields, 'x-forefront-antispam-report') ?? '';
  const ff = parseForefront(ffRaw);

  // ── MS Antispam ───────────────────────────────────────────────────────────
  const msasRaw = getFirst(fields, 'x-microsoft-antispam') ?? '';
  const bclMatch = /BCL:(\d)/i.exec(msasRaw);
  const bcl = bclMatch?.[1] ?? ff.BCL ?? '0';

  // ── Mailbox delivery ──────────────────────────────────────────────────────
  const mbdRaw = getFirst(fields, 'x-microsoft-antispam-mailbox-delivery') ?? '';
  const mbd = parseMailboxDelivery(mbdRaw);

  // ── ARC ───────────────────────────────────────────────────────────────────
  const arcSealValues = getAll(fields, 'arc-seal');
  const arcSigValues  = getAll(fields, 'arc-message-signature');
  const arcArValues   = getAll(fields, 'arc-authentication-results');
  const msArcResult   = getFirst(fields, 'x-ms-exchange-organization-arc-result');
  const arcSets = parseArcSets({
    seals: arcSealValues, sigs: arcSigValues, authResults: arcArValues, msArcResult,
  });
  const arcOverrode = arcSets.length > 0 && (msArcResult?.includes('oda=1') ?? false);

  // ── DKIM-Signature ────────────────────────────────────────────────────────
  const dkimSigRaw = getFirst(fields, 'dkim-signature') ?? '';
  const dkimSelectorMatch = /\bs=([^\s;]+)/i.exec(dkimSigRaw);
  const dkimDomainMatch   = /\bd=([^\s;]+)/i.exec(dkimSigRaw);
  // Do not fall back to 'selector1' — performing a DNS lookup for an unknown selector
  // produces a misleading "not found" result when the real selector is different.
  const dkimSelector = dkimSelectorMatch?.[1] ?? primaryAr.dkimSelector;
  const dkimDomain   = dkimDomainMatch?.[1]   ?? primaryAr.dkimDomain ?? '';

  // ── MSIP ──────────────────────────────────────────────────────────────────
  const msipRaw = getFirst(fields, 'msip_labels');
  const msip = msipRaw ? parseMsipLabels(msipRaw) : undefined;

  // ── Thread-Index ──────────────────────────────────────────────────────────
  const threadDecoded = threadIdx ? decodeThreadIndex(threadIdx) : undefined;

  // ── Context ───────────────────────────────────────────────────────────────
  const fromEntity = getFirst(fields, 'x-ms-exchange-crosstenant-fromentityheader') ?? '';
  const authAs     = getFirst(fields, 'x-ms-exchange-organization-authas') ?? '';
  const direction  = getFirst(fields, 'x-ms-exchange-organization-messagedirectionality') ?? '';
  const senderTenantRaw = getFirst(fields, 'x-ms-exchange-crosstenant-id');
  const fromDomain = (/<([^>]+)>/.exec(fromRaw)?.[1] ?? fromRaw).split('@')[1]?.toLowerCase() ?? '';
  const envelopeFromMatch = /smtp\.mailfrom=([^\s;,]+)/i.exec(arValues[0] ?? msArValue);
  const envelopeFrom = envelopeFromMatch?.[1] ?? fromDomain;

  const isExternal = fromEntity.toLowerCase() === 'internet'
    || authAs.toLowerCase() === 'anonymous'
    || subject.startsWith('[EXTERNAL]');

  // ── DNS lookups ───────────────────────────────────────────────────────────
  let dnsAvailable = true;
  let spfRecord: string | undefined;
  let dkimSelectorRecord: string | undefined;
  let dmarcLookup: Awaited<ReturnType<typeof resolveDmarc>>;
  let cidrMatch: { ip: string; cidr: string; match: boolean; lookupCount: number } | undefined;

  const connectingIp = primaryAr.spfIp ?? ff.CIP ?? '';
  const spfDomain = primaryAr.spfMailFrom?.split('@').pop() ?? fromDomain;

  // Skip DNS entirely when we have no domain to query — avoids sending empty-string lookups.
  if (!spfDomain && !fromDomain) {
    dnsAvailable = false;
  } else {
    // Race all DNS work against a 15 s overall wall-clock timeout.
    const dnsWork = (async () => {
      [spfRecord, dkimSelectorRecord, dmarcLookup] = await Promise.all([
        fetchSpfRecord(spfDomain),
        (dkimDomain && dkimSelector) ? queryDkimSelector(dkimSelector, dkimDomain) : Promise.resolve(undefined),
        resolveDmarc(fromDomain || spfDomain),
      ]);

      // Recursive SPF CIDR membership test — follows include: chains per RFC 7208
      if (connectingIp && spfDomain) {
        const spfResult = await resolveSpfCidr(connectingIp, spfDomain);
        if (spfResult?.match) {
          const label = spfResult.resolvedVia !== spfDomain
            ? `${spfResult.cidr} (via ${spfResult.resolvedVia})`
            : spfResult.cidr;
          cidrMatch = { ip: connectingIp, cidr: label, match: true, lookupCount: spfResult.lookupCount };
        } else if (connectingIp && primaryAr.spf === 'pass') {
          cidrMatch = { ip: connectingIp, cidr: `(mechanism resolved by ${spfDomain} SPF record)`, match: true, lookupCount: 1 };
        }
      }
    })();

    const dnsTimeout = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), 15_000)
    );

    try {
      await Promise.race([dnsWork, dnsTimeout]);
    } catch {
      dnsAvailable = false;
    }
  }

  // ── Auth stamps ───────────────────────────────────────────────────────────
  const stamps: AuthStamp[] = [];
  for (const arVal of arValues) {
    const t = parseAuthResults(arVal);
    stamps.push({
      source: `Authentication-Results (${arVal.split(';')[0].split(' ')[0]})`,
      spf: t.spf, dkim: t.dkim, dmarc: t.dmarc, compauth: t.compauth ? `${t.compauth} reason=${t.compauthReason}` : undefined,
      discrepancy: false,
      raw: arVal,
    });
  }
  if (msArValue) {
    const t = parseAuthResults(msArValue);
    stamps.push({
      source: 'X-MS-Exchange-Authentication-Results',
      spf: t.spf, dkim: t.dkim, dmarc: t.dmarc, compauth: t.compauth ? `${t.compauth} reason=${t.compauthReason}` : undefined,
      discrepancy: false,
      raw: msArValue,
    });
  }
  // Flag discrepancies
  const firstSpf = stamps[0]?.spf;
  const firstDkim = stamps[0]?.dkim;
  for (const stamp of stamps) {
    stamp.discrepancy = !!(
      (stamp.spf && firstSpf && stamp.spf !== firstSpf) ||
      (stamp.dkim && firstDkim && stamp.dkim !== firstDkim)
    );
  }

  // ── Compauth ──────────────────────────────────────────────────────────────
  const caResult = primaryAr.compauth ?? 'none';
  const caReason = primaryAr.compauthReason ?? '000';
  const caMeaning = compauthReasonMeaning(caReason);

  // ── Build AnalysisResult ─────────────────────────────────────────────────
  const spfStatus = primaryAr.spf === 'pass' ? 'pass' : primaryAr.spf === 'fail' ? 'fail' : 'warn';
  const dkimStatus = primaryAr.dkim === 'pass' ? 'pass' : primaryAr.dkim === 'fail' ? 'fail' : 'warn';
  const dmarcStatus = primaryAr.dmarc === 'pass' ? 'pass' : primaryAr.dmarc === 'fail' ? 'fail' : 'warn';

  const verdictInput = {
    spf: primaryAr.spf, spfIp: connectingIp,
    dkim: primaryAr.dkim, dkimDomain,
    dmarc: primaryAr.dmarc, dmarcAction: primaryAr.dmarcAction,
    compauth: caResult, compauthReason: caReason,
    arc: primaryAr.arc, oda: arcSets[arcSets.length - 1]?.oda, ltdi: arcSets[arcSets.length - 1]?.ltdi,
    scl: ff.SCL, sfv: ff.SFV, cat: ff.CAT, bcl,
    dest: mbd.dest, ofr: mbd.OFR, ucf: mbd.ucf, jmr: mbd.jmr, kl: mbd.kl,
  };

  // ── Impersonation ──────────────────────────────────────────────────────────
  const impersonation = synthesizeImpersonation({
    fromHeader: fromRaw, fromDomain, cat: ff.CAT ?? 'NONE',
    sfty: ff.SFTY ?? '', subject, isExternal,
  });

  // ── MSIP label fields ─────────────────────────────────────────────────────
  let sensitivityLabel: MsipLabel | undefined;
  if (msip) {
    sensitivityLabel = {
      name:        field('Label name',       msip.name ?? '',       msip.name ?? null,       'B', 'Human-readable sensitivity label name as configured in the Microsoft Purview compliance portal.'),
      guid:        field('Label GUID',       msip.guid,             msip.guid,                'B', 'Unique identifier for the sensitivity label definition.'),
      enabled:     field('Enabled',          msip.enabled ?? '',    msip.enabled ? msip.enabled.toLowerCase() === 'true' : null, 'B', 'Whether the label is currently active (Enabled=True).'),
      setDate:     field('Set date',         msip.setDate ?? '',    msip.setDate ?? null,     'B', 'ISO 8601 timestamp when the label was applied to this message.'),
      method:      field('Method',           msip.method ?? '',     msip.method ?? null,      'B', 'How the label was applied: Privileged (admin/policy-enforced), Standard (user-applied), or Automatic.'),
      contentBits: field('ContentBits',      msip.contentBits ?? '', msip.contentBits ?? null,'B', 'Bitmask encoding label protection settings. Individual bit semantics are partially soft — see Microsoft Purview documentation for the latest mapping.', { note: 'ContentBits bitmask — value is documented but individual bit semantics are partially soft (Tier B).' }),
      siteId:      field('Site ID',          msip.siteId ?? '',     msip.siteId ?? null,      'B', 'Azure AD tenant (site) identifier where the label policy is defined.'),
    };
  }

  // ── ARC sets for AnalysisResult ───────────────────────────────────────────
  const arcSetsForResult: ArcSet[] = arcSets.map(s => ({
    instance: s.instance,
    cv: field('Chain validation (cv)', s.cv, s.cv, 'A',
      `cv=${s.cv} — the chain validation result for ARC set ${s.instance}. "none" = first sealer (no prior chain). "pass" = prior chain validated. "fail" = chain broken.`,
      { status: s.cv === 'fail' ? 'fail' : s.cv === 'pass' ? 'pass' : 'info' }),
    oda: s.oda !== undefined ? field('ARC override decision (oda)', s.oda, s.oda, 'D',
      `oda=${s.oda} — the ARC result was used to override an auth failure because the message was forwarded via a trusted system. (Tier D: undocumented, best-effort gloss)`,
      { status: 'info', note: 'Undocumented field from X-MS-Exchange-Organization-ARC-Result.' }) : undefined,
    ltdi: s.ltdi !== undefined ? field('Trusted ARC indicator (ltdi)', s.ltdi, s.ltdi, 'D',
      `ltdi=${s.ltdi} — the ARC chain/sealer is recognized as trusted. Combined oda=1 + ltdi=1: this message would have failed authentication, but a trusted ARC sealer allowed it through.`,
      { status: 'info', note: 'Undocumented field from X-MS-Exchange-Organization-ARC-Result.' }) : undefined,
    preservedAuth: {
      spf: s.spf, dkim: s.dkim, dmarc: s.dmarc,
    },
  }));

  // ── Forefront field rows ──────────────────────────────────────────────────
  const forefrontFields = buildForefrontFields(ff, ffRaw);
  const msasFields = buildMsasFields(msasRaw, bcl);
  const mbdFields = buildMbdFields(mbd, mbdRaw);

  return {
    rawHeaders,
    dnsAvailable,
    meta: {
      subject: field('Subject', subject, subject, 'A',
        'The email subject as declared in the RFC 5322 Subject header.',
        { status: subject.startsWith('[EXTERNAL]') ? 'warn' : 'neutral' }),
      messageId: field('Message-ID', msgId, msgId, 'A',
        'RFC 5322 Message-ID. Globally unique identifier assigned by the sending MTA.', { status: 'neutral' }),
      networkMessageId: field('Network Message ID', nmiRaw, nmiRaw || null, 'B',
        'Microsoft-assigned identifier for this message. Use this value in the Exchange Admin Center Message Trace or Microsoft Defender Threat Explorer to look up processing details.',
        { docUrl: 'https://learn.microsoft.com/en-us/exchange/monitoring/trace-an-email-message/run-a-message-trace-and-view-results', status: 'info' }),
      fromHeader: field('From (P2 / 5322.From)', fromRaw, fromRaw, 'A',
        'The RFC 5322 From header — what the recipient sees in their mail client. Used for DMARC alignment.',
        { status: isExternal ? 'warn' : 'neutral' }),
      envelopeFrom: field('Envelope From (P1 / 5321.MailFrom)', envelopeFrom, envelopeFrom, 'A',
        'The SMTP MAIL FROM envelope address. Used for SPF checks and bounce routing. May differ from the From header.', { status: 'neutral' }),
      replyTo: replyTo ? field('Reply-To', replyTo, replyTo, 'A',
        'RFC 5322 Reply-To header. Replies will be directed here instead of the From address. A mismatch between Reply-To and From may indicate a phishing attempt.', { status: 'warn' }) : undefined,
      to: parseAddressList(toRaw, 'To', 'Primary recipient(s).'),
      cc: ccRaw ? parseAddressList(ccRaw, 'Cc', 'Carbon copy recipient(s).') : [],
      creationTime: field('Date', dateRaw, sentDate ? toIso(sentDate) : null, 'A',
        'RFC 5322 Date header — the time the sending MTA claims the message was composed/submitted.', { status: 'neutral' }),
      endToEndLatencySeconds: field(
        'End-to-end latency',
        latencySeconds !== null ? `${latencySeconds}s` : '(cannot compute)',
        latencySeconds,
        'A',
        'Time elapsed from the RFC 5322 Date to the final Received timestamp. Values above 60 s are notable; above 300 s may indicate a queue hold (e.g. Safe Attachments detonation).',
        { status: latencySeconds === null ? 'unavailable' : latencySeconds > 300 ? 'warn' : latencySeconds > 60 ? 'info' : 'pass' },
      ),
    },
    verdicts: {
      authentication: deriveAuthVerdict(verdictInput),
      disposition:    deriveDispositionVerdict(verdictInput),
      delivery:       deriveDeliveryVerdict(verdictInput),
    },
    deliveryPath: hops,
    authentication: {
      spf: {
        result: field('SPF result', primaryAr.spf ?? 'none', primaryAr.spf ?? null, 'A',
          primaryAr.spf === 'pass'
            ? `The connecting IP (${connectingIp}) is authorized to send email for ${spfDomain} per its SPF record.`
            : `SPF result: ${primaryAr.spf ?? 'none'}.`,
          { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-spf-configure', status: spfStatus }),
        record: dnsAvailable && spfRecord
          ? field('SPF record (live DNS)', spfRecord, spfRecord, 'A',
            `The TXT record at ${spfDomain} authorizing sending IP ranges. Fetched live from DNS.`, { status: 'pass' })
          : dnsAvailable
          ? field('SPF record (live DNS)', '(no SPF record found)', null, 'A',
            `No SPF TXT record found at ${spfDomain}.`, { status: 'fail' })
          : field('SPF record (live DNS)', '(DNS unavailable)', null, 'A',
            'DNS lookup failed or was blocked.', { status: 'unavailable' }),
        connectingIp: field('Connecting IP', connectingIp, connectingIp, 'A',
          'The IP address of the sending MTA that connected to the recipient EOP MX.', { status: 'neutral' }),
        cidrTest: cidrMatch
          ? field('IP-in-SPF CIDR test',
            `${cidrMatch.ip} ∈ ${cidrMatch.cidr}`,
            cidrMatch, 'A',
            `Independent CIDR membership check confirms the connecting IP falls within the authorized range. ${cidrMatch.lookupCount} DNS lookups used (RFC 7208 allows up to 10).`,
            { status: 'pass' })
          : undefined,
      },
      dkim: {
        result: field('DKIM result', primaryAr.dkim ?? 'none', primaryAr.dkim ?? null, 'A',
          primaryAr.dkim === 'pass'
            ? 'The receiving server verified the DKIM-Signature. Message body and signed headers were not altered in transit.'
            : `DKIM result: ${primaryAr.dkim ?? 'none'}.`,
          { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure', status: dkimStatus }),
        selector: field('DKIM selector', dkimSelector ?? '(unknown)', dkimSelector ?? null, 'A',
          dkimSelector
            ? `The DKIM selector identifies which public key to retrieve from DNS (${dkimSelector}._domainkey.${dkimDomain}).`
            : 'No DKIM selector found in DKIM-Signature header or Authentication-Results. DNS lookup skipped.',
          { status: dkimSelector ? 'info' : 'unavailable' }),
        domain: field('DKIM signing domain (d=)', dkimDomain, dkimDomain || null, 'A',
          'The domain that signed this message. For DMARC alignment, this must match or be a subdomain of the RFC 5322 From domain.',
          { status: dkimDomain === fromDomain ? 'pass' : 'warn' }),
        selectorDnsState: !dkimSelector
          ? field('Selector DNS state (live)', '(selector unknown)', null, 'B',
            'Cannot query DKIM selector record — no selector was present in DKIM-Signature or Authentication-Results.', { status: 'unavailable' })
          : dnsAvailable
          ? field('Selector DNS state (live)',
            `${dkimSelector}._domainkey.${dkimDomain} → ${dkimSelectorRecord ? 'TXT record exists, public key valid' : 'not found'}`,
            dkimSelectorRecord ? 'exists, valid (live DNS)' : null,
            'B',
            dkimSelectorRecord
              ? 'The DKIM public key record was queried live and is present and well-formed.'
              : 'No DKIM selector record found at this DNS name.',
            { status: dkimSelectorRecord ? 'pass' : 'warn' })
          : field('Selector DNS state (live)', '(DNS unavailable)', null, 'B',
            'DNS lookup failed or was blocked.', { status: 'unavailable' }),
      },
      dmarc: {
        result: field('DMARC result', primaryAr.dmarc ? `${primaryAr.dmarc}${primaryAr.dmarcAction ? ` action=${primaryAr.dmarcAction}` : ''}` : 'none',
          primaryAr.dmarc ?? null, 'A',
          primaryAr.dmarc === 'pass'
            ? 'DMARC passed — at least one identifier (SPF or DKIM) aligned with the RFC 5322 From domain.'
            : `DMARC result: ${primaryAr.dmarc ?? 'none'}.`,
          { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dmarc-configure', status: dmarcStatus }),
        policy: field('DMARC policy', dmarcLookup?.record ?? '(live DNS lookup)',
          dmarcLookup?.policy ?? null, 'A',
          dmarcLookup ? `DMARC policy at ${dmarcLookup.domain}: ${dmarcLookup.policy}.` : 'No DMARC record found via DNS.',
          { status: dmarcLookup ? 'info' : 'warn' }),
        orgDomain: dmarcLookup?.inherited ? field('Organizational domain',
          dmarcLookup.orgDomain, dmarcLookup.orgDomain, 'A',
          `No _dmarc TXT record at ${fromDomain}; DMARC policy inherited from org domain ${dmarcLookup.orgDomain} via Public Suffix List walk.`,
          { status: 'info' }) : undefined,
        inherited: dmarcLookup?.inherited ?? false,
        alignment: field('Identifier alignment',
          `dkim:${primaryAr.dkimDomain ?? dkimDomain} / spf:${envelopeFrom.split('@')[1] ?? '?'} vs From:${fromDomain}`,
          { spf: relaxedDomainMatch(envelopeFrom.split('@')[1]?.toLowerCase() ?? '', fromDomain), dkim: relaxedDomainMatch((primaryAr.dkimDomain ?? dkimDomain).toLowerCase(), fromDomain), mode: 'relaxed' },
          'A', 'Alignment check between SPF/DKIM domains and the RFC 5322 From domain.',
          { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dmarc-configure', status: primaryAr.dmarc === 'pass' ? 'pass' : 'warn' }),
      },
      compauth: field('Composite authentication (compauth)', `${caResult} reason=${caReason}`,
        { result: caResult, reason: caReason, reasonMeaning: caMeaning }, 'A',
        'Composite authentication combines SPF, DKIM, DMARC, and Microsoft implicit signals into a single verdict.',
        { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-anti-spoofing',
          status: caResult === 'pass' ? 'pass' : caResult === 'softpass' ? 'warn' : 'fail' }),
      arc: { sets: arcSetsForResult, overrodeAuthFailure: arcOverrode },
      authResultsStamps: stamps,
    },
    antiSpam: {
      forefront: forefrontFields,
      microsoftAntiSpam: msasFields,
      mailboxDelivery: mbdFields,
    },
    mdo: {
      safeLinks: field('Safe Links', mimeVer ? '(no Safe Links stamp present)' : '(no Safe Links stamp present)',
        false, 'B',
        'No Safe Links processing stamp found in this header. Safe Links rewrites URLs in the message body — evidence may only appear in URL click logs, not in headers.',
        { status: 'info' }),
      safeAttachments: field('Safe Attachments',
        hasAttach ? `X-MS-Has-Attach: ${hasAttach}` : '(no Safe Attachments stamp present)',
        hasAttach === 'yes', 'B',
        hasAttach === 'yes'
          ? 'X-MS-Has-Attach: yes — attachments were present. A delivery hold > 60 s in the hop timeline may indicate Safe Attachments detonation.'
          : 'X-MS-Has-Attach is absent — no attachments to scan.',
        { status: 'info' }),
    },
    context: {
      isExternal: field('External sender', fromEntity || authAs || '(derived)',
        isExternal, 'B',
        isExternal
          ? 'Sender is classified as external: FromEntityHeader=Internet or AuthAs=Anonymous or [EXTERNAL] subject prefix.'
          : 'Sender appears to be a Microsoft 365-hosted mailbox (FromEntityHeader: Hosted).',
        { status: isExternal ? 'warn' : 'neutral' }),
      directionality: field('Message directionality',
        direction || `DIR:${ff.DIR ?? '?'} in X-Forefront-Antispam-Report`,
        direction || (ff.DIR === 'INB' ? 'Inbound' : ff.DIR === 'OUT' ? 'Outbound' : ff.DIR ?? null),
        'A', 'Message flow direction relative to the recipient\'s organization.', { status: 'neutral' }),
      authAs: field('Authenticated as', authAs || '(not explicitly set)',
        authAs || null, 'B',
        authAs ? `X-MS-Exchange-Organization-AuthAs: ${authAs}.` : 'No explicit AuthAs header found.',
        { status: authAs === 'Anonymous' ? 'warn' : 'neutral' }),
      senderTenant: senderTenantRaw ? field('Sender tenant ID', senderTenantRaw, senderTenantRaw, 'B',
        'X-MS-Exchange-CrossTenant-Id — Azure AD tenant ID of the sending organization.', { status: 'info' }) : undefined,
    },
    sensitivityLabel,
    impersonation,
    thread: threadDecoded ? {
      rootTime: field('Conversation root time', threadIdx, toIso(threadDecoded.rootTime), 'A',
        'Derived from Thread-Index per [MS-OXOMSG] §2.2.1.3. The first 5 bytes encode a FILETIME — root time has ~minute resolution.',
        { docUrl: 'https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxomsg/9e994fbb-b839-495f-84e3-2c8dc41ea4b0',
          note: 'Root time resolution is ~1 minute due to FILETIME truncation.', status: 'neutral' }),
      replyDepth: field('Reply depth', threadIdx, threadDecoded.replyDepth, 'A',
        threadDecoded.replyDepth === 0
          ? 'This is the original message in its conversation thread, not a reply.'
          : `${threadDecoded.replyDepth} reply level(s) detected in the Thread-Index encoding.`,
        { status: 'neutral' }),
    } : undefined,
    attachments: field('Attachments',
      `X-MS-Has-Attach: ${hasAttach || '(empty)'}; Content-Type: ${contentType.split(';')[0]}`,
      { hasAttach: hasAttach === 'yes', contentType: contentType.split(';')[0].trim() }, 'A',
      hasAttach === 'yes' ? 'Attachments present (X-MS-Has-Attach: yes).' : 'No MIME attachments.', { status: 'neutral' }),
  };
}

// ── Relaxed DMARC identifier alignment (RFC 7489 §3.1) ────────────────────
// Org-domain without PSL: a matches b if equal or one is a subdomain of the other.
function relaxedDomainMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a === b || a.endsWith('.' + b) || b.endsWith('.' + a);
}

// ── Helper: parse address list ─────────────────────────────────────────────
function parseAddressList(raw: string, label: string, explanation: string): Field<string>[] {
  return raw.split(',').map(addr => addr.trim()).filter(Boolean).map(addr => ({
    label, raw: addr, value: addr, tier: 'A' as const, explanation, status: 'neutral' as const,
  }));
}

function toIso(d: Date): string {
  return d.toISOString().replace('.000Z', 'Z');
}

// ── Forefront field builder ────────────────────────────────────────────────
function buildForefrontFields(ff: ReturnType<typeof parseForefront>, _raw: string): Field<string>[] {
  const fields: Field<string>[] = [];
  const docBase = 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo';

  if (ff.SCL !== undefined) {
    const scl = parseInt(ff.SCL);
    fields.push(field('Spam Confidence Level (SCL)', ff.SCL, ff.SCL, 'A',
      `SCL ${ff.SCL}: ${scl <= 0 ? 'whitelisted' : scl <= 1 ? 'very low spam probability' : scl <= 4 ? 'low spam probability' : scl <= 6 ? 'spam threshold' : 'high spam confidence'}. Scale: -1 (whitelisted) to 9 (definite spam). SCL ≥ 5 typically routes to Junk.`,
      { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-spam-spam-confidence-level-scl-about',
        status: scl >= 5 ? 'fail' : scl >= 1 ? 'pass' : 'info' }));
  }
  if (ff.SFV) fields.push(field('Spam Filter Verdict (SFV)', ff.SFV, ff.SFV, 'A',
    sfvMeaning(ff.SFV), { docUrl: docBase, status: ff.SFV === 'NSPM' ? 'pass' : ff.SFV === 'SPM' ? 'fail' : 'info' }));
  if (ff.CAT) {
    const ci = catInfo(ff.CAT);
    fields.push(field('Threat Category (CAT)', ff.CAT, ff.CAT, 'A',
      `CAT:${ff.CAT} — ${ci.label}. Other values include PHSH (phishing), MALW (malware), SPOOF (spoofing), UIMP/DIMP (impersonation), BULK, etc.`,
      { docUrl: docBase, status: ci.status as Field<string>['status'] }));
  }
  if (ff.DIR) fields.push(field('Direction (DIR)', ff.DIR, ff.DIR, 'A',
    `${ff.DIR === 'INB' ? 'INB = Inbound' : ff.DIR === 'OUT' ? 'OUT = Outbound' : ff.DIR} — message flow direction.`, { docUrl: docBase, status: 'neutral' }));
  if (ff.IPV) fields.push(field('IP Verdict (IPV)', ff.IPV, ff.IPV, 'A',
    ipvMeaning(ff.IPV), { docUrl: docBase, status: ff.IPV === 'CAL' ? 'info' : 'neutral' }));
  if (ff.CTRY) fields.push(field('Country (CTRY)', ff.CTRY, ff.CTRY, 'A',
    'Country/region inferred from the connecting IP address geolocation.', { status: 'neutral' }));
  if (ff.PTR) fields.push(field('PTR record (reverse DNS)', ff.PTR, ff.PTR, 'A',
    'The reverse DNS (PTR) record of the connecting IP.',
    { status: ff.PTR?.includes('outbound.protection.outlook.com') ? 'pass' : 'neutral' }));
  if (ff.H) fields.push(field('HELO/EHLO string (H)', ff.H, ff.H, 'A',
    'The hostname the sending MTA presented in its SMTP EHLO/HELO command.', { status: 'neutral' }));
  if (ff.CIP) fields.push(field('Connecting IP (CIP)', ff.CIP, ff.CIP, 'A',
    'The connecting IP as recorded in X-Forefront-Antispam-Report. Should match the IP in Authentication-Results.', { status: 'neutral' }));
  return fields;
}

function buildMsasFields(raw: string, bcl: string): Field<string>[] {
  if (!raw) return [];
  const bclNum = parseInt(bcl);
  return [
    field('Bulk Confidence Level (BCL)', bcl, bcl, 'A',
      `BCL ${bcl}: ${bclNum === 0 ? 'not a bulk sender' : bclNum <= 3 ? 'low bulk probability' : bclNum <= 7 ? 'bulk sender' : 'very high bulk confidence'}. Scale 1–9; BCL ≥ 4 is typically considered bulk mail.`,
      { docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-spam-bulk-complaint-level-bcl-about',
        status: bclNum >= 7 ? 'fail' : bclNum >= 4 ? 'warn' : 'pass' }),
  ];
}

function buildMbdFields(mbd: ReturnType<typeof parseMailboxDelivery>, raw: string): Field<string>[] {
  if (!raw) return [];
  const fields: Field<string>[] = [];

  if (mbd.dest !== undefined) {
    const di = destInfo(mbd.dest);
    fields.push(field('Mailbox destination (dest)', mbd.dest, mbd.dest, 'C', di.meaning,
      { status: di.status as Field<string>['status'],
        note: 'The dest field is widely observed but not officially documented by Microsoft. This interpretation reflects broad community consensus.' }));
  }
  if (mbd.ucf !== undefined) fields.push(field('User Controlled Filtering (ucf)', mbd.ucf, mbd.ucf, 'D',
    `ucf:${mbd.ucf} — ${mbd.ucf === '0' ? 'no user-level filtering (safe/blocked senders, Outlook rules) affected delivery.' : 'user preferences influenced placement.'}`,
    { note: 'Undocumented field.', status: 'neutral' }));
  if (mbd.jmr !== undefined) fields.push(field('Junk Mail Rule (jmr)', mbd.jmr, mbd.jmr, 'D',
    `jmr:${mbd.jmr} — ${mbd.jmr === '0' ? 'no junk mail routing logic was triggered.' : 'junk mail rule was triggered.'}`,
    { note: 'Undocumented field.', status: 'neutral' }));
  if (mbd.auth !== undefined) fields.push(field('Auth contribution (auth)', mbd.auth, mbd.auth, 'D',
    `auth:${mbd.auth} — ${mbd.auth === '1' ? 'authentication signals contributed positively to delivery decision.' : 'no positive auth contribution.'}`,
    { note: 'Undocumented field.', status: mbd.auth === '1' ? 'pass' : 'neutral' }));
  if (mbd.OFR) fields.push(field('Override reason (OFR)', mbd.OFR, mbd.OFR, 'D',
    `OFR:${mbd.OFR} — override reason applied at mailbox delivery. SpamFilterAuthJ indicates delivery was influenced by authentication-based filtering outcomes.`,
    { note: 'Undocumented field.', status: 'info' }));
  if (mbd.kl !== undefined) fields.push(field('Block-list match (kl)', mbd.kl, mbd.kl, 'D',
    `kl:${mbd.kl} — ${mbd.kl === '0' ? 'no block-list (blocked sender / blocked domain) match.' : 'block-list match detected.'}`,
    { note: 'Undocumented field.', status: mbd.kl === '0' ? 'neutral' : 'fail' }));
  if (mbd.wl !== undefined) fields.push(field('Allow-list match (wl)', mbd.wl, mbd.wl, 'D',
    `wl:${mbd.wl} — ${mbd.wl === '0' ? 'no allow-list (safe sender / safe domain) match at org level.' : 'allow-list match.'}`,
    { note: 'Undocumented field.', status: 'neutral' }));
  if (mbd.pcwl !== undefined) fields.push(field('Policy controlled allow-list (pcwl)', mbd.pcwl, mbd.pcwl, 'D',
    `pcwl:${mbd.pcwl} — policy-controlled allow-list match status.`,
    { note: 'Undocumented field.', status: 'neutral' }));

  return fields;
}
