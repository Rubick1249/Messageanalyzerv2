import type { AnalysisResult } from '@/lib/types';

const RAW = `Received: from DB9PR04MB9438.eurprd04.prod.outlook.com (2603:10a6:10:3af::20)
 by AM9PR04MB8571.eurprd04.prod.outlook.com with HTTPS; Tue, 20 Feb 2024 14:35:18 +0000
Received: from AM8PR04CA0060.eurprd04.prod.outlook.com (2603:10a6:20b:223::17)
 by DB9PR04MB9438.eurprd04.prod.outlook.com (2603:10a6:10:3af::20) with Microsoft
 SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id
 15.20.7292.30; Tue, 20 Feb 2024 14:35:17 +0000
Received: from AM7EUR03FT045.eop-eur03.prod.protection.outlook.com
 (2603:10a6:20b:223:cafe::5a) by AM8PR04CA0060.outlook.office365.com
 (2603:10a6:20b:223::17) with Microsoft SMTP Server (version=TLS1_2,
 cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.7292.30 via Frontend
 Transport; Tue, 20 Feb 2024 14:35:15 +0000
Authentication-Results: spf=pass (sender IP is 203.0.113.45)
 smtp.mailfrom=marico.com; dkim=pass (signature was verified)
 header.d=marico.com;dmarc=pass action=none
 header.from=marico.com;compauth=pass reason=100
ARC-Seal: i=1; a=rsa-sha256; s=arcselector9901; d=microsoft.com; cv=none;
 b=ArcSealBase64ValueForDemonstrationPurposesOnly==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=microsoft.com;
 s=arcselector9901; h=From:Date:Subject:Message-ID:Content-Type:MIME-Version;
 bh=ArcMsgSigHashValueForDemoOnly==;
 b=ArcMsgSigBase64ValueForDemonstrationPurposesOnly==
ARC-Authentication-Results: i=1; mx.microsoft.com 1; spf=pass
 smtp.mailfrom=marico.com; dmarc=pass action=none header.from=marico.com;
 dkim=pass header.d=marico.com; arc=none
X-MS-Exchange-Organization-ARC-Result: arc=pass oda=1 ltdi=1
X-MS-Exchange-Authentication-Results: spf=pass (sender IP is 203.0.113.45)
 smtp.mailfrom=marico.com; dkim=none (message not signed);
 dmarc=none (no dmarc record for marico.com);compauth=softpass reason=305
Received-SPF: Pass (protection.outlook.com: domain of marico.com designates
 203.0.113.45 as permitted sender) receiver=protection.outlook.com;
 client-ip=203.0.113.45; helo=mail.marico.com;
Received: from mail.marico.com (203.0.113.45) by
 AM7EUR03FT045.eop-eur03.prod.protection.outlook.com (2603:10a6:20b:fff::5a)
 with Microsoft SMTP Server id 15.20.7292.28 via Frontend Transport;
 Tue, 20 Feb 2024 14:35:11 +0000
X-Forefront-Antispam-Report:
 CIP:203.0.113.45;CTRY:AU;LANG:en;SCL:1;SRV:;IPV:NLI;SFV:NSPM;H:mail.marico.com;PTR:mail.marico.com;CAT:NONE;SFS:(13230031)(7916004)(376014)(1800799022)(38070700009)(82310400014);DIR:INB;SFTY:;BCL:0;
X-Microsoft-Antispam: BCL:0;ARA:13230031|7916004|376014|1800799022|38070700009;
X-Microsoft-Antispam-Mailbox-Delivery: ucf:0;jmr:0;auth:1;dest:I;wl:0;pcwl:0;kl:0;OFR:SpamFilterAuthJ;ENG:(910001)(944506478)(944626604)(920097)(930097)(140003);
MSIP_Labels: MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_Enabled=True;
  MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_SetDate=2024-02-20T14:30:00Z;
  MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_Method=Privileged;
  MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_Name=Official - IT;
  MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_SiteId=aabbccdd-1234-5678-abcd-aabbccdd1234;
  MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_ActionId=99998888-7777-6666-5555-444433332222;
  MSIP_Label_3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71_ContentBits=4
X-MS-Exchange-Organization-MessageDirectionality: Incoming
X-MS-Exchange-CrossTenant-FromEntityHeader: Internet
X-MS-Exchange-Organization-AuthAs: Anonymous
X-MS-Has-Attach: yes
X-MS-Exchange-Organization-Network-Message-Id: DB9PR04MB9438BBBB222222222222BBBB
Thread-Index: AQHaKQz3mBpRlX5tiFH7YnT8wCe4Dw==
Message-ID: <CAB7xYz9Q1wReTuVs3O@mail.marico.com>
From: IT Support <support@marico.com>
To: bob@contoso.com
Cc: alice@contoso.com
Subject: [EXTERNAL] Action required: Update your IT credentials by Friday
Date: Tue, 20 Feb 2024 14:32:07 +0000
Content-Type: multipart/mixed; boundary="----=_Part_1234_5678.9012"
MIME-Version: 1.0`.trim();

