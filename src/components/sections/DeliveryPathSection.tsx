import type { AnalysisResult } from '@/lib/types';
import { HopTimeline } from '../primitives/HopTimeline';

interface Props {
  result: AnalysisResult;
}

export function DeliveryPathSection({ result }: Props) {
  const totalDelay = result.deliveryPath.reduce((sum, h) => sum + h.delaySeconds, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm text-text-secondary">
        <span><strong className="text-text-primary">{result.deliveryPath.length}</strong> hops</span>
        <span>·</span>
        <span>Total transit: <strong className="text-text-primary">{totalDelay}s</strong></span>
      </div>

      <div className="bg-surface-base rounded-lg p-4">
        <HopTimeline hops={result.deliveryPath} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: 'Origin', color: 'text-accent-azure', bg: 'bg-accent-azure/15 border-accent-azure/40' },
          { label: 'Sender EOP', color: 'text-accent-violet', bg: 'bg-accent-violet/15 border-accent-violet/40' },
          { label: 'Recipient MX', color: 'text-verdict-pass', bg: 'bg-verdict-pass/15 border-verdict-pass/40' },
          { label: 'Internal', color: 'text-text-secondary', bg: 'bg-surface-raised border-surface-border' },
          { label: 'Delivered', color: 'text-verdict-pass', bg: 'bg-verdict-pass/15 border-verdict-pass/40' },
          { label: 'Foreign', color: 'text-verdict-warn', bg: 'bg-verdict-warn/15 border-verdict-warn/40' },
        ].map(({ label, color, bg }) => (
          <span key={label} className={`px-2 py-0.5 rounded border font-medium ${bg} ${color}`}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
