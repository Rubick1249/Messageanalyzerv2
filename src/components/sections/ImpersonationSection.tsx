import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

const RISK_CONFIG = {
  none:   { status: 'pass' as const,    label: 'No impersonation signals' },
  low:    { status: 'info' as const,    label: 'Low risk' },
  medium: { status: 'warn' as const,    label: 'Medium risk — review recommended' },
  high:   { status: 'fail' as const,    label: 'High risk — likely BEC/spoof' },
};

export function ImpersonationSection({ result }: Props) {
  const imp = result.impersonation;
  const risk = RISK_CONFIG[imp.riskLevel];

  return (
    <div className="space-y-4">
      <div className={`rounded-lg p-3 border ${
        imp.riskLevel === 'none' ? 'bg-verdict-pass/5 border-verdict-pass/30' :
        imp.riskLevel === 'low'  ? 'bg-verdict-info/5 border-verdict-info/30' :
        imp.riskLevel === 'medium' ? 'bg-verdict-warn/5 border-verdict-warn/30' :
        'bg-verdict-fail/5 border-verdict-fail/30'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">BEC / Impersonation Risk</span>
        </div>
        <VerdictPill status={risk.status} label={risk.label} size="md" />
        <p className="text-xs text-text-tertiary mt-2">
          This is a synthesized assessment based on signals in the header. It is not a Microsoft verdict —
          combine with organizational context before taking action.
        </p>
      </div>

      <div className="divide-y divide-surface-border">
        <FieldRow field={imp.displayNameVsFrom} />
        <FieldRow field={imp.domainLookalike} valueDisplay={
          <VerdictPill
            status={imp.domainLookalike.value ? 'fail' : 'pass'}
            label={imp.domainLookalike.value ? 'Detected' : 'None detected'}
            size="sm"
          />
        } />
        <FieldRow field={imp.firstContact} valueDisplay={
          <VerdictPill
            status={imp.firstContact.value ? 'warn' : 'pass'}
            label={imp.firstContact.value ? 'First contact' : 'Known sender'}
            size="sm"
          />
        } />
        <FieldRow field={imp.externalFlag} valueDisplay={
          <VerdictPill
            status={imp.externalFlag.value ? 'warn' : 'neutral'}
            label={imp.externalFlag.value ? '[EXTERNAL] tagged' : 'Not tagged'}
            size="sm"
          />
        } />
        <FieldRow field={imp.catValues} valueDisplay={
          imp.catValues.value && imp.catValues.value.length > 0
            ? <div className="flex flex-wrap gap-1 justify-end">
                {imp.catValues.value.map(v => (
                  <span key={v} className="text-xs font-mono px-1.5 py-0.5 rounded border text-verdict-fail bg-verdict-fail/10 border-verdict-fail/30">{v}</span>
                ))}
              </div>
            : <span className="text-xs text-text-tertiary">None</span>
        } />
      </div>
    </div>
  );
}
