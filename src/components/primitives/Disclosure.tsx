import { useState, useId } from 'react';
import { TierBadge } from './TierBadge';
import type { Tier } from '@/lib/types';

interface Props {
  explanation: string;
  tier: Tier;
  docUrl?: string;
  note?: string;
}

export function Disclosure({ explanation, tier, docUrl, note }: Props) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const panelId = `disc-${uid}`;

  return (
    <span className="inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-surface-border text-text-tertiary hover:border-accent-azure hover:text-accent-azure transition-colors duration-150 text-xs leading-none"
        aria-label={open ? 'Hide explanation' : 'Show explanation'}
      >
        ℹ
      </button>

      {/* Panel stays in DOM so aria-controls always references an existing element. */}
      <div
        id={panelId}
        hidden={!open}
        className="mt-2 p-3 rounded-lg bg-surface-raised border border-surface-border text-sm text-text-secondary leading-relaxed space-y-2"
      >
        <p>{explanation}</p>
        {note && (
          <p className="text-text-tertiary text-xs italic border-t border-surface-border pt-2">
            Note: {note}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1">
          <TierBadge tier={tier} docUrl={docUrl} />
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-azure hover:underline"
            >
              Official documentation ↗
            </a>
          )}
        </div>
      </div>
    </span>
  );
}
