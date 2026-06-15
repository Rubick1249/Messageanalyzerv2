import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

export function MessageContextSection({ result }: Props) {
  const { isExternal, directionality, authAs, senderTenant, recipientTenant } = result.context;

  return (
    <div className="space-y-4">
      {isExternal.value && (
        <div className="rounded-lg bg-verdict-warn/5 border border-verdict-warn/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <VerdictPill status="warn" label="External sender" size="sm" />
          </div>
          <p className="text-sm text-text-secondary">
            This message originated outside your organization. The following signals confirm external origin:
          </p>
          <ul className="mt-2 space-y-1">
            {isExternal.raw.split(';').map((e, i) => (
              <li key={i} className="text-xs text-text-tertiary flex items-start gap-1.5">
                <span className="text-verdict-warn mt-0.5">·</span>
                <code className="font-mono break-all">{e.trim()}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="divide-y divide-surface-border">
        <FieldRow field={isExternal} valueDisplay={
          <VerdictPill
            status={isExternal.value ? 'warn' : 'neutral'}
            label={isExternal.value ? 'External' : 'Internal / Hosted'}
            size="sm"
          />
        } />
        <FieldRow field={directionality} />
        <FieldRow field={authAs} />
        {senderTenant && <FieldRow field={senderTenant} mono />}
        {recipientTenant && <FieldRow field={recipientTenant} mono />}
      </div>
    </div>
  );
}
