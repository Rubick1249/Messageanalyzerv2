import { describe, it, expect } from 'vitest';
import { ipInCidr } from '../cidr';

describe('CIDR membership', () => {
  describe('IPv4', () => {
    it('matches exact IP in /32', () => expect(ipInCidr('1.2.3.4', '1.2.3.4/32')).toBe(true));
    it('matches IP in /24', () => expect(ipInCidr('203.0.113.45', '203.0.113.0/24')).toBe(true));
    it('rejects IP outside /24', () => expect(ipInCidr('203.0.114.1', '203.0.113.0/24')).toBe(false));
    it('matches all in /0', () => expect(ipInCidr('1.2.3.4', '0.0.0.0/0')).toBe(true));
    it('fixture2 IP in /24', () => expect(ipInCidr('203.0.113.45', '203.0.113.0/24')).toBe(true));
  });

  describe('IPv6', () => {
    it('matches IPv6 in /51 (fixture1)', () =>
      expect(ipInCidr('2a01:111:f403:c101::7', '2a01:111:f403:c000::/51')).toBe(true));
    it('rejects IPv6 outside /51', () =>
      expect(ipInCidr('2a01:111:f403:e000::1', '2a01:111:f403:c000::/51')).toBe(false));
    it('matches compressed :: notation', () =>
      expect(ipInCidr('::1', '::1/128')).toBe(true));
    it('matches IPv6 in /32', () =>
      expect(ipInCidr('2001:db8:1:2::1', '2001:db8::/32')).toBe(true));
    it('rejects IPv6 outside /32', () =>
      expect(ipInCidr('2001:db9::1', '2001:db8::/32')).toBe(false));
  });
});
