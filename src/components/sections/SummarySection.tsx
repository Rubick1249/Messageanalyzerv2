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
  const latencyValue = result.meta.endToEndLatencySeconds.value;
  const latency = useCountUp(latencyValue ?? 0);
  const hasLatency = latencyValue !== null;

  const toList = result.meta.to.map(f => f.raw).join(', ');
  const ccList = result.meta.cc.map(f => f.raw).join(', ');

  return (
    <div className="space-y-5">
      {/* Three verdict cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <VerdictCard title="Authentication" verdict={result.verdicts.authentication} />
        <VerdictCard title="Disposition"   verdict={result.verdicts.disposition} />
        <VerdictCard title="Delivery"      verdict={result.verdicts.delivery} />
      </div>

      {/* Network Message ID — only rendered when the header was present */}
      {result.meta.networkMessageId.raw && (
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
      )}

      {/* Reply-To warning — security-relevant phishing signal */}
      {result.meta.replyTo && (
        <div className="rounded-xl border border-verdict-warn/40 bg-verdict-warn/5 p-4 space-y-1.5">
          <div className="flex items-center gap-2">
            <VerdictPill status="warn" label="Reply-To mismatch" size="sm" />
            <span className="text-xs text-text-tertiary">replies will go to a different address than the sender</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-sm font-mono text-verdict-warn break-all flex-1">
              {result.meta.replyTo.raw}
            </code>
            <CopyButton value={result.meta.replyTo.raw} label="Reply-To" />
          </div>
        </div>
      )}

      {/* Message metadata */}
      <div className="rounded-xl border border-surface-border bg-surface-raised p-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-secondary font-medium">Subject</dt>
          <dd className="text-text-primary break-words">{result.meta.subject.raw}</dd>

          <dt className="text-text-secondary font-medium">From</dt>
          <dd className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-text-primary text-sm break-all">{result.meta.fromHeader.raw}</span>
          </dd>

          <dt className="text-text-secondary font-medium">Envelope From</dt>
          <dd className="font-mono text-text-primary text-sm break-all">{result.meta.envelopeFrom.raw}</dd>

          {result.meta.resentFrom && (
            <>
              <dt className="text-text-secondary font-medium">Resent-From</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-text-primary text-sm break-all">{result.meta.resentFrom.raw}</span>
                <VerdictPill status="info" label="forwarded" size="sm" />
              </dd>
            </>
          )}

          {toList && (
            <>
              <dt className="text-text-secondary font-medium">To</dt>
              <dd className="font-mono text-text-primary text-sm break-all">{toList}</dd>
            </>
          )}

          {ccList && (
            <>
              <dt className="text-text-secondary font-medium">Cc</dt>
              <dd className="font-mono text-text-primary text-sm break-all">{ccList}</dd>
            </>
          )}

          {result.meta.messageId.raw && (
            <>
              <dt className="text-text-secondary font-medium">Message-ID</dt>
              <dd className="flex items-center gap-2 flex-wrap">
                <code className="font-mono text-text-tertiary text-xs break-all flex-1">{result.meta.messageId.raw}</code>
                <CopyButton value={result.meta.messageId.raw} label="Message-ID" />
              </dd>
            </>
          )}

          <dt className="text-text-secondary font-medium">Date</dt>
          <dd className="text-text-primary">{result.meta.creationTime.raw}</dd>

          <dt className="text-text-secondary font-medium">Latency</dt>
          <dd className="flex items-center gap-2">
            {hasLatency ? (
              <span className={`font-mono font-semibold text-lg ${
                (latencyValue ?? 0) > 60 ? 'text-verdict-warn' : 'text-verdict-pass'
              }`}>
                {latency}s
              </span>
            ) : (
              <span className="font-mono text-text-tertiary">— <span className="text-xs font-sans">timestamps absent from headers</span></span>
            )}
          </dd>
        </dl>
      </div>
    </div>
  );
}
