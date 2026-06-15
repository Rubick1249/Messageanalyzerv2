import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { VerdictPill } from '../primitives/VerdictPill';
import { TierBadge } from '../primitives/TierBadge';

interface Props {
  result: AnalysisResult;
}

export function ArcChainSection({ result }: Props) {
  const { arc } = result.authentication;

  if (arc.sets.length === 0) {
    return (
      <div className="text-sm text-text-secondary py-2 space-y-2">
        <p>No ARC (Authenticated Received Chain) sets found in this message header.</p>
        <p className="text-text-tertiary text-xs">
          ARC seals are added by intermediary mail systems (forwarders, mailing lists) when a message is relayed
          in a way that would otherwise break DMARC alignment. Their absence is normal for direct delivery paths.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {arc.overrodeAuthFailure && (
        <div className="rounded-lg bg-accent-violet/10 border border-accent-violet/40 p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent-violet font-semibold">⬡ ARC override active</span>
          </div>
          <p className="text-text-secondary text-xs">
            The ARC chain was used to override what would have been an authentication failure.
            A trusted ARC sealer (<code className="font-mono">ltdi=1</code>) vouched for the original authentication
            (<code className="font-mono">oda=1</code>), allowing EOP to honor the preserved passing results.
          </p>
        </div>
      )}

      {arc.sets.map((set) => (
        <div key={set.instance} className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">ARC Set i={set.instance}</h3>
            <div className="flex items-center gap-2">
              <VerdictPill
                status={set.cv.value === 'pass' ? 'pass' : set.cv.value === 'fail' ? 'fail' : 'info'}
                label={`cv=${set.cv.value ?? '?'}`}
                size="sm"
              />
            </div>
          </div>

          {/* cv */}
          <div className="divide-y divide-surface-border">
            <FieldRow field={set.cv} />
          </div>

          {/* Preserved auth */}
          {set.preservedAuth && (
            <div className="mt-2">
              <p className="text-xs text-text-tertiary mb-1.5">Preserved authentication results:</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(set.preservedAuth).map(([k, v]) => v && (
                  <span key={k} className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    v === 'pass' ? 'text-verdict-pass bg-verdict-pass/10 border-verdict-pass/30' : 'text-text-secondary bg-surface-base border-surface-border'
                  }`}>
                    {k}={v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* oda + ltdi (Tier D) */}
          {(set.oda || set.ltdi) && (
            <div className="pt-2 border-t border-surface-border space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TierBadge tier="D" />
                <span className="text-xs text-text-tertiary">Undocumented Microsoft-internal fields — best-effort gloss only</span>
              </div>
              {set.oda && <FieldRow field={set.oda} />}
              {set.ltdi && <FieldRow field={set.ltdi} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
