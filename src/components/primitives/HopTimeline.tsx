import type { Hop } from '@/lib/types';
import { useReducedMotion } from '@/lib/hooks';

interface Props {
  hops: Hop[];
}

const ROLE_CONFIG: Record<Hop['role'], { label: string; color: string; bg: string }> = {
  origin:              { label: 'Origin',           color: 'text-accent-azure',   bg: 'bg-accent-azure/15 border-accent-azure/40' },
  'sender-egress':     { label: 'Sender EOP',        color: 'text-accent-violet',  bg: 'bg-accent-violet/15 border-accent-violet/40' },
  'recipient-ingress': { label: 'Recipient MX',       color: 'text-verdict-pass',   bg: 'bg-verdict-pass/15 border-verdict-pass/40' },
  'internal-transport':{ label: 'Internal',           color: 'text-text-secondary', bg: 'bg-surface-raised border-surface-border' },
  'final-delivery':    { label: 'Delivered',          color: 'text-verdict-pass',   bg: 'bg-verdict-pass/15 border-verdict-pass/40' },
  foreign:             { label: 'Foreign',            color: 'text-verdict-warn',   bg: 'bg-verdict-warn/15 border-verdict-warn/40' },
  unknown:             { label: 'Unknown',            color: 'text-text-tertiary',  bg: 'bg-surface-raised border-surface-border/50' },
};

function DelayBadge({ seconds }: { seconds: number }) {
  if (seconds === 0) return null;
  const isHigh = seconds > 30;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${
      isHigh ? 'text-verdict-warn bg-verdict-warn/15 border border-verdict-warn/40' : 'text-text-tertiary bg-surface-base border border-surface-border'
    }`}>
      +{seconds}s
    </span>
  );
}

export function HopTimeline({ hops }: Props) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-0 relative">
      {hops.map((hop, i) => {
        const role = ROLE_CONFIG[hop.role];
        const isLast = i === hops.length - 1;

        return (
          <div key={i} className="flex gap-3">
            {/* Left column: dot + connector */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${role.bg} ${role.color}`}>
                {hop.index + 1}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[2rem] bg-surface-border origin-top ${
                    reduced ? '' : 'animate-[scaleYIn_0.3s_ease-out_forwards]'
                  }`}
                  style={reduced ? {} : { animationDelay: `${i * 80}ms` }}
                />
              )}
            </div>

            {/* Right column: hop details */}
            <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${role.bg} ${role.color}`}>
                  {role.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {hop.region && (
                    <span className="text-xs text-text-tertiary">{hop.region}</span>
                  )}
                  <DelayBadge seconds={hop.delaySeconds} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs text-text-tertiary w-5 shrink-0">from</span>
                  <code className="text-xs font-mono text-text-primary break-all">{hop.from}</code>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs text-text-tertiary w-5 shrink-0">by</span>
                  <code className="text-xs font-mono text-text-secondary break-all">{hop.by}</code>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-text-tertiary">{hop.with}</span>
                  {hop.tls && (
                    <span className="text-xs font-mono text-verdict-pass bg-verdict-pass/10 px-1.5 py-0.5 rounded border border-verdict-pass/30">
                      {hop.tls}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-tertiary">{hop.owner}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
