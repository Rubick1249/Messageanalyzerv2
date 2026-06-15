import { useState } from 'react';

interface Props {
  id: string;
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accentColor?: string;
  animationDelay?: number;
}

export function SectionCard({
  id,
  title,
  icon,
  defaultOpen = true,
  children,
  accentColor,
  animationDelay = 0,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = `${id}-content`;

  return (
    <section
      id={id}
      className="rounded-xl border border-surface-border bg-surface-card overflow-hidden scroll-mt-4"
      style={{
        borderLeftColor: accentColor ?? undefined,
        borderLeftWidth: accentColor ? '3px' : undefined,
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-raised transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-text-tertiary text-sm" aria-hidden="true">{icon}</span>
          )}
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        </div>
        <span
          aria-hidden="true"
          className="text-text-tertiary text-xs transition-transform duration-150"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          id={regionId}
          role="region"
          aria-label={title}
          className="px-4 pb-4 pt-1"
        >
          {children}
        </div>
      )}
    </section>
  );
}
