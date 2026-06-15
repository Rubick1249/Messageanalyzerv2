import { describe, it, expect } from 'vitest';
import { parseAuthResults } from '../parsers/auth-results';

const FIXTURE1_AR = 'spf=pass (sender IP is 2a01:111:f403:c101::7) smtp.mailfrom=techsupport.microsoft.com; dkim=pass (signature was verified) header.d=techsupport.microsoft.com;dmarc=pass action=none header.from=techsupport.microsoft.com;compauth=pass reason=100';

const FIXTURE2_MSAR = 'spf=pass (sender IP is 203.0.113.45) smtp.mailfrom=marico.com; dkim=none (message not signed); dmarc=none (no dmarc record for marico.com);compauth=softpass reason=305';

describe('parseAuthResults', () => {
  it('parses fixture1 primary stamp', () => {
    const t = parseAuthResults(FIXTURE1_AR);
    expect(t.spf).toBe('pass');
    expect(t.spfIp).toBe('2a01:111:f403:c101::7');
    expect(t.spfMailFrom).toBe('techsupport.microsoft.com');
    expect(t.dkim).toBe('pass');
    expect(t.dkimDomain).toBe('techsupport.microsoft.com');
    expect(t.dmarc).toBe('pass');
    expect(t.dmarcAction).toBe('none');
    expect(t.compauth).toBe('pass');
    expect(t.compauthReason).toBe('100');
  });

  it('parses fixture2 X-MS-Exchange stamp (dkim=none, dmarc=none, compauth=softpass)', () => {
    const t = parseAuthResults(FIXTURE2_MSAR);
    expect(t.spf).toBe('pass');
    expect(t.spfIp).toBe('203.0.113.45');
    expect(t.dkim).toBe('none');
    expect(t.dmarc).toBe('none');
    expect(t.compauth).toBe('softpass');
    expect(t.compauthReason).toBe('305');
  });

  it('handles missing fields gracefully', () => {
    const t = parseAuthResults('arc=pass');
    expect(t.spf).toBeUndefined();
    expect(t.dkim).toBeUndefined();
    expect(t.arc).toBe('pass');
  });
});