export const fixture2: AnalysisResult = {
  rawHeaders: RAW,
  dnsAvailable: true,

  meta: {
    subject: {
      label: 'Subject',
      raw: '[EXTERNAL] Action required: Update your IT credentials by Friday',
      value: '[EXTERNAL] Action required: Update your IT credentials by Friday',
      tier: 'A',
      explanation: 'The [EXTERNAL] prefix was added by Microsoft 365 external sender tagging policy, indicating this message originated outside the organization.',
      status: 'warn',
    },
    messageId: {
      label: 'Message-ID',
      raw: '<CAB7xYz9Q1wReTuVs3O@mail.marico.com>',
      value: '<CAB7xYz9Q1wReTuVs3O@mail.marico.com>',
      tier: 'A',
      explanation: 'RFC 5322 Message-ID assigned by the sender\'s MTA (mail.marico.com).',
      status: 'neutral',
    },
    networkMessageId: {
      label: 'Network Message ID',
      raw: 'DB9PR04MB9438BBBB222222222222BBBB',
      value: 'DB9PR04MB9438BBBB222222222222BBBB',
      tier: 'B',
      explanation: 'Microsoft-assigned identifier. Use this in Exchange Admin Center Message Trace or Microsoft Defender Threat Explorer to look up processing details, quarantine events, and SafeLinks click logs.',
      docUrl: 'https://learn.microsoft.com/en-us/exchange/monitoring/trace-an-email-message/run-a-message-trace-and-view-results',
      status: 'info',
    },
    fromHeader: {
      label: 'From (P2 / 5322.From)',
      raw: 'IT Support <support@marico.com>',
      value: 'IT Support <support@marico.com>',
      tier: 'A',
      explanation: 'The RFC 5322 From header. Display name is "IT Support" — a generic, authority-sounding name often used in phishing. The actual email domain is marico.com.',
      status: 'warn',
    },
    envelopeFrom: {
      label: 'Envelope From (P1 / 5321.MailFrom)',
      raw: 'support@marico.com',
      value: 'support@marico.com',
      tier: 'A',
      explanation: 'The SMTP MAIL FROM envelope address. Matches the From header domain (marico.com), so no MailFrom/From mismatch.',
      status: 'neutral',
    },
    to: [{
      label: 'To',
      raw: 'bob@contoso.com',
      value: 'bob@contoso.com',
      tier: 'A',
      explanation: 'Primary recipient.',
      status: 'neutral',
    }],
    cc: [{
      label: 'Cc',
      raw: 'alice@contoso.com',
      value: 'alice@contoso.com',
      tier: 'A',
      explanation: 'Carbon copy recipient.',
      status: 'neutral',
    }],
    creationTime: {
      label: 'Date',
      raw: 'Tue, 20 Feb 2024 14:32:07 +0000',
      value: '2024-02-20T14:32:07Z',
      tier: 'A',
      explanation: 'RFC 5322 Date header from the sender.',
      status: 'neutral',
    },
    endToEndLatencySeconds: {
      label: 'End-to-end latency',
      raw: '191s (14:32:07 → 14:35:18)',
      value: 191,
      tier: 'A',
      explanation: 'Time elapsed from RFC 5322 Date to final Received timestamp. 191 seconds is within normal range for messages that traverse external MTAs and undergo Safe Attachments detonation.',
      status: 'warn',
    },
  },

  verdicts: {
    authentication: {
      state: 'Authenticated & aligned',
      status: 'pass',
      evidence: [
        'spf=pass (203.0.113.45 is authorized by marico.com SPF record)',
        'dkim=pass (selector1._domainkey.marico.com verified)',
        'dmarc=pass action=none',
        'compauth=pass reason=100',
        'ARC chain: arc=pass oda=1 ltdi=1 (trusted ARC sealer — see ARC section)',
      ],
    },
    disposition: {
      state: 'Not spam',
      status: 'pass',
      evidence: ['SCL:1', 'SFV:NSPM', 'CAT:NONE', 'BCL:0'],
    },
    delivery: {
      state: 'Inbox',
      status: 'pass',
      evidence: ['dest:I (Inbox)', 'OFR:SpamFilterAuthJ (auth-based filter outcome)', 'No block-list match (kl:0)'],
    },
  },

  deliveryPath: [
    {
      index: 0,
      from: 'mail.marico.com (203.0.113.45)',
      by: 'AM7EUR03FT045.eop-eur03.prod.protection.outlook.com',
      with: 'Microsoft SMTP Server',
      tls: undefined,
      delaySeconds: 4,
      role: 'recipient-ingress',
      owner: 'Microsoft 365 EOP (recipient-side MX)',
      region: 'Europe',
    },
    {
      index: 1,
      from: 'AM7EUR03FT045.eop-eur03.prod.protection.outlook.com',
      by: 'AM8PR04CA0060.outlook.office365.com',
      with: 'Microsoft SMTP Server',
      tls: 'TLS1_2 / TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      delaySeconds: 2,
      role: 'internal-transport',
      owner: 'Microsoft 365 (internal mailbox transport)',
      region: 'Europe',
    },
    {
      index: 2,
      from: 'AM8PR04CA0060.eurprd04.prod.outlook.com',
      by: 'DB9PR04MB9438.eurprd04.prod.outlook.com',
      with: 'Microsoft SMTP Server',
      tls: 'TLS1_2 / TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      delaySeconds: 183,
      role: 'internal-transport',
      owner: 'Microsoft 365 (Safe Attachments detonation hold)',
      region: 'Europe',
    },
    {
      index: 3,
      from: 'DB9PR04MB9438.eurprd04.prod.outlook.com',
      by: 'AM9PR04MB8571.eurprd04.prod.outlook.com',
      with: 'HTTPS',
      delaySeconds: 1,
      role: 'final-delivery',
      owner: 'Microsoft 365 (mailbox delivery)',
      region: 'Europe',
    },
  ],

  authentication: {
    spf: {
      result: {
        label: 'SPF result',
        raw: 'pass',
        value: 'pass',
        tier: 'A',
        explanation: 'The connecting IP (203.0.113.45) is authorized to send email for marico.com per its SPF record.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-spf-configure',
        status: 'pass',
      },
      record: {
        label: 'SPF record (live DNS)',
        raw: 'v=spf1 ip4:203.0.113.0/24 include:_spf.marico.com ~all',
        value: 'v=spf1 ip4:203.0.113.0/24 include:_spf.marico.com ~all',
        tier: 'A',
        explanation: 'The SPF TXT record at marico.com authorizes the 203.0.113.0/24 range. Note the softfail (~all) qualifier — SPF failures would be softfailed, not hard-rejected.',
        status: 'pass',
      },
      connectingIp: {
        label: 'Connecting IP',
        raw: '203.0.113.45',
        value: '203.0.113.45',
        tier: 'A',
        explanation: 'The IP address of the external MTA that connected to the recipient\'s EOP MX endpoint.',
        status: 'neutral',
      },
      cidrTest: {
        label: 'IP-in-SPF CIDR test',
        raw: '203.0.113.45 ∈ 203.0.113.0/24',
        value: { ip: '203.0.113.45', cidr: '203.0.113.0/24', match: true, lookupCount: 2 },
        tier: 'A',
        explanation: 'Independent CIDR check confirms the connecting IPv4 address falls within the authorized /24 range. 2 DNS lookups used.',
        status: 'pass',
      },
    },
    dkim: {
      result: {
        label: 'DKIM result',
        raw: 'pass',
        value: 'pass',
        tier: 'A',
        explanation: 'DKIM signature verified — the message body and signed headers were not altered in transit from marico.com.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure',
        status: 'pass',
      },
      selector: {
        label: 'DKIM selector',
        raw: 'selector1',
        value: 'selector1',
        tier: 'A',
        explanation: 'Standard selector name. The public key was retrieved from selector1._domainkey.marico.com to verify the signature.',
        status: 'neutral',
      },
      domain: {
        label: 'DKIM signing domain (d=)',
        raw: 'marico.com',
        value: 'marico.com',
        tier: 'A',
        explanation: 'The domain that signed this message matches the RFC 5322 From domain (marico.com), satisfying DMARC DKIM alignment.',
        status: 'pass',
      },
      selectorDnsState: {
        label: 'Selector DNS state (live)',
        raw: 'selector1._domainkey.marico.com → TXT record exists',
        value: 'exists',
        tier: 'B',
        explanation: 'The DKIM selector record was found in live DNS. The key has not been rotated or revoked since this message was received.',
        status: 'pass',
      },
    },
    dmarc: {
      result: {
        label: 'DMARC result',
        raw: 'pass action=none',
        value: 'pass',
        tier: 'A',
        explanation: 'DMARC passed via DKIM alignment (d=marico.com aligns with From: marico.com). The ARC chain also preserved passing auth results from before any forwarding.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dmarc-configure',
        status: 'pass',
      },
      policy: {
        label: 'DMARC policy',
        raw: 'v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@marico.com',
        value: 'p=quarantine',
        tier: 'A',
        explanation: 'The DMARC policy for marico.com is quarantine. This message passed DMARC so the policy was not applied.',
        status: 'info',
      },
      orgDomain: undefined,
      inherited: false,
      alignment: {
        label: 'Identifier alignment',
        raw: 'DKIM-aligned (relaxed): d=marico.com = From: marico.com',
        value: { spf: true, dkim: true, mode: 'relaxed' },
        tier: 'A',
        explanation: 'Both SPF and DKIM aligned with the From domain (marico.com). Relaxed mode was used (default). Either alignment alone would satisfy DMARC.',
        status: 'pass',
      },
    },
    compauth: {
      label: 'Composite authentication (compauth)',
      raw: 'pass reason=100',
      value: {
        result: 'pass',
        reason: '100',
        reasonMeaning: 'Message passed explicit authentication — the From domain\'s SPF and DKIM records both passed and are aligned with the From header.',
      },
      tier: 'A',
      explanation: 'Composite authentication result. Reason 100 = explicit SPF + DKIM pass with alignment. Note: one secondary stamp shows softpass/305 — see the Auth Reconciliation section for the discrepancy.',
      docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-anti-spoofing',
      status: 'pass',
    },
    arc: {
      sets: [
        {
          instance: 1,
          cv: {
            label: 'ARC chain validation (cv)',
            raw: 'cv=none',
            value: 'none',
            tier: 'A',
            explanation: 'cv=none on the first ARC set means there was no prior ARC chain to validate — this is the first ARC seal in the chain. Later sets would show cv=pass or cv=fail.',
            docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-arc-use',
            status: 'info',
          },
          oda: {
            label: 'Override decision applied (oda)',
            raw: '1',
            value: '1',
            tier: 'D',
            explanation: 'oda=1 — the ARC result was used to override what would otherwise have been an authentication failure. The message was forwarded through an intermediary that broke DMARC alignment, but a trusted ARC sealer vouched for the original authentication. (Tier D: undocumented Microsoft-internal field — best-effort gloss.)',
            note: 'Undocumented field. Community interpretation; Microsoft has not published official documentation for oda.',
            status: 'info',
          },
          ltdi: {
            label: 'Trusted ARC sealer (ltdi)',
            raw: '1',
            value: '1',
            tier: 'D',
            explanation: 'ltdi=1 — the ARC sealer is in Microsoft\'s trusted-sealer list (local-trusted-domain indicator). Combined with oda=1: this message would have failed authentication after forwarding, but because a trusted ARC sealer sealed the original passing authentication, Microsoft EOP honored that chain. (Tier D: undocumented.)',
            note: 'Undocumented field. Community-interpreted as "local-trusted-domain indicator."',
            status: 'info',
          },
          preservedAuth: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
        },
      ],
      overrodeAuthFailure: true,
    },
    authResultsStamps: [
      {
        source: 'EOP recipient-side (AM7EUR03FT045) — Authentication-Results',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        compauth: 'pass reason=100',
        discrepancy: false,
        raw: 'spf=pass (sender IP is 203.0.113.45) smtp.mailfrom=marico.com; dkim=pass (signature was verified) header.d=marico.com;dmarc=pass action=none header.from=marico.com;compauth=pass reason=100',
      },
      {
        source: 'ARC-Authentication-Results (i=1, Microsoft)',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        compauth: undefined,
        discrepancy: false,
        raw: 'spf=pass smtp.mailfrom=marico.com; dmarc=pass action=none header.from=marico.com; dkim=pass header.d=marico.com; arc=none',
      },
      {
        source: 'X-MS-Exchange-Authentication-Results (secondary stamp)',
        spf: 'pass',
        dkim: 'none',
        dmarc: 'none',
        compauth: 'softpass reason=305',
        discrepancy: true,
        raw: 'spf=pass (sender IP is 203.0.113.45) smtp.mailfrom=marico.com; dkim=none (message not signed); dmarc=none (no dmarc record for marico.com);compauth=softpass reason=305',
      },
    ],
  },

  antiSpam: {
    forefront: [
      {
        label: 'Spam Confidence Level (SCL)',
        raw: '1',
        value: '1',
        tier: 'A',
        explanation: 'SCL 1 = very low spam probability.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-spam-spam-confidence-level-scl-about',
        status: 'pass',
      },
      {
        label: 'Spam Filter Verdict (SFV)',
        raw: 'NSPM',
        value: 'NSPM',
        tier: 'A',
        explanation: 'NSPM = Not Spam.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'pass',
      },
      {
        label: 'Threat Category (CAT)',
        raw: 'NONE',
        value: 'NONE',
        tier: 'A',
        explanation: 'No threat category. Note: the generic display name and external tag suggest a BEC pattern — see the Impersonation section for a synthesized risk assessment.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'pass',
      },
      {
        label: 'Direction (DIR)',
        raw: 'INB',
        value: 'INB',
        tier: 'A',
        explanation: 'INB = Inbound message from an external sender.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'neutral',
      },
      {
        label: 'IP Verdict (IPV)',
        raw: 'NLI',
        value: 'NLI',
        tier: 'A',
        explanation: 'NLI = Not Listed. The connecting IP (203.0.113.45) is not on any allow or block list. Standard reputation evaluation was applied.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'neutral',
      },
      {
        label: 'Country (CTRY)',
        raw: 'AU',
        value: 'AU',
        tier: 'A',
        explanation: 'Connecting IP geolocates to Australia.',
        status: 'neutral',
      },
      {
        label: 'PTR record (reverse DNS)',
        raw: 'mail.marico.com',
        value: 'mail.marico.com',
        tier: 'A',
        explanation: 'Reverse DNS matches the HELO hostname (mail.marico.com), a good sign of a legitimately-configured mail server.',
        status: 'pass',
      },
      {
        label: 'HELO/EHLO string (H)',
        raw: 'mail.marico.com',
        value: 'mail.marico.com',
        tier: 'A',
        explanation: 'The sender\'s MTA identified itself as mail.marico.com.',
        status: 'neutral',
      },
    ],
    microsoftAntiSpam: [
      {
        label: 'Bulk Confidence Level (BCL)',
        raw: '0',
        value: '0',
        tier: 'A',
        explanation: 'BCL 0 = not a bulk sender.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-spam-bulk-complaint-level-bcl-about',
        status: 'pass',
      },
    ],
    mailboxDelivery: [
      {
        label: 'Mailbox destination (dest)',
        raw: 'I',
        value: 'I',
        tier: 'C',
        explanation: 'dest:I = Inbox. The mailbox-level decision routed this message to the Inbox despite the external tag and display-name mismatch.',
        note: 'Not officially documented by Microsoft. Widely observed community interpretation.',
        status: 'pass',
      },
      {
        label: 'Outcome Filtering Reason (OFR)',
        raw: 'OFR:SpamFilterAuthJ',
        value: 'OFR:SpamFilterAuthJ',
        tier: 'D',
        explanation: 'A short label summarizing the mailbox-level filtering decision. "SpamFilterAuthJ" suggests the auth-based spam filter produced a Junk-adjacent signal that was ultimately overridden to Inbox. Exact semantics are not publicly documented.',
        note: 'Undocumented field. The field name itself (Outcome Filtering Reason) is a best-effort interpretation.',
        status: 'neutral',
      },
      {
        label: 'User Controlled Filtering (ucf)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'ucf:0 — no user-level filtering affected delivery.',
        note: 'Undocumented field.',
        status: 'neutral',
      },
      {
        label: 'Junk Mail Rule (jmr)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'jmr:0 — junk mail routing logic was not triggered at the mailbox level.',
        note: 'Undocumented field.',
        status: 'neutral',
      },
      {
        label: 'Auth contribution (auth)',
        raw: '1',
        value: '1',
        tier: 'D',
        explanation: 'auth:1 — authentication signals contributed positively to the mailbox decision.',
        note: 'Undocumented field.',
        status: 'pass',
      },
      {
        label: 'Allow list match (wl)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'wl:0 — sender is not on a tenant or user allow list (safe-senders list). The message reached Inbox based on spam filter verdict, not an explicit allow.',
        note: 'Undocumented field.',
        status: 'neutral',
      },
      {
        label: 'Per-contact allow list (pcwl)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'pcwl:0 — no prior interaction history between the recipient and this sender was used to build an implicit allow. Useful to distinguish "first contact" scenarios.',
        note: 'Undocumented field.',
        status: 'neutral',
      },
      {
        label: 'Block list match (kl)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'kl:0 — the sender is not on a known/blocked list. kl:1 would indicate an explicit block matched.',
        note: 'Undocumented field.',
        status: 'pass',
      },
    ],
  },

  mdo: {
    safeLinks: {
      label: 'Safe Links',
      raw: 'SL (from X-Forefront-Antispam-Report SFS flags)',
      value: true,
      tier: 'B',
      explanation: 'Safe Links processing was applied to URLs in this message. Any links the recipient clicks will be checked in real-time against Microsoft\'s threat intelligence before the destination is loaded.',
      docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/safe-links-about',
      status: 'info',
    },
    safeAttachments: {
      label: 'Safe Attachments',
      raw: 'SA (from X-Forefront-Antispam-Report SFS flags); X-MS-Has-Attach: yes',
      value: true,
      tier: 'B',
      explanation: 'Safe Attachments detonation was applied. The 183-second hold in the delivery path (hop 2→3) is consistent with Safe Attachments sandboxing. Attachments were cleared for delivery.',
      docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/safe-attachments-about',
      status: 'info',
    },
  },

  context: {
    isExternal: {
      label: 'External sender',
      raw: 'X-MS-Exchange-CrossTenant-FromEntityHeader: Internet; X-MS-Exchange-Organization-AuthAs: Anonymous; [EXTERNAL] in subject',
      value: true,
      tier: 'B',
      explanation: 'Three signals confirm this is an external sender: FromEntityHeader=Internet (not a Microsoft 365 hosted mailbox), AuthAs=Anonymous (sender did not authenticate with the recipient tenant), and the [EXTERNAL] prefix added to the subject by tenant policy.',
      status: 'warn',
    },
    directionality: {
      label: 'Message directionality',
      raw: 'X-MS-Exchange-Organization-MessageDirectionality: Incoming',
      value: 'Incoming',
      tier: 'B',
      explanation: 'Confirmed by the explicit MessageDirectionality header — this message traveled from the Internet into the recipient\'s Microsoft 365 mailbox.',
      status: 'neutral',
    },
    authAs: {
      label: 'Authenticated as',
      raw: 'X-MS-Exchange-Organization-AuthAs: Anonymous',
      value: 'Anonymous',
      tier: 'B',
      explanation: 'AuthAs: Anonymous means the sender did not authenticate with the recipient\'s Microsoft 365 tenant. External Internet senders are always Anonymous from the recipient org\'s perspective, even if they authenticate with their own domain via SPF/DKIM.',
      status: 'warn',
    },
    senderTenant: undefined,
    recipientTenant: undefined,
  },

  sensitivityLabel: {
    name: {
      label: 'Label name',
      raw: 'Official - IT',
      value: 'Official - IT',
      tier: 'B',
      explanation: 'The Microsoft Purview Information Protection sensitivity label applied to this message by the sender\'s organization.',
      status: 'info',
    },
    guid: {
      label: 'Label GUID',
      raw: '3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71',
      value: '3e4b2c1a-f7d9-4e56-b023-8c1a9d4f2e71',
      tier: 'B',
      explanation: 'The unique identifier for this sensitivity label within the sender\'s tenant. Can be used to cross-reference in the Microsoft Purview compliance portal.',
      status: 'neutral',
    },
    enabled: {
      label: 'Label enabled',
      raw: 'True',
      value: true,
      tier: 'B',
      explanation: 'Enabled=True confirms the label is actively applied (not a stale or removed label artifact).',
      status: 'pass',
    },
    setDate: {
      label: 'Label set date',
      raw: '2024-02-20T14:30:00Z',
      value: '2024-02-20T14:30:00Z',
      tier: 'B',
      explanation: 'The timestamp when the sensitivity label was applied. This is approximately 2 minutes before the message was sent (Date: 14:32), consistent with the sender\'s email client applying the label before transmission.',
      status: 'neutral',
    },
    method: {
      label: 'Application method',
      raw: 'Privileged',
      value: 'Privileged',
      tier: 'B',
      explanation: 'Method=Privileged indicates the label was applied by an administrator or an automated privileged process (e.g., auto-labeling policy), rather than by the end user manually selecting it.',
      status: 'info',
    },
    contentBits: {
      label: 'ContentBits',
      raw: '4',
      value: '4',
      tier: 'B',
      explanation: 'A bitmask encoding content-marking actions (headers, footers, watermarks) associated with the label. Value 4 suggests visual marking was applied. The individual bit semantics are documented in the Azure Information Protection SDK but individual bit meanings may vary by configuration.',
      note: 'ContentBits individual bit semantics are documented but partially soft — values are deployment-dependent (Tier B).',
      status: 'neutral',
    },
    siteId: {
      label: 'Sender site/tenant ID',
      raw: 'aabbccdd-1234-5678-abcd-aabbccdd1234',
      value: 'aabbccdd-1234-5678-abcd-aabbccdd1234',
      tier: 'B',
      explanation: 'The Azure AD tenant ID of the organization that applied this sensitivity label. Can be used to identify the sending tenant for cross-tenant investigation.',
      status: 'neutral',
    },
  },

  impersonation: {
    displayNameVsFrom: {
      label: 'Display name vs. From address',
      raw: '"IT Support" <support@marico.com>',
      value: 'Display name "IT Support" is a generic authority-sounding name associated with an external domain (marico.com). Recipients may assume this is their internal IT department.',
      tier: 'A',
      explanation: 'The display name "IT Support" does not correspond to any domain in the organization. This is a classic BEC (Business Email Compromise) pattern: attacker uses a role-based display name to appear internal while using an external domain.',
      status: 'warn',
    },
    domainLookalike: {
      label: 'Lookalike / homoglyph domain',
      raw: 'marico.com',
      value: false,
      tier: 'A',
      explanation: 'No homoglyph or lookalike patterns detected in marico.com. The domain does not closely resemble the recipient\'s domain or any known brand.',
      status: 'neutral',
    },
    firstContact: {
      label: 'First contact (SFTY 9.25)',
      raw: '(no SFTY:9.25 present)',
      value: false,
      tier: 'A',
      explanation: 'No first-contact safety tip. The recipient may have received email from marico.com before, or the tenant policy may not surface this tip.',
      status: 'neutral',
    },
    catValues: {
      label: 'Impersonation CAT flags',
      raw: 'CAT:NONE',
      value: [],
      tier: 'A',
      explanation: 'No explicit impersonation CAT was raised (UIMP/DIMP/SPOOF not present). The risk here is behavioral (display name pattern + external + credential-request subject) rather than a detected domain spoof.',
      status: 'neutral',
    },
    externalFlag: {
      label: '[EXTERNAL] tag applied',
      raw: '[EXTERNAL] in subject; X-MS-Exchange-CrossTenant-FromEntityHeader: Internet',
      value: true,
      tier: 'B',
      explanation: 'Microsoft 365 external sender tagging added [EXTERNAL] to the subject. This is a user-facing signal that the message did not originate from within the recipient\'s organization.',
      status: 'warn',
    },
    riskLevel: 'medium',
  },

  thread: {
    rootTime: {
      label: 'Conversation root time',
      raw: 'AQHaKQz3mBpRlX5tiFH7YnT8wCe4Dw==',
      value: '2024-02-20T14:32:00Z',
      tier: 'A',
      explanation: 'Derived from Thread-Index per [MS-OXOMSG] §2.2.1.3. Root time has ~minute resolution due to FILETIME truncation.',
      docUrl: 'https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxomsg/9e994fbb-b839-495f-84e3-2c8dc41ea4b0',
      note: 'Root time resolution is ~1 minute due to FILETIME truncation in Thread-Index encoding.',
      status: 'neutral',
    },
    replyDepth: {
      label: 'Reply depth',
      raw: 'AQHaKQz3mBpRlX5tiFH7YnT8wCe4Dw==',
      value: 2,
      tier: 'A',
      explanation: '2 additional 5-byte response-level blocks found — this message is the second reply in its conversation thread.',
      status: 'neutral',
    },
  },

  attachments: {
    label: 'Attachments',
    raw: 'X-MS-Has-Attach: yes; Content-Type: multipart/mixed',
    value: { hasAttach: true, contentType: 'multipart/mixed' },
    tier: 'A',
    explanation: 'X-MS-Has-Attach: yes confirms attachments were present. Content-Type multipart/mixed is the standard MIME structure for messages with file attachments. Safe Attachments detonation was applied (see MDO section).',
    status: 'warn',
  },
};
