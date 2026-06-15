import type { AnalysisResult } from '@/lib/types';

const RAW = `Received: from BN2PR04MB6831.namprd04.prod.outlook.com (2603:10b6:404:e0::22)
 by SG2PR04MB5954.apcprd04.prod.outlook.com with HTTPS; Mon, 15 Jan 2024 09:00:42 +0000
Received: from MN2PR04CA0012.namprd04.prod.outlook.com (2603:10b6:208:233::17)
 by BN2PR04MB6831.namprd04.prod.outlook.com (2603:10b6:404:e0::22) with Microsoft
 SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id
 15.20.7219.20; Mon, 15 Jan 2024 09:00:40 +0000
Received: from SG2APC01FT034.eop-apc01.prod.protection.outlook.com
 (2603:10b6:208:233:cafe::11) by MN2PR04CA0012.outlook.office365.com
 (2603:10b6:208:233::17) with Microsoft SMTP Server (version=TLS1_2,
 cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.7219.20 via Frontend
 Transport; Mon, 15 Jan 2024 09:00:38 +0000
Authentication-Results: spf=pass (sender IP is 2a01:111:f403:c101::7)
 smtp.mailfrom=techsupport.microsoft.com; dkim=pass (signature was verified)
 header.d=techsupport.microsoft.com;dmarc=pass action=none
 header.from=techsupport.microsoft.com;compauth=pass reason=100
Received-SPF: Pass (protection.outlook.com: domain of techsupport.microsoft.com
 designates 2a01:111:f403:c101::7 as permitted sender)
 receiver=protection.outlook.com; client-ip=2a01:111:f403:c101::7;
 helo=NAM11-BN8-obe.outbound.protection.outlook.com;
Received: from NAM11-BN8-obe.outbound.protection.outlook.com (2a01:111:f403:c101::7)
 by SG2APC01FT034.eop-apc01.prod.protection.outlook.com
 with Microsoft SMTP Server (version=TLS1_2,
 cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.7219.19 via Frontend
 Transport; Mon, 15 Jan 2024 09:00:36 +0000
X-MS-Exchange-Authentication-Results: spf=pass (sender IP is
 2a01:111:f403:c101::7) smtp.mailfrom=techsupport.microsoft.com; dkim=pass
 (signature was verified) header.d=techsupport.microsoft.com;dmarc=pass
 action=none header.from=techsupport.microsoft.com;compauth=pass reason=100
X-Forefront-Antispam-Report:
 CIP:2a01:111:f403:c101::7;CTRY:US;LANG:en;SCL:1;SRV:;IPV:CAL;SFV:NSPM;H:NAM11-BN8-obe.outbound.protection.outlook.com;PTR:mail-bn8nam11obe0106.outbound.protection.outlook.com;CAT:NONE;SFS:(13230031)(7916004)(376014)(1800799022)(38070700009);DIR:INB;SFTY:;BCL:0;
X-Microsoft-Antispam: BCL:0;ARA:13230031|7916004|376014|1800799022|38070700009;
X-Microsoft-Antispam-Mailbox-Delivery: ucf:0;jmr:0;auth:1;dest:I;ENG:(910001)(944506478)(944626604)(920097)(930097)(140003);
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
 d=techsupport.microsoft.com; s=selector1-azurecomm-prod-net;
 h=From:Date:Subject:Message-ID:Content-Type:MIME-Version;
 bh=AbCdEfGhIjKlMnOpQrStUvWxYz12345678901234567890==;
 b=SomeLongBase64EncodedRSASignatureGoesHereForDemoPurposesOnly==
X-MS-Exchange-CrossTenant-OriginalArrivalTime: 15 Jan 2024 09:00:30.1234 (UTC)
X-MS-Exchange-CrossTenant-FromEntityHeader: Hosted
X-MS-Exchange-Organization-Network-Message-Id: BN2PR04MB6831AAAA111111111111AAAA
X-MS-Has-Attach:
Thread-Index: AQHaGPQ+YhxmlJQ7fEGKJi/S3xSwAw==
Message-ID: <BN2PR04MB6831AAAA111111111111AAAA@BN2PR04MB6831.namprd04.prod.outlook.com>
From: IT Support <noreply@techsupport.microsoft.com>
To: alice@contoso.com
Subject: Your Azure Communication Services support ticket #1234567 has been updated
Date: Mon, 15 Jan 2024 09:00:25 +0000
Content-Type: text/html; charset=utf-8
MIME-Version: 1.0`.trim();

