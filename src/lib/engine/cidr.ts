// IPv4 and IPv6 CIDR membership tests.

export function ipInCidr(ip: string, cidr: string): boolean {
  return ip.includes(':') ? ipv6InCidr(ip, cidr) : ipv4InCidr(ip, cidr);
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return NaN;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function ipv4InCidr(ip: string, cidr: string): boolean {
  const [base, lenStr] = cidr.split('/');
  const prefixLen = parseInt(lenStr, 10);
  if (isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) return false;
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

function ipv6Expand(ip: string): bigint {
  // Handle :: expansion
  let s = ip;
  if (s.includes('::')) {
    const [left, right] = s.split('::');
    const leftParts = left ? left.split(':') : [];
    const rightParts = right ? right.split(':') : [];
    const missing = 8 - leftParts.length - rightParts.length;
    s = [...leftParts, ...Array(missing).fill('0'), ...rightParts].join(':');
  }
  return s.split(':').reduce((acc, part) => (acc << 16n) | BigInt(parseInt(part || '0', 16)), 0n);
}

function ipv6InCidr(ip: string, cidr: string): boolean {
  const [base, lenStr] = cidr.split('/');
  const prefixLen = BigInt(parseInt(lenStr, 10));
  if (prefixLen < 0n || prefixLen > 128n) return false;
  const mask = prefixLen === 0n ? 0n : (~0n << (128n - prefixLen)) & ((1n << 128n) - 1n);
  try {
    return (ipv6Expand(ip) & mask) === (ipv6Expand(base) & mask);
  } catch {
    return false;
  }
}
