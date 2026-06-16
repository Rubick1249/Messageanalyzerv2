// Parses Authentication-Results (and X-MS-Exchange-Authentication-Results) header values.

export interface AuthTokens {
  spf?: string;
  spfIp?: string;
  spfMailFrom?: string;
  dkim?: string;
  dkimDomain?: string;
  dkimSelector?: string;
  dmarc?: string;
  dmarcAction?: string;
  dmarcFrom?: string;
  compauth?: string;
  compauthReason?: string;
  arc?: string;
}

export function parseAuthResults(value: string): AuthTokens {
  const t: AuthTokens = {};

  const m = (re: RegExp) => re.exec(value)?.[1];

  t.spf = m(/\bspf=(pass|fail|softfail|neutral|none|temperror|permerror)\b/i)?.toLowerCase();
  t.spfIp = m(/sender IP is ([^\s);,]+)/i);
  t.spfMailFrom = m(/smtp\.mailfrom=([^\s;,]+)/i);

  t.dkim = m(/\bdkim=(pass|fail|policy|none|neutral|temperror|permerror)\b/i)?.toLowerCase();
  t.dkimDomain = m(/header\.d=([^\s;,]+)/i);
  t.dkimSelector = m(/header\.s=([^\s;,]+)/i);

  t.dmarc = m(/\bdmarc=(pass|fail|none|temperror|permerror)\b/i)?.toLowerCase();
  t.dmarcAction = m(/dmarc=\S+\s+action=([^\s;]+)/i);
  t.dmarcFrom = m(/header\.from=([^\s;,]+)/i);

  t.compauth = m(/\bcompauth=(pass|fail|softpass|none)\b/i)?.toLowerCase();
  t.compauthReason = m(/compauth=\S+\s+reason=(\d+)/i);

  t.arc = m(/\barc=(pass|fail|none)\b/i)?.toLowerCase();

  return t;
}
