// Compauth reason code table.
// Source: https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-anti-spoofing

const REASON_MAP: Record<string, string> = {
  '000': 'Message failed DMARC. The sending domain does not have a DMARC record, or the DMARC policy is set to none.',
  '001': 'Message failed implicit email authentication. The sending domain did not publish email authentication records, or Microsoft\'s internal reputation signals indicate failure.',
  '002': 'Organizational policy for the sender/domain combination is explicitly prohibited — an admin has set a block rule.',
  '010': 'Message failed DMARC with action=reject or action=quarantine, and the sending domain is one of your organization\'s accepted domains (self-to-self or intra-org spoofing).',
  '100': 'Message passed explicit authentication — the From domain\'s SPF and DKIM both passed and are aligned. This is the strongest compauth result.',
  '200': 'Message passed implicit authentication. The sending domain did not have email authentication records, but Microsoft\'s backend signals (reputation, heuristics) indicate the sender is legitimate.',
  '250': 'Message passed because the sender matched an allow list or safe sender policy configured by an admin or end user.',
  '300': 'Message did not pass compauth. Sending domain has no authentication records and no overriding trust signals.',
  '301': 'Message likely spoofed. Sending domain has no authentication records, and the sender appears to be impersonating a known entity.',
  '305': 'Message passed via ARC override (forwarded or relayed message). Soft-pass assigned because the original authentication was preserved by a trusted ARC sealer, but the current sending IP is not directly authorized.',
  '350': 'The sending domain has no SPF or DKIM record; compauth was not deterministic. This is an informational value.',
  '400': 'Message failed authentication checks but was delivered due to an override (safe sender list, mail flow rule, or IP allow list).',
  '401': 'Message failed authentication; override applied by end-user safe sender list.',
  '403': 'Failed compauth. The domain has no email authentication records.',
  '404': 'Failed compauth. The message failed DMARC (action=none — monitor only) and no override applied.',
  '500': 'Message failed authentication and was likely rejected or quarantined. Check X-Forefront-Antispam-Report for SCL/SFV.',
  '601': 'Bulk mail signal. The BCL score indicates this is bulk email even though authentication passed.',
};

export function compauthReasonMeaning(reason: string): string {
  return REASON_MAP[reason] ?? `Reason code ${reason} — consult Microsoft documentation for the latest mapping.`;
}
