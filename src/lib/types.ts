export type Tier = 'A' | 'B' | 'C' | 'D';
export type StatusValue = 'pass' | 'warn' | 'fail' | 'info' | 'neutral' | 'unavailable';

export interface Field<T> {
  label: string;
  raw: string;
  value: T | null;
  tier: Tier;
  explanation: string;
  docUrl?: string;
  note?: string;
  status?: StatusValue;
}

export interface Verdict {
  state: string;
  status: 'pass' | 'warn' | 'fail' | 'info';
  evidence: string[];
}

export interface Hop {
  index: number;
  from: string;
  by: string;
  with: string;
  tls?: string;
  delaySeconds: number;
  role: 'origin' | 'sender-egress' | 'recipient-ingress' | 'internal-transport' | 'final-delivery' | 'foreign' | 'unknown';
  owner: string;
  region?: string;
}

export interface SpfResult {
  result: Field<string>;
  record?: Field<string>;
  connectingIp: Field<string>;
  cidrTest?: Field<{ ip: string; cidr: string; match: boolean; lookupCount: number }>;
}

export interface DkimResult {
  result: Field<string>;
  selector: Field<string>;
  domain: Field<string>;
  selectorDnsState?: Field<string>;
}

export interface DmarcResult {
  result: Field<string>;
  policy: Field<string>;
  orgDomain?: Field<string>;
  inherited: boolean;
  alignment: Field<{ spf: boolean; dkim: boolean; mode: 'relaxed' | 'strict' }>;
}

export interface ArcSet {
  instance: number;
  cv: Field<string>;
  oda?: Field<string>;
  ltdi?: Field<string>;
  preservedAuth?: { spf?: string; dkim?: string; dmarc?: string };
}

export interface ArcResult {
  sets: ArcSet[];
  overrodeAuthFailure: boolean;
}

export interface AuthStamp {
  source: string;
  spf?: string;
  dkim?: string;
  dmarc?: string;
  compauth?: string;
  discrepancy: boolean;
  raw: string;
}

export interface MsipLabel {
  name: Field<string>;
  guid: Field<string>;
  enabled: Field<boolean>;
  setDate: Field<string>;
  method: Field<string>;
  contentBits: Field<string>;
  siteId: Field<string>;
}

export interface ImpersonationSignals {
  displayNameVsFrom: Field<string>;
  domainLookalike: Field<boolean>;
  firstContact: Field<boolean>;
  catValues: Field<string[]>;
  externalFlag: Field<boolean>;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface AnalysisResult {
  meta: {
    subject: Field<string>;
    messageId: Field<string>;
    networkMessageId: Field<string>;
    fromHeader: Field<string>;
    envelopeFrom: Field<string>;
    replyTo?: Field<string>;
    resentFrom?: Field<string>;
    to: Field<string>[];
    cc: Field<string>[];
    creationTime: Field<string>;
    endToEndLatencySeconds: Field<number>;
  };
  verdicts: {
    authentication: Verdict;
    disposition: Verdict;
    delivery: Verdict;
  };
  deliveryPath: Hop[];
  authentication: {
    spf: SpfResult;
    dkim: DkimResult;
    dmarc: DmarcResult;
    compauth: Field<{ result: string; reason: string; reasonMeaning: string }>;
    arc: ArcResult;
    authResultsStamps: AuthStamp[];
  };
  antiSpam: {
    forefront: Field<string>[];
    microsoftAntiSpam: Field<string>[];
    mailboxDelivery: Field<string>[];
  };
  mdo: {
    safeLinks: Field<boolean>;
    safeAttachments: Field<boolean>;
  };
  context: {
    isExternal: Field<boolean>;
    directionality: Field<string>;
    authAs: Field<string>;
    senderTenant?: Field<string>;
    recipientTenant?: Field<string>;
  };
  sensitivityLabel?: MsipLabel;
  impersonation: ImpersonationSignals;
  thread?: {
    rootTime: Field<string>;
    replyDepth: Field<number>;
  };
  attachments: Field<{ hasAttach: boolean; contentType: string }>;
  loop?: { detected: boolean; pattern: string; evidence: string[] };
  rawHeaders: string;
  dnsAvailable: boolean;
}
