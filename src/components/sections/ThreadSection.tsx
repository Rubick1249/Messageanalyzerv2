import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';

interface Props {
  result: AnalysisResult;
}

export function ThreadSection({ result }: Props) {
  if (!result.thread) {
    return (
      <div className="text-sm text-text-secondary py-2">
        <p>No Thread-Index header found. This message may not have been sent through an Exchange/Outlook client, or the header was stripped in transit.</p>
      </div>
    );
  }

  const { rootTime, replyDepth } = result.thread;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-surface-raised border border-surface-border p-3 text-xs text-text-tertiary">
        <p>
          <strong className="text-text-secondary">Thread-Index</strong> is decoded per [MS-OXOMSG] §2.2.1.3.
          The 22-byte header block encodes a FILETIME (truncated to 5 bytes → ~minute resolution) and a GUID.
          Each subsequent 5-byte response-level block increments the reply depth counter.
          Root time is approximate; reply depth is exact.
        </p>
      </div>

      <div className="divide-y divide-surface-border">
        <FieldRow field={rootTime} />
        <FieldRow
          field={replyDepth}
          valueDisplay={
            <span className="text-lg font-mono font-semibold text-text-primary">
              {replyDepth.value === 0 ? 'Original' : `Reply #${replyDepth.value}`}
            </span>
          }
        />
      </div>
    </div>
  );
}