export const fixture1: AnalysisResult = {
  rawHeaders: RAW,
  dnsAvailable: true,

  meta: {
    subject: {
      label: 'Subject',
      raw: 'Your Azure Communication Services support ticket #1234567 has been updated',
      value: 'Your Azure Communication Services support ticket #1234567 has been updated',
      tier: 'A',
      explanation: 'The email subject as declared in the RFC 5322 Subject header.',
      status: 'neutral',
    },
    messageId: {
      label: 'Message-ID',
      raw: '<BN2PR04MB6831AAAA111111111111AAAA@BN2PR04MB6831.namprd04.prod.outlook.com>',
      value: '<BN2PR04MB6831AAAA111111111111AAAA@BN2PR04MB6831.namprd04.prod.outlook.com>',
      tier: 'A',
      explanation: 'RFC 5322 Message-ID. Globally unique identifier assigned by the sending MTA.',
      status: 'neutral',
    },
    networkMessageId: {
      label: 'Network Message ID',
      raw: 'BN2PR04MB6831AAAA111111111111AAAA',
      value: 'BN2PR04MB6831AAAA111111111111AAAA',
      tier: 'B',
      explanation: 'Microsoft-assigned identifier for this message. Use this value in the Exchange Admin Center Message Trace or Microsoft Defender Threat Explorer to look up processing details.',
      docUrl: 'https://learn.microsoft.com/en-us/exchange/monitoring/trace-an-email-message/run-a-message-trace-and-view-results',
      status: 'info',
    },
    fromHeader: {
      label: 'From (P2 / 5322.From)',
      raw: 'IT Support <noreply@techsupport.microsoft.com>',
      value: 'IT Support <noreply@techsupport.microsoft.com>',
      tier: 'A',
      explanation: 'The RFC 5322 From header — what the recipient sees in their mail client. This is the address used for DMARC alignment checks.',
      status: 'neutral',
    },
    envelopeFrom: {
      label: 'Envelope From (P1 / 5321.MailFrom)',
      raw: 'noreply@techsupport.microsoft.com',
      value: 'noreply@techsupport.microsoft.com',
      tier: 'A',
      explanation: 'The SMTP MAIL FROM envelope address. Used for SPF checks and bounce routing. May differ from the From header.',
      status: 'neutral',
    },
    to: [{
      label: 'To',
      raw: 'alice@contoso.com',
      value: 'alice@contoso.com',
      tier: 'A',
      explanation: 'Primary recipient(s).',
      status: 'neutral',
    }],
    cc: [],
    creationTime: {
      label: 'Date',
      raw: 'Mon, 15 Jan 2024 09:00:25 +0000',
      value: '2024-01-15T09:00:25Z',
      tier: 'A',
      explanation: 'RFC 5322 Date header — the time the sending MTA claims the message was composed/submitted.',
      status: 'neutral',
    },
    endToEndLatencySeconds: {
      label: 'End-to-end latency',
      raw: '17s (09:00:25 → 09:00:42)',
      value: 17,
      tier: 'A',
      explanation: 'Time elapsed from the RFC 5322 Date to the final Received timestamp. Includes queuing, SMTP negotiation, spam filtering, and mailbox delivery. Values above 60 s are notable; above 300 s may indicate a queue hold.',
      status: 'pass',
    },
  },

  verdicts: {
    authentication: {
      state: 'Authenticated & aligned',
      status: 'pass',
      evidence: [
        'spf=pass (connecting IP 2a01:111:f403:c101::7 is in techsupport.microsoft.com SPF record)',
        'dkim=pass (selector1-azurecomm-prod-net._domainkey.techsupport.microsoft.com)',
        'dmarc=pass action=none (From domain techsupport.microsoft.com aligned with DKIM d= via relaxed check)',
        'compauth=pass reason=100 (explicit SPF + DKIM authentication)',
      ],
    },
    disposition: {
      state: 'Not spam',
      status: 'pass',
      evidence: ['SCL:1 (low spam confidence)', 'SFV:NSPM (not spam)', 'CAT:NONE (no threat category)', 'BCL:0 (no bulk mail signal)'],
    },
    delivery: {
      state: 'Inbox',
      status: 'pass',
      evidence: ['dest:I (mailbox-level decision: Inbox)', 'No user filtering overrides (ucf:0, jmr:0)'],
    },
  },

  deliveryPath: [
    {
      index: 0,
      from: 'substrate.office.com (134.170.140.161)',
      by: 'NAM11-BN8-obe.outbound.protection.outlook.com',
      with: 'HTTPS',
      delaySeconds: 3,
      role: 'origin',
      owner: 'Microsoft 365 (Azure Communication Services)',
      region: 'North America',
    },
    {
      index: 1,
      from: 'NAM11-BN8-obe.outbound.protection.outlook.com (2a01:111:f403:c101::7)',
      by: 'SG2APC01FT034.eop-apc01.prod.protection.outlook.com',
      with: 'Microsoft SMTP Server',
      tls: 'TLS1_2 / TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      delaySeconds: 2,
      role: 'sender-egress',
      owner: 'Microsoft 365 EOP (sender-side)',
      region: 'North America',
    },
    {
      index: 2,
      from: 'SG2APC01FT034.eop-apc01.prod.protection.outlook.com',
      by: 'MN2PR04CA0012.outlook.office365.com',
      with: 'Microsoft SMTP Server',
      tls: 'TLS1_2 / TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      delaySeconds: 2,
      role: 'recipient-ingress',
      owner: 'Microsoft 365 EOP (recipient-side MX)',
      region: 'Asia Pacific',
    },
    {
      index: 3,
      from: 'MN2PR04CA0012.namprd04.prod.outlook.com',
      by: 'BN2PR04MB6831.namprd04.prod.outlook.com',
      with: 'Microsoft SMTP Server',
      tls: 'TLS1_2 / TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      delaySeconds: 2,
      role: 'internal-transport',
      owner: 'Microsoft 365 (internal mailbox transport)',
      region: 'North America',
    },
    {
      index: 4,
      from: 'BN2PR04MB6831.namprd04.prod.outlook.com',
      by: 'SG2PR04MB5954.apcprd04.prod.outlook.com',
      with: 'HTTPS',
      delaySeconds: 0,
      role: 'final-delivery',
      owner: 'Microsoft 365 (mailbox delivery)',
      region: 'Asia Pacific',
    },
  ],

  authentication: {
    spf: {
      result: {
        label: 'SPF result',
        raw: 'pass',
        value: 'pass',
        tier: 'A',
        explanation: 'The connecting IP address is authorized to send email for the envelope From domain (techsupport.microsoft.com) per its SPF record.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-spf-configure',
        status: 'pass',
      },
      record: {
        label: 'SPF record (live DNS)',
        raw: 'v=spf1 include:spf.protection.outlook.com -all',
        value: 'v=spf1 include:spf.protection.outlook.com -all',
        tier: 'A',
        explanation: 'The TXT record at techsupport.microsoft.com that defines authorized sending IP ranges. Fetched live from DNS at time of analysis.',
        status: 'pass',
      },
      connectingIp: {
        label: 'Connecting IP',
        raw: '2a01:111:f403:c101::7',
        value: '2a01:111:f403:c101::7',
        tier: 'A',
        explanation: 'The IP address of the sending MTA that connected to the recipient EOP MX. This is the IP tested against the SPF record.',
        status: 'neutral',
      },
      cidrTest: {
        label: 'IP-in-SPF CIDR test',
        raw: '2a01:111:f403:c101::7 ∈ 2a01:111:f403:c000::/51',
        value: { ip: '2a01:111:f403:c101::7', cidr: '2a01:111:f403:c000::/51', match: true, lookupCount: 3 },
        tier: 'A',
        explanation: 'Independent CIDR membership check: the connecting IPv6 address falls within the /51 range authorized by spf.protection.outlook.com. 3 DNS lookups used (RFC 7208 allows up to 10).',
        status: 'pass',
      },
    },
    dkim: {
      result: {
        label: 'DKIM result',
        raw: 'pass',
        value: 'pass',
        tier: 'A',
        explanation: 'The receiving server verified the DKIM-Signature and the cryptographic signature matched. The message body and selected headers have not been altered in transit.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure',
        status: 'pass',
      },
      selector: {
        label: 'DKIM selector',
        raw: 'selector1-azurecomm-prod-net',
        value: 'selector1-azurecomm-prod-net',
        tier: 'A',
        explanation: 'The DKIM selector identifies which public key to retrieve. The suffix -azurecomm-prod-net indicates this is an Azure Communication Services (ACS) signing key. This classifies the origin as an ACS submission.',
        status: 'info',
      },
      domain: {
        label: 'DKIM signing domain (d=)',
        raw: 'techsupport.microsoft.com',
        value: 'techsupport.microsoft.com',
        tier: 'A',
        explanation: 'The domain that signed this message. For DMARC alignment, this must match or be a subdomain of the RFC 5322 From domain.',
        status: 'pass',
      },
      selectorDnsState: {
        label: 'Selector DNS state (live)',
        raw: 'selector1-azurecomm-prod-net._domainkey.techsupport.microsoft.com → TXT record exists, public key valid',
        value: 'exists, valid (live DNS)',
        tier: 'B',
        explanation: 'The DKIM public key record was queried live and is present and well-formed. Note: this verifies the selector exists now — DNS-then-vs-now drift (key rotation since the message was sent) cannot be detected from this header alone.',
        status: 'pass',
      },
    },
    dmarc: {
      result: {
        label: 'DMARC result',
        raw: 'pass action=none',
        value: 'pass',
        tier: 'A',
        explanation: 'DMARC passed — at least one identifier (SPF or DKIM) aligned with the RFC 5322 From domain, and the domain\'s DMARC policy was applied. action=none means the policy specified monitoring only for this alignment.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dmarc-configure',
        status: 'pass',
      },
      policy: {
        label: 'DMARC policy (org domain)',
        raw: 'v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@microsoft.com',
        value: 'p=reject',
        tier: 'A',
        explanation: 'The DMARC policy at the organizational domain (microsoft.com) specifies reject for messages that fail DMARC. This message passed, so the reject policy was not triggered.',
        status: 'info',
      },
      orgDomain: {
        label: 'Organizational domain',
        raw: 'microsoft.com',
        value: 'microsoft.com',
        tier: 'A',
        explanation: 'No _dmarc TXT record was found at techsupport.microsoft.com, so the DMARC policy was inherited from the organizational domain microsoft.com (determined via Public Suffix List lookup). Subdomains without their own DMARC record inherit the org-domain policy and sp= behavior.',
        status: 'info',
      },
      inherited: true,
      alignment: {
        label: 'Identifier alignment',
        raw: 'DKIM-aligned (relaxed): d=techsupport.microsoft.com ≈ From: techsupport.microsoft.com',
        value: { spf: false, dkim: true, mode: 'relaxed' },
        tier: 'A',
        explanation: 'DKIM alignment passed (relaxed mode): the DKIM signing domain (techsupport.microsoft.com) matches the RFC 5322 From domain. SPF alignment would also require the MailFrom domain to match — in this case it does, but DKIM alignment alone is sufficient for DMARC pass.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dmarc-configure',
        status: 'pass',
      },
    },
    compauth: {
      label: 'Composite authentication (compauth)',
      raw: 'pass reason=100',
      value: {
        result: 'pass',
        reason: '100',
        reasonMeaning: 'Message passed explicit authentication — the From domain\'s SPF and DKIM records are both valid and explicitly configured. This is the strongest compauth result.',
      },
      tier: 'A',
      explanation: 'Composite authentication combines SPF, DKIM, DMARC, and Microsoft implicit signals into a single verdict. Reason code 100 means the message passed all explicit authentication checks.',
      docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-anti-spoofing',
      status: 'pass',
    },
    arc: {
      sets: [],
      overrodeAuthFailure: false,
    },
    authResultsStamps: [
      {
        source: 'EOP recipient-side (SG2APC01FT034)',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        compauth: 'pass reason=100',
        discrepancy: false,
        raw: 'spf=pass (sender IP is 2a01:111:f403:c101::7) smtp.mailfrom=techsupport.microsoft.com; dkim=pass (signature was verified) header.d=techsupport.microsoft.com;dmarc=pass action=none header.from=techsupport.microsoft.com;compauth=pass reason=100',
      },
      {
        source: 'EOP sender-side (X-MS-Exchange-Authentication-Results)',
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        compauth: 'pass reason=100',
        discrepancy: false,
        raw: 'spf=pass (sender IP is 2a01:111:f403:c101::7) smtp.mailfrom=techsupport.microsoft.com; dkim=pass (signature was verified) header.d=techsupport.microsoft.com;dmarc=pass action=none header.from=techsupport.microsoft.com;compauth=pass reason=100',
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
        explanation: 'SCL 1 = very low spam probability. Scale: -1 (whitelisted) to 9 (definite spam). Messages with SCL ≥ 5 are typically routed to Junk.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/anti-spam-spam-confidence-level-scl-about',
        status: 'pass',
      },
      {
        label: 'Spam Filter Verdict (SFV)',
        raw: 'NSPM',
        value: 'NSPM',
        tier: 'A',
        explanation: 'NSPM = Not Spam. The message was evaluated and determined not to be spam.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'pass',
      },
      {
        label: 'Threat Category (CAT)',
        raw: 'NONE',
        value: 'NONE',
        tier: 'A',
        explanation: 'No threat category assigned. Other values include PHSH (phishing), MALW (malware), SPOOF (spoofing), GIMP (Gmail impersonation), BULK, etc.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'pass',
      },
      {
        label: 'Direction (DIR)',
        raw: 'INB',
        value: 'INB',
        tier: 'A',
        explanation: 'INB = Inbound. The message arrived from an external sender. DIR:OUT indicates an outbound message from within your org.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'neutral',
      },
      {
        label: 'IP Verdict (IPV)',
        raw: 'CAL',
        value: 'CAL',
        tier: 'A',
        explanation: 'CAL = Connecting IP was on a Customer Allow List. The sending IP was explicitly trusted by an admin policy, bypassing IP-reputation checks.',
        docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/message-headers-eop-mdo',
        status: 'info',
      },
      {
        label: 'Country (CTRY)',
        raw: 'US',
        value: 'US',
        tier: 'A',
        explanation: 'Country/region inferred from the connecting IP address geolocation.',
        status: 'neutral',
      },
      {
        label: 'PTR record (reverse DNS)',
        raw: 'mail-bn8nam11obe0106.outbound.protection.outlook.com',
        value: 'mail-bn8nam11obe0106.outbound.protection.outlook.com',
        tier: 'A',
        explanation: 'The reverse DNS (PTR) record of the connecting IP. The .outbound.protection.outlook.com suffix confirms this is a Microsoft 365 EOP egress node.',
        status: 'pass',
      },
      {
        label: 'HELO/EHLO string (H)',
        raw: 'NAM11-BN8-obe.outbound.protection.outlook.com',
        value: 'NAM11-BN8-obe.outbound.protection.outlook.com',
        tier: 'A',
        explanation: 'The hostname the sending MTA presented in its SMTP EHLO/HELO command.',
        status: 'neutral',
      },
    ],
    microsoftAntiSpam: [
      {
        label: 'Bulk Confidence Level (BCL)',
        raw: '0',
        value: '0',
        tier: 'A',
        explanation: 'BCL 0 = not a bulk sender. Scale 1–9 measures bulk mail probability. BCL ≥ 4 is typically considered bulk.',
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
        explanation: 'dest:I = Inbox. The mailbox-level decision placed this message in the Inbox. Other values: J = Junk Email folder, Q = Quarantine.',
        note: 'The dest field is widely observed but not officially documented by Microsoft. This interpretation reflects broad community consensus.',
        status: 'pass',
      },
      {
        label: 'User Controlled Filtering (ucf)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'ucf:0 — no user-level filtering (safe/blocked senders list, Outlook rules) affected delivery of this message. Non-zero values indicate user preferences influenced the placement.',
        note: 'Undocumented field. Also seen expanded as "user configured filter." Interpretation may vary.',
        status: 'neutral',
      },
      {
        label: 'Junk Mail Rule (jmr)',
        raw: '0',
        value: '0',
        tier: 'D',
        explanation: 'jmr:0 — no junk mail heuristic or mailbox rule routed this message. jmr:1 would indicate junk routing logic was triggered at the mailbox level.',
        note: 'Undocumented field. Also seen expanded as "Junk Mail Routing."',
        status: 'neutral',
      },
      {
        label: 'Auth contribution (auth)',
        raw: '1',
        value: '1',
        tier: 'D',
        explanation: 'auth:1 — authentication signals (SPF/DKIM/DMARC/compauth) contributed positively to the mailbox-level decision. auth:0 indicates no helpful auth signal, or auth failed/was ignored.',
        note: 'Undocumented field.',
        status: 'pass',
      },
    ],
  },

  mdo: {
    safeLinks: {
      label: 'Safe Links',
      raw: '(no Safe Links stamp present)',
      value: false,
      tier: 'B',
      explanation: 'No Safe Links processing stamp found in this header. Safe Links may have been processed by the sending organization\'s EOP before delivery, or the recipient policy may not apply to this message class.',
      status: 'info',
    },
    safeAttachments: {
      label: 'Safe Attachments',
      raw: '(no Safe Attachments stamp present)',
      value: false,
      tier: 'B',
      explanation: 'No Safe Attachments processing stamp found. X-MS-Has-Attach is absent, indicating no attachments were present to scan.',
      status: 'info',
    },
  },

  context: {
    isExternal: {
      label: 'External sender',
      raw: 'X-MS-Exchange-CrossTenant-FromEntityHeader: Hosted',
      value: false,
      tier: 'B',
      explanation: 'FromEntityHeader: Hosted indicates the sender is a Microsoft 365-hosted mailbox (not an anonymous Internet sender). No [EXTERNAL] tag was added to the subject.',
      status: 'neutral',
    },
    directionality: {
      label: 'Message directionality',
      raw: 'Inbound (DIR:INB in X-Forefront-Antispam-Report)',
      value: 'Inbound',
      tier: 'A',
      explanation: 'The message traveled from an external sending infrastructure into the recipient\'s Microsoft 365 mailbox.',
      status: 'neutral',
    },
    authAs: {
      label: 'Authenticated as',
      raw: 'Microsoft 365 hosted sender (implicit from DKIM + SPF alignment)',
      value: 'Microsoft 365 hosted sender',
      tier: 'B',
      explanation: 'The sender authenticated via DKIM and SPF with aligned identifiers. No X-MS-Exchange-Organization-AuthAs header indicating Anonymous was present, confirming this is a trusted hosted sender.',
      status: 'pass',
    },
  },

  sensitivityLabel: undefined,

  impersonation: {
    displayNameVsFrom: {
      label: 'Display name vs. From address',
      raw: '"IT Support" <noreply@techsupport.microsoft.com>',
      value: 'Display name "IT Support" is generic but the From domain is techsupport.microsoft.com — a legitimate Microsoft subdomain. No mismatch detected.',
      tier: 'A',
      explanation: 'Compares the display name portion of the From header against the email domain. Attackers frequently use generic display names (e.g. "IT Support", "Security Alert") with unrelated domains.',
      status: 'pass',
    },
    domainLookalike: {
      label: 'Lookalike / homoglyph domain',
      raw: 'techsupport.microsoft.com',
      value: false,
      tier: 'A',
      explanation: 'No lookalike domain patterns detected. The From domain (techsupport.microsoft.com) is a verified Microsoft subdomain.',
      status: 'pass',
    },
    firstContact: {
      label: 'First contact (SFTY 9.25)',
      raw: '(no SFTY:9.25 present)',
      value: false,
      tier: 'A',
      explanation: 'No first-contact safety tip (SFTY:9.25) was triggered. This tip appears when the recipient has not previously received email from this sender.',
      docUrl: 'https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/safety-tips-email-messages',
      status: 'pass',
    },
    catValues: {
      label: 'Impersonation CAT flags',
      raw: 'CAT:NONE',
      value: [],
      tier: 'A',
      explanation: 'No impersonation-related threat categories detected (UIMP, DIMP, SPOOF, GIMP, BIMP were all absent). CAT:NONE confirms clean classification.',
      status: 'pass',
    },
    externalFlag: {
      label: '[EXTERNAL] tag',
      raw: '(not present)',
      value: false,
      tier: 'B',
      explanation: 'No [EXTERNAL] tag was added to the subject line. This is consistent with the sender being a Microsoft 365-hosted entity (FromEntityHeader: Hosted).',
      status: 'neutral',
    },
    riskLevel: 'none',
  },

  thread: {
    rootTime: {
      label: 'Conversation root time',
      raw: 'AQHaGPQ+YhxmlJQ7fEGKJi/S3xSwAw==',
      value: '2024-01-15T09:00:00Z',
      tier: 'A',
      explanation: 'Derived from Thread-Index per [MS-OXOMSG] §2.2.1.3. The first 5 bytes encode a FILETIME truncated to 100-nanosecond intervals — root time has ~minute resolution. The full GUID embedded in the remaining bytes uniquely identifies the conversation.',
      docUrl: 'https://learn.microsoft.com/en-us/openspecs/exchange_server_protocols/ms-oxomsg/9e994fbb-b839-495f-84e3-2c8dc41ea4b0',
      note: 'Root time resolution is ~1 minute due to FILETIME truncation in the Thread-Index encoding.',
      status: 'neutral',
    },
    replyDepth: {
      label: 'Reply depth',
      raw: 'AQHaGPQ+YhxmlJQ7fEGKJi/S3xSwAw==',
      value: 0,
      tier: 'A',
      explanation: 'Zero additional 5-byte response-level blocks found after the 22-byte header block — this is the original message in its conversation thread, not a reply.',
      status: 'neutral',
    },
  },

  attachments: {
    label: 'Attachments',
    raw: 'X-MS-Has-Attach: (empty); Content-Type: text/html',
    value: { hasAttach: false, contentType: 'text/html' },
    tier: 'A',
    explanation: 'X-MS-Has-Attach is present but empty, indicating no MIME attachments. Content-Type is text/html — a simple HTML-only email body.',
    status: 'neutral',
  },
};
