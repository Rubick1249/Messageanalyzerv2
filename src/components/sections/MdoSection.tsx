import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

export function MdoSection({ result }: Props) {
  const { safeLinks, safeAttachments } = result.mdo;
  const hasEvidence = safeLinks.value || safeAttachments.value;

  return (
    <div className="space-y-4">
      {!hasEvidence && (
        <div className="rounded-lg bg-surface-raised border border-surface-border p-3 text-sm text-text-secondary">
          <p>
            <strong className="text-text-primary">No MDO processing stamps found</strong> in this header.
            Safe Links / Safe Attachments may have been processed by the sending organization's EOP before delivery,
            or the recipient's Defender for Office 365 policy may not apply to this message class.
          </p>
          <p className="text-xs text-text-tertiary mt-2">
            HeaderLens only reports what can be directly observed in the header.
            Absence of stamps does not mean MDO is not licensed or active.
          </p>
        </div>
      )}

      <div className="divide-y divide-surface-border">
        <FieldRow
          field={safeLinks}
          valueDisplay={
            <VerdictPill
              status={safeLinks.value ? 'info' : 'neutral'}
              label={safeLinks.value ? 'Processed' : 'No evidence'}
              size="sm"
            />
          }
        />
        <FieldRow
          field={safeAttachments}
          valueDisplay={
            <VerdictPill
              status={safeAttachments.value ? 'info' : 'neutral'}
              label={safeAttachments.value ? 'Processed' : 'No evidence'}
              size="sm"
            />
          }
        />
      </div>
    </div>
  );
}
