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

const SECTIONS = [
  { id: 'summary',       label: 'Summary' },
  { id: 'delivery-path', label: 'Delivery path' },
  { id: 'auth',          label: 'Authentication' },
  { id: 'arc',           label: 'ARC chain' },
  { id: 'antispam',      label: 'Anti-spam' },
  { id: 'mdo',           label: 'MDO' },
  { id: 'context',       label: 'Message context' },
  { id: 'label',         label: 'Sensitivity label' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'thread',        label: 'Thread' },
  { id: 'attachments',   label: 'Attachments' },
  { id: 'reconciliation',label: 'Auth reconciliation' },
  { id: 'raw',           label: 'Raw headers' },
];

export function ResultsView({ result, onBack }: Props) {
  const reduced = useReducedMotion();
  const [activeSection, setActiveSection] = useState('summary');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  // Scrollspy via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
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
    reduced
      ? {}
      : { animation: `fadeSlideIn 0.2s ease-out ${index * 60}ms both` };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface-card/95 backdrop-blur border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-text-secondary hover:text-accent-azure transition-colors flex items-center gap-1.5"
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
            {SECTIONS.map(({ id, label }) => (
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

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4">
        {/* Left rail (desktop) */}
        <aside className="hidden lg:flex flex-col w-48 shrink-0 py-6 pr-4">
          <nav aria-label="Sections" className="sticky top-20 space-y-0.5">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                aria-current={activeSection === id ? 'true' : undefined}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  activeSection === id
                    ? 'bg-accent-azure/15 text-accent-azure font-medium'
                    : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-raised'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 py-6 space-y-4 pb-24">
          {/* Section 1 — Summary (not collapsible, always shown) */}
          <div id="summary" style={sectionAnimation(0)} className="rounded-xl border border-surface-border bg-surface-card p-4 scroll-mt-20">
            <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span aria-hidden="true">✦</span> Analysis Summary
            </h2>
            <SummarySection result={result} />
          </div>

          {/* Sections 2–13 */}
          {[
            { id: 'delivery-path', title: '2. Delivery Path',               icon: '→', content: <DeliveryPathSection result={result} /> },
            { id: 'auth',          title: '3. Authentication',              icon: '🔐', content: <AuthenticationSection result={result} />, },
            { id: 'arc',           title: '4. ARC Chain',                   icon: '⬡', accent: 'var(--color-accent-violet)', content: <ArcChainSection result={result} /> },
            { id: 'antispam',      title: '5. Anti-Spam',                   icon: '🛡', content: <AntiSpamSection result={result} /> },
            { id: 'mdo',           title: '6. MDO — Safe Links / Safe Attachments', icon: '🔎', content: <MdoSection result={result} /> },
            { id: 'context',       title: '7. Message Context',             icon: '🌐', content: <MessageContextSection result={result} /> },
            { id: 'label',         title: '8. Sensitivity Label',           icon: '🏷', content: <SensitivityLabelSection result={result} /> },
            { id: 'impersonation', title: '9. Impersonation / BEC Signals', icon: '⚠', content: <ImpersonationSection result={result} /> },
            { id: 'thread',        title: '10. Thread / Conversation',      icon: '💬', content: <ThreadSection result={result} /> },
            { id: 'attachments',   title: '11. Attachments & Structure',    icon: '📎', content: <AttachmentsSection result={result} /> },
            { id: 'reconciliation',title: '12. Auth-Results Reconciliation',icon: '⚖', content: <AuthReconciliationSection result={result} /> },
            { id: 'raw',           title: '13. Raw Headers',                icon: '⌨', content: <RawHeadersSection result={result} /> },
          ].map(({ id, title, icon, accent, content }, idx) => (
            <div key={id} style={sectionAnimation(idx + 1)} className="scroll-mt-20">
              <SectionCard id={id} title={title} icon={icon} accentColor={accent}>
                {content}
              </SectionCard>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
