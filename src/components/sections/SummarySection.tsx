import type { AnalysisResult } from '@/lib/types';
import { VerdictPill } from '../primitives/VerdictPill';
import { CopyButton } from '../primitives/CopyButton';
import { useCountUp } from '@/lib/hooks';

interface Props {
  result: AnalysisResult;
}

function VerdictCard({ title, verdict }: { title: string; verdict: { state: string; status: 'pass'|'warn'|'fail'|'info'; evidence: string[] } }) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-raised p-4 flex flex-col gap-2">
      <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">{title}</p>
      <VerdictPill status={verdict.status} label={verdict.state} size="lg" />
      <ul className="mt-1 space-y-0.5">
        {verdict.evidence.map((e, i) => (
          <li key={i} className="text-xs text-text-tertiary flex items-start gap-1.5">
            <span className="text-text-tertiary mt-0.5" aria-hidden="true">·</span>
            <span>{e}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SummarySection({ result }: Props) {
  const latency = useCountUp(result.meta.endToEndLatencySeconds.value ?? 0);

  return (
    <div className="space-y-5">
      {/* Three verdict cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <VerdictCard title="Authentication" verdict={result.verdicts.authentication} />
        <VerdictCard title="Disposition" verdict={result.verdicts.disposition} />
        <VerdictCard title="Delivery" verdict={result.verdicts.delivery} />
      </div>

      {/* Network Message ID */}
      <div className="rounded-xl border border-accent-azure/30 bg-accent-azure/5 p-4 space-y-2">
        <p className="text-xs text-accent-azure font-semibold uppercase tracking-wide">
          Network Message ID
          <span className="ml-2 font-normal normal-case text-text-tertiary">
            — use this in Message Trace or Threat Explorer
          </span>
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-sm font-mono text-text-primary break-all flex-1">
            {result.meta.networkMessageId.raw}
          </code>
          <CopyButton value={result.meta.networkMessageId.raw} label="NMI" />
        </div>
        <p className="text-xs text-text-tertiary">
          Exchange Admin Center → Mail flow → Message trace, or Defender → Threat Explorer → search by Network Message ID
        </p>
      </div>

      {/* Message metadata — use dl/dt/dd for proper label-value semantics */}
      <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-3">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-secondary font-medium">Subject</dt>
          <dd className="text-text-primary break-words">{result.meta.subject.raw}</dd>

          <dt className="text-text-secondary font-medium">From</dt>
          <dd className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-text-primary text-sm break-all">{result.meta.fromHeader.raw}</span>
          </dd>

          <dt className="text-text-secondary font-medium">Envelope From</dt>
          <dd className="font-mono text-text-primary text-sm break-all">{result.meta.envelopeFrom.raw}</dd>

          <dt className="text-text-secondary font-medium">Date</dt>
          <dd className="text-text-primary">{result.meta.creationTime.raw}</dd>

          <dt className="text-text-secondary font-medium">Latency</dt>
          <dd className="flex items-center gap-2">
            <span className={`font-mono font-semibold text-lg ${
              (result.meta.endToEndLatencySeconds.value ?? 0) > 60
                ? 'text-verdict-warn'
                : 'text-verdict-pass'
            }`}>
              {latency}s
            </span>
            <span className="text-xs text-text-tertiary">{result.meta.endToEndLatencySeconds.raw}</span>
          </dd>
        </dl>
      </div>
    </div>
  );
}
