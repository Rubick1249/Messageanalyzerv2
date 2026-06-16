import type { Tier } from '@/lib/types';

interface Props {
  tier: Tier;
  docUrl?: string;
}

const CONFIG: Record<Tier, { label: string; title: string; className: string }> = {
  A: {
    label: 'A',
    title: 'Tier A — Documented & authoritative (official Microsoft specification)',
    className: 'bg-accent-azure text-surface-base border-accent-azure',
  },
  B: {
    label: 'B',
    title: 'Tier B — Documented, solid (official but not in the header docs page)',
    className: 'bg-transparent text-accent-azure border-accent-azure',
  },
  C: {
    label: 'community',
    title: 'Tier C — Convention: broad community consensus, no official Microsoft contract',
    className: 'bg-verdict-warn/15 text-verdict-warn border-verdict-warn/40',
  },
  D: {
    label: 'undocumented',
    title: 'Tier D — Undocumented / Microsoft-internal. Raw value + best-effort gloss only.',
    className: 'bg-transparent text-text-tertiary border-text-tertiary/40 border-dashed',
  },
};

export function TierBadge({ tier, docUrl }: Props) {
  const cfg = CONFIG[tier];
  const badge = (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-mono font-medium leading-none ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );

  if (docUrl && (tier === 'A' || tier === 'B')) {
    return (
      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        aria-label={cfg.title}
      >
        {badge}
      </a>
    );
  }

  return badge;
}
