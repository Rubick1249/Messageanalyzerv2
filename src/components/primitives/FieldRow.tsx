import type { Field } from '@/lib/types';
import { TierBadge } from './TierBadge';
import { CopyButton } from './CopyButton';
import { Disclosure } from './Disclosure';
import { VerdictPill } from './VerdictPill';

interface Props {
  field: Field<unknown>;
  valueDisplay?: React.ReactNode;
  mono?: boolean;
  showRaw?: boolean;
}

export function FieldRow({ field, valueDisplay, mono = false, showRaw = true }: Props) {
  const displayValue = valueDisplay ?? (
    field.value !== null
      ? <span className={`break-all ${mono ? 'font-mono' : ''}`}>{String(field.value)}</span>
      : <span className="text-text-tertiary italic">—</span>
  );

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 py-2.5 border-b border-surface-border last:border-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-secondary font-medium">{field.label}</span>
          <TierBadge tier={field.tier} docUrl={field.docUrl} />
          {field.status && field.status !== 'neutral' && (
            <VerdictPill status={field.status} label={field.status} size="sm" />
          )}
          <Disclosure
            explanation={field.explanation}
            tier={field.tier}
            docUrl={field.docUrl}
            note={field.note}
          />
        </div>
        {showRaw && field.raw && (
          <div className="flex items-start gap-2 flex-wrap">
            <code className="text-xs font-mono text-text-tertiary bg-surface-raised px-1.5 py-0.5 rounded border border-surface-border break-all">
              {field.raw}
            </code>
            <CopyButton value={field.raw} label="raw" />
          </div>
        )}
      </div>
      <div className="text-sm text-text-primary text-right max-w-[280px]">
        {displayValue}
      </div>
    </div>
  );
}
