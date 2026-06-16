import { useRef, useState, useEffect } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { useReducedMotion } from '@/lib/hooks';
import { SectionCard } from './primitives/SectionCard';
import { SummarySection } from './sections/SummarySection';
import { DeliveryPathSection } from './sections/DeliveryPathSection';
import { AuthenticationSection } from './sections/AuthenticationSection';
import { ArcChainSection } from './sections/ArcChainSection';
import { AntiSpamSection } from './sections/AntiSpamSection';
import { MdoSection } from './sections/MdoSection';
import { MessageContextSection } from './sections/MessageContextSection';
import { SensitivityLabelSection } from './sections/SensitivityLabelSection';
import { ImpersonationSection } from './sections/ImpersonationSection';
import { ThreadSection } from './sections/ThreadSection';
import { AttachmentsSection } from './sections/AttachmentsSection';
import { AuthReconciliationSection } from './sections/AuthReconciliationSection';
import { RawHeadersSection } from './sections/RawHeadersSection';

interface Props {
  result: AnalysisResult;
  onBack: () => void;
}

type GroupColor = { text: string; bg: string; border: string; accent: string };

const GROUP_COLORS: Record<string, GroupColor> = {
  delivery:       { text: 'text-accent-azure',   bg: 'bg-accent-azure/10',   border: 'border-accent-azure/30',   accent: 'var(--color-accent-azure)' },
  auth:           { text: 'text-accent-violet',  bg: 'bg-accent-violet/10',  border: 'border-accent-violet/30',  accent: 'var(--color-accent-violet)' },
  filtering:      { text: 'text-verdict-warn',   bg: 'bg-verdict-warn/10',   border: 'border-verdict-warn/30',   accent: 'var(--color-verdict-warn)' },
  message:        { text: 'text-verdict-info',   bg: 'bg-verdict-info/10',   border: 'border-verdict-info/30',   accent: 'var(--color-verdict-info)' },
  raw:            { text: 'text-text-tertiary',  bg: 'bg-surface-raised',    border: 'border-surface-border',    accent: '' },
};

const SECTION_GROUPS = [
  {
    id: 'delivery',
    label: 'Delivery & Routing',
    sections: [
      { id: 'delivery-path', label: 'Delivery Path' },
    ],
  },
  {
    id: 'auth',
    label: 'Authentication',
    sections: [
      { id: 'auth',           label: 'Authentication' },
      { id: 'arc',            label: 'ARC Chain' },
      { id: 'reconciliation', label: 'Auth Reconciliation' },
    ],
  },
  {
    id: 'filtering',
    label: 'Filtering & Protection',
    sections: [
      { id: 'antispam', label: 'Anti-Spam' },
      { id: 'mdo',      label: 'MDO' },
    ],
  },
  {
    id: 'message',
    label: 'Message Details',
    sections: [
      { id: 'context',       label: 'Message Context' },
      { id: 'label',         label: 'Sensitivity Label' },
      { id: 'impersonation', label: 'Impersonation' },
      { id: 'thread',        label: 'Thread' },
      { id: 'attachments',   label: 'Attachments' },
    ],
  },
  {
    id: 'raw',
    label: 'Raw Data',
    sections: [
      { id: 'raw', label: 'Raw Headers' },
    ],
  },
];

const ALL_SECTIONS = [
  { id: 'summary' },
  ...SECTION_GROUPS.flatMap(g => g.sections),
];

