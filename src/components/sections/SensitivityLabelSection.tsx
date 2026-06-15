import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { VerdictPill } from '../primitives/VerdictPill';

interface Props {
  result: AnalysisResult;
}

export function SensitivityLabelSection({ result }: Props) {
  const label = result.sensitivityLabel;

  if (!label) {
    return (
      <div className="text-sm text-text-secondary py-2">
        <p>No MSIP_Label_* block found in this header. The message was not labeled with Microsoft Purview Information Protection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-accent-violet/5 border border-accent-violet/30 p-3 flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{label.name.raw}</p>
          <p className="text-xs text-text-tertiary">{label.guid.raw}</p>
        </div>
        <div className="ml-auto">
          <VerdictPill
            status={label.enabled.value ? 'info' : 'neutral'}
            label={label.enabled.value ? 'Active' : 'Disabled'}
            size="sm"
          />
        </div>
      </div>

      <div className="divide-y divide-surface-border">
        <FieldRow field={label.name} />
        <FieldRow field={label.method} />
        <FieldRow field={label.setDate} />
        <FieldRow field={label.enabled} valueDisplay={
          <VerdictPill
            status={label.enabled.value ? 'pass' : 'neutral'}
            label={String(label.enabled.value)}
            size="sm"
          />
        } />
        <FieldRow field={label.siteId} mono />
        <FieldRow field={label.guid} mono />
        <FieldRow field={label.contentBits} mono />
      </div>
    </div>
  );
}
