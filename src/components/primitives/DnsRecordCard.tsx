import type { StatusValue } from '@/lib/types';
import { VerdictPill } from './VerdictPill';
import { CopyButton } from './CopyButton';

interface Props {
  type: string;
  name: string;
  value: string;
  status: StatusValue;
  note?: string;
}

export function DnsRecordCard({ type, name, value, status, note }: Props) {
  return (
    <div
      className="rounded-lg border border-surface-border bg-surface-raised p-3 space-y-2"
      style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-accent-azure)' }}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-accent-azure bg-accent-azure/10 px-1.5 py-0.5 rounded border border-accent-azure/30">
            {type}
          </span>
          <span className="text-xs font-mono text-text-secondary break-all">{name}</span>
        </div>
        <VerdictPill status={status} label={status} size="sm" />
      </div>
      <div className="flex items-start gap-2">
        <code className="flex-1 text-xs font-mono text-text-primary break-all leading-relaxed">
          {value}
        </code>
        <CopyButton value={value} label="record" />
      </div>
      {note && <p className="text-xs text-text-tertiary italic">{note}</p>}
    </div>
  );
}