export function ResultsView({ result, onBack }: Props) {
  const reduced = useReducedMotion();
  const [activeSection, setActiveSection] = useState('summary');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ALL_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      sectionRefs.current[id] = el;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const sectionAnimation = (index: number) =>
    reduced ? {} : { animation: `fadeSlideIn 0.2s ease-out ${index * 60}ms both` };

  function renderSectionContent(id: string) {
    switch (id) {
      case 'delivery-path':   return <DeliveryPathSection result={result} />;
      case 'auth':            return <AuthenticationSection result={result} />;
      case 'arc':             return <ArcChainSection result={result} />;
      case 'reconciliation':  return <AuthReconciliationSection result={result} />;
      case 'antispam':        return <AntiSpamSection result={result} />;
      case 'mdo':             return <MdoSection result={result} />;
      case 'context':         return <MessageContextSection result={result} />;
      case 'label':           return <SensitivityLabelSection result={result} />;
      case 'impersonation':   return <ImpersonationSection result={result} />;
      case 'thread':          return <ThreadSection result={result} />;
      case 'attachments':     return <AttachmentsSection result={result} />;
      case 'raw':             return <RawHeadersSection result={result} />;
      default:                return null;
    }
  }

  function sectionTitle(id: string): string {
    for (const g of SECTION_GROUPS) {
      const s = g.sections.find(s => s.id === id);
      if (s) return s.label;
    }
    return id;
  }

  function sectionIcon(id: string): string {
    const icons: Record<string, string> = {
      'delivery-path':  '→',
      'auth':           '🔐',
      'arc':            '🔗',
      'antispam':       '🛡️',
      'mdo':            '🔎',
      'context':        '🌐',
      'label':          '🏷️',
      'impersonation':  '⚠️',
      'thread':         '💬',
      'attachments':    '📎',
      'reconciliation': '⚖️',
      'raw':            '📋',
    };
    return icons[id] ?? '';
  }

  const animationOrder = ['summary', ...SECTION_GROUPS.flatMap(g => g.sections.map(s => s.id))];
  const animIdx = (id: string) => sectionAnimation(animationOrder.indexOf(id));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface-card/95 backdrop-blur border-b border-surface-border">
        <div className="w-full px-4 lg:px-8 py-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-text-secondary hover:text-accent-azure transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span aria-hidden="true">←</span> New analysis
          </button>
          <span className="text-surface-border" aria-hidden="true">|</span>
          <h1 className="text-sm font-semibold text-text-primary truncate">
            {result.meta.subject.value ?? result.meta.subject.raw}
          </h1>
        </div>

        {/* Mobile section tabs */}
        <nav aria-label="Jump to section" className="lg:hidden border-t border-surface-border overflow-x-auto">
          <div className="flex gap-0 px-2 py-1">
            <button
              type="button"
              onClick={() => scrollTo('summary')}
              aria-current={activeSection === 'summary' ? 'true' : undefined}
              className={`shrink-0 px-3 py-1 text-xs rounded transition-colors ${
                activeSection === 'summary'
                  ? 'text-accent-azure bg-accent-azure/10'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Summary
            </button>
            {SECTION_GROUPS.flatMap(g => g.sections).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                aria-current={activeSection === id ? 'true' : undefined}
                className={`shrink-0 px-3 py-1 text-xs rounded transition-colors ${
                  activeSection === id
                    ? 'text-accent-azure bg-accent-azure/10'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="flex flex-1 w-full px-4 lg:px-8">
        {/* Left rail (desktop) */}
        <aside className="hidden lg:flex flex-col w-60 shrink-0 py-6 pr-6 border-r border-surface-border/40">
          <nav aria-label="Sections" className="sticky top-20 space-y-0.5 overflow-y-auto max-h-[calc(100vh-6rem)]">
            {/* Summary */}
            <button
              type="button"
              onClick={() => scrollTo('summary')}
              aria-current={activeSection === 'summary' ? 'true' : undefined}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                activeSection === 'summary'
                  ? 'bg-accent-azure/15 text-accent-azure font-medium'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-raised'
              }`}
            >
              ✦ Summary
            </button>

            {/* Groups */}
            {SECTION_GROUPS.map(group => {
              const colors = GROUP_COLORS[group.id];
              return (
                <div key={group.id} className="pt-3">
                  <div className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${colors.text} opacity-70`}>
                    {group.label}
                  </div>
                  {group.sections.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => scrollTo(id)}
                      aria-current={activeSection === id ? 'true' : undefined}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        activeSection === id
                          ? `${colors.bg} ${colors.text} font-medium`
                          : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-raised'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 py-6 space-y-6 pb-24 lg:pl-6">
          {/* Section 1 — Summary */}
          <div id="summary" style={animIdx('summary')} className="rounded-xl border border-surface-border bg-surface-card overflow-hidden scroll-mt-20">
            <div className="px-5 py-3.5 bg-surface-raised/40 border-b border-surface-border/60 flex items-center gap-2.5">
              <span aria-hidden="true" className="text-base leading-none">✦</span>
              <span role="heading" aria-level={2} className="text-sm font-semibold text-text-primary tracking-wide">Analysis Summary</span>
            </div>
            <div className="px-5 pb-5 pt-3">
              <SummarySection result={result} />
            </div>
          </div>

          {/* Section groups */}
          {SECTION_GROUPS.map(group => {
            const colors = GROUP_COLORS[group.id];
            return (
              <div key={group.id} className="space-y-3">
                {/* Group header divider */}
                <div className="flex items-center gap-3">
                  <div className={`h-px flex-1 ${colors.border} border-t`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${colors.text} ${colors.bg} border ${colors.border}`}>
                    {group.label}
                  </span>
                  <div className={`h-px flex-1 ${colors.border} border-t`} />
                </div>

                {/* Sections in this group */}
                <div className="space-y-3">
                  {group.sections.map(({ id }) => (
                    <div key={id} style={animIdx(id)} className="scroll-mt-20">
                      <SectionCard
                        id={id}
                        title={sectionTitle(id)}
                        icon={sectionIcon(id)}
                        accentColor={colors.accent || undefined}
                      >
                        {renderSectionContent(id)}
                      </SectionCard>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
