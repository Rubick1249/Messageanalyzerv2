import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

export function AttachmentsSection({ result }: Props) {
  const attach = result.attachments;

  return (
    <div className="space-y-4">
      <div className="divide-y divide-surface-border">
        <FieldRow
          field={attach}
          valueDisplay={
            attach.value ? (
              <div className="text-right space-y-1">
                <VerdictPill
                  status={attach.value.hasAttach ? 'warn' : 'neutral'}
                  label={attach.value.hasAttach ? 'Has attachments' : 'No attachments'}
                  size="sm"
                />
                <code className="block text-xs font-mono text-text-tertiary">{attach.value.contentType}</code>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
