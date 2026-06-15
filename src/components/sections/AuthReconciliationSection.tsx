import type { AnalysisResult } from '@/lib/types';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

export function AuthReconciliationSection({ result }: Props) {
  const stamps = result.authentication.authResultsStamps;
  const hasDiscrepancy = stamps.some(s => s.discrepancy);

  return (
    <div className="space-y-4">
      {hasDiscrepancy && (
        <div className="rounded-lg bg-verdict-warn/5 border border-verdict-warn/40 p-3">
          <div className="flex items-center gap-2 mb-2">
            <VerdictPill status="warn" label="Stamp discrepancy detected" size="sm" />
          </div>
          <p className="text-sm text-text-secondary">
            Multiple Authentication-Results stamps are present, and they do not all agree.
            This can occur when different mail systems evaluate authentication independently,
            or when a stamp reflects pre-forwarding state. Trust the stamp from the recipient's
            EOP (the primary Authentication-Results header), not secondary or internal exchange stamps.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {stamps.map((stamp, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${
              stamp.discrepancy
                ? 'bg-verdict-warn/5 border-verdict-warn/30'
                : 'bg-surface-raised border-surface-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="text-xs font-semibold text-text-primary">{stamp.source}</span>
              {stamp.discrepancy && (
                <VerdictPill status="warn" label="Discrepancy" size="sm" />
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {stamp.spf && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                  stamp.spf === 'pass' ? 'text-verdict-pass bg-verdict-pass/10 border-verdict-pass/30' : 'text-verdict-warn bg-verdict-warn/10 border-verdict-warn/30'
                }`}>spf={stamp.spf}</span>
              )}
              {stamp.dkim && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                  stamp.dkim === 'pass' ? 'text-verdict-pass bg-verdict-pass/10 border-verdict-pass/30' : 'text-verdict-warn bg-verdict-warn/10 border-verdict-warn/30'
                }`}>dkim={stamp.dkim}</span>
              )}
              {stamp.dmarc && (
                <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                  stamp.dmarc === 'pass' ? 'text-verdict-pass bg-verdict-pass/10 border-verdict-pass/30' : 'text-verdict-warn bg-verdict-warn/10 border-verdict-warn/30'
                }`}>dmarc={stamp.dmarc}</span>
              )}
              {stamp.compauth && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded border text-verdict-info bg-verdict-info/10 border-verdict-info/30">
                  compauth={stamp.compauth}
                </span>
              )}
            </div>
            <code className="text-xs font-mono text-text-tertiary break-all leading-relaxed block">
              {stamp.raw}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
