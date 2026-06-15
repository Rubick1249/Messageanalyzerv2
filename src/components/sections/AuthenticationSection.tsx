import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { DnsRecordCard } from '../primitives/DnsRecordCard';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

export function AuthenticationSection({ result }: Props) {
  const { spf, dkim, dmarc, compauth } = result.authentication;

  return (
    <div className="space-y-6">
      {/* SPF */}
      <div>
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">SPF — Sender Policy Framework</h3>
        <div className="divide-y divide-surface-border">
          <FieldRow field={spf.result} />
          <FieldRow field={spf.connectingIp} mono />
          {spf.record && <FieldRow field={spf.record} />}
        </div>
        {spf.cidrTest && (
          <div className={`mt-3 rounded-lg p-3 border text-sm ${
            spf.cidrTest.value?.match
              ? 'bg-verdict-pass/5 border-verdict-pass/30'
              : 'bg-verdict-fail/5 border-verdict-fail/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <VerdictPill
                status={spf.cidrTest.value?.match ? 'pass' : 'fail'}
                label="IP-in-SPF CIDR test"
                size="sm"
              />
              <span className="text-xs text-text-tertiary">
                {spf.cidrTest.value?.lookupCount ?? 0} of 10 DNS lookups used
              </span>
            </div>
            <code className="text-xs font-mono text-text-primary">{spf.cidrTest.raw}</code>
            <p className="text-xs text-text-tertiary mt-1">{spf.cidrTest.explanation}</p>
          </div>
        )}
        {spf.record && (
          <div className="mt-3">
            <DnsRecordCard
              type="TXT"
              name={`${result.meta.envelopeFrom.value?.split('@')[1] ?? 'domain'} SPF`}
              value={spf.record.raw}
              status={spf.result.status ?? 'neutral'}
            />
          </div>
        )}
      </div>

      {/* DKIM */}
      <div>
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">DKIM — DomainKeys Identified Mail</h3>
        <div className="divide-y divide-surface-border">
          <FieldRow field={dkim.result} />
          <FieldRow field={dkim.domain} mono />
          <FieldRow field={dkim.selector} mono />
          {dkim.selectorDnsState && typeof dkim.selectorDnsState === 'object' && 'label' in dkim.selectorDnsState && (
            <FieldRow field={dkim.selectorDnsState as import('@/lib/types').Field<string>} />
          )}
        </div>
      </div>

      {/* DMARC */}
      <div>
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">DMARC — Domain-based Message Authentication</h3>
        <div className="divide-y divide-surface-border">
          <FieldRow field={dmarc.result} />
          <FieldRow field={dmarc.policy} mono />
          {dmarc.inherited && dmarc.orgDomain && (
            <div className="py-2.5 border-b border-surface-border">
              <p className="text-xs text-verdict-info bg-verdict-info/10 border border-verdict-info/30 rounded px-3 py-2">
                <strong>DMARC org-domain inheritance:</strong> No _dmarc record found at the From subdomain.
                Policy inherited from organizational domain <code className="font-mono">{dmarc.orgDomain.raw}</code> via Public Suffix List lookup.
              </p>
            </div>
          )}
          <FieldRow field={dmarc.alignment} />
        </div>
        {dmarc.policy.value && (
          <div className="mt-3">
            <DnsRecordCard
              type="TXT"
              name={`_dmarc.${dmarc.orgDomain?.raw ?? result.meta.fromHeader.value?.split('@')[1] ?? 'domain'}`}
              value={dmarc.policy.raw}
              status={dmarc.result.status ?? 'neutral'}
              note={dmarc.inherited ? `Inherited from org domain (no record at the From subdomain)` : undefined}
            />
          </div>
        )}
      </div>

      {/* CompAuth */}
      <div>
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Composite Authentication (compauth)</h3>
        <div className="divide-y divide-surface-border">
          <FieldRow
            field={compauth}
            valueDisplay={
              compauth.value ? (
                <div className="text-right space-y-0.5">
                  <VerdictPill status={compauth.status ?? 'neutral'} label={compauth.value.result} size="sm" />
                  <p className="text-xs text-text-tertiary">reason {compauth.value.reason}</p>
                  <p className="text-xs text-text-secondary max-w-[220px]">{compauth.value.reasonMeaning}</p>
                </div>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  );
}
