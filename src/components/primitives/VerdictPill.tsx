import type { StatusValue } from '@/lib/types';

interface Props {
  status: StatusValue;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

const CONFIG: Record<StatusValue, { color: string; icon: string; bg: string }> = {
  pass:        { color: 'text-verdict-pass',    icon: '✓', bg: 'bg-verdict-pass/10 border-verdict-pass/30' },
  warn:        { color: 'text-verdict-warn',    icon: '⚠', bg: 'bg-verdict-warn/10 border-verdict-warn/30' },
  fail:        { color: 'text-verdict-fail',    icon: '✗', bg: 'bg-verdict-fail/10 border-verdict-fail/30' },
  info:        { color: 'text-verdict-info',    icon: 'ℹ', bg: 'bg-verdict-info/10 border-verdict-info/30' },
  neutral:     { color: 'text-text-secondary',  icon: '—', bg: 'bg-surface-raised border-surface-border' },
  unavailable: { color: 'text-text-tertiary',   icon: '?', bg: 'bg-surface-raised border-surface-border/50' },
};

export function VerdictPill({ status, label, size = 'md' }: Props) {
  const cfg = CONFIG[status];
  const sizeClass = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : size === 'lg'
    ? 'text-base px-4 py-2 gap-2'
    : 'text-sm px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${cfg.bg} ${cfg.color}`}
      role="status"
    >
      <span aria-hidden="true" className="leading-none">{cfg.icon}</span>
      <span>{label}</span>
    </span>
  );
}
