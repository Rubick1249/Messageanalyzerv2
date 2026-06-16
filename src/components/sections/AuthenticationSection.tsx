import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { DnsRecordCard } from '../primitives/DnsRecordCard';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

function extractDomain(raw: string | null | undefined): string {
  if (!raw) return 'domain';
  const email = /<([^>]+)>/.exec(raw)?.[1] ?? raw;
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : parts[0];
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-5 border-t border-surface-border/50 first:pt-0 first:border-t-0">
      <h3 className="text-[10px] font-semibold text-text-tertiary/70 uppercase tracking-widest mb-2">{title}</h3>
      {children}
    </div>
  );
}

export function AuthenticationSection({ result }: Props) {
  const { spf, dkim, dmarc, compauth } = result.authentication;
  const [showRaw, setShowRaw] = useState(false);

  return (
    <div className="space-y-0">
      {/* Master raw toggle */}
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setShowRaw(v => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-colors duration-150 ${
            showRaw
              ? 'border-accent-azure text-accent-azure bg-accent-azure/10'
              : 'border-surface-border text-text-tertiary hover:border-accent-azure/50 hover:text-text-secondary'
          }`}
        >
          <span aria-hidden="true">{'</>'}</span>
          {showRaw ? 'Hide raw values' : 'Show raw values'}
        </button>
      </div>

      {/* SPF */}
      <SubSection title="SPF — Sender Policy Framework">
        <div className="divide-y divide-surface-border">
          <FieldRow field={spf.result} showRaw={showRaw} />
          <FieldRow field={spf.connectingIp} mono showRaw={showRaw} />
          {spf.record && <FieldRow field={spf.record} showRaw={showRaw} />}
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
              name={`${extractDomain(result.meta.envelopeFrom.value)} SPF`}
              value={spf.record.raw}
              status={spf.result.status ?? 'neutral'}
            />
          </div>
        )}
      </SubSection>

      {/* DKIM */}
      <SubSection title="DKIM — DomainKeys Identified Mail">
        <div className="divide-y divide-surface-border">
          <FieldRow field={dkim.result} showRaw={showRaw} />
          <FieldRow field={dkim.domain} mono showRaw={showRaw} />
          <FieldRow field={dkim.selector} mono showRaw={showRaw} />
          {dkim.selectorDnsState && typeof dkim.selectorDnsState === 'object' && 'label' in dkim.selectorDnsState && (
            <FieldRow field={dkim.selectorDnsState as import('@/lib/types').Field<string>} showRaw={showRaw} />
          )}
        </div>
      </SubSection>

      {/* DMARC */}
      <SubSection title="DMARC — Domain-based Message Authentication">
        <div className="divide-y divide-surface-border">
          <FieldRow field={dmarc.result} showRaw={showRaw} />
          <FieldRow field={dmarc.policy} mono showRaw={showRaw} />
          {dmarc.inherited && dmarc.orgDomain && (
            <div className="py-2.5 border-b border-surface-border">
              <p className="text-xs text-verdict-info bg-verdict-info/10 border border-verdict-info/30 rounded px-3 py-2">
                <strong>DMARC org-domain inheritance:</strong> No _dmarc record found at the From subdomain.
                Policy inherited from organizational domain <code className="font-mono">{dmarc.orgDomain.raw}</code> via Public Suffix List lookup.
              </p>
            </div>
          )}
          <FieldRow
            field={dmarc.alignment}
            showRaw={showRaw}
            valueDisplay={
              dmarc.alignment.value ? (
                <div className="text-right space-y-1">
                  <div className="flex justify-end items-center gap-1.5">
                    <span className="text-xs text-text-tertiary tabular-nums">DKIM</span>
                    <VerdictPill status={dmarc.alignment.value.dkim ? 'pass' : 'fail'} label={dmarc.alignment.value.dkim ? 'aligned' : 'misaligned'} size="sm" />
                  </div>
                  <div className="flex justify-end items-center gap-1.5">
                    <span className="text-xs text-text-tertiary tabular-nums">SPF</span>
                    <VerdictPill status={dmarc.alignment.value.spf ? 'pass' : 'fail'} label={dmarc.alignment.value.spf ? 'aligned' : 'misaligned'} size="sm" />
                  </div>
                </div>
              ) : null
            }
          />
        </div>
        {dmarc.policy.value && (
          <div className="mt-3">
            <DnsRecordCard
              type="TXT"
              name={`_dmarc.${dmarc.orgDomain?.raw ?? extractDomain(result.meta.fromHeader.value)}`}
              value={dmarc.policy.raw}
              status={dmarc.result.status ?? 'neutral'}
              note={dmarc.inherited ? `Inherited from org domain (no record at the From subdomain)` : undefined}
            />
          </div>
        )}
      </SubSection>

      {/* CompAuth */}
      <SubSection title="Composite Authentication (compauth)">
        <div className="divide-y divide-surface-border">
          <FieldRow
            field={compauth}
            showRaw={showRaw}
            valueDisplay={
              compauth.value ? (
                <div className="text-right space-y-0.5">
                  <VerdictPill status={compauth.status ?? 'neutral'} label={compauth.value.result} size="sm" />
                  <p className="text-xs text-text-tertiary tabular-nums">reason {compauth.value.reason}</p>
                </div>
              ) : null
            }
          />
        </div>
        {compauth.value?.reasonMeaning && (
          <div className="mt-3 rounded-lg border border-verdict-info/25 bg-verdict-info/5 px-4 py-3">
            <p className="text-sm text-text-secondary leading-relaxed">{compauth.value.reasonMeaning}</p>
          </div>
        )}
      </SubSection>
    </div>
  );
}
