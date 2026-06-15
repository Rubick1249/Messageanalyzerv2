import { useState, useRef } from 'react';

interface Props {
  onAnalyzeText: (text: string) => void;
  analyzing: boolean;
  error: string | null;
}

export function PasteView({ onAnalyzeText, analyzing, error }: Props) {
  const [text, setText] = useState('');
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setText(String(ev.target?.result ?? ''));
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-accent-azure/30 bg-accent-azure/5 text-xs text-accent-azure font-medium">
          <span>Microsoft 365 / EOP / MDO</span>
        </div>
        <h1 className="text-4xl font-semibold text-text-primary tracking-tight mb-3">
          HeaderLens
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          Paste raw email headers to get a detailed, sourced analysis of every field — authentication, delivery path, anti-spam signals, and more.
        </p>
      </div>

      {/* Paste area */}
      <div className="w-full max-w-3xl space-y-3">
        <div
          className={`relative rounded-xl border-2 transition-colors duration-150 ${
            dragging
              ? 'border-accent-azure bg-accent-azure/5'
              : 'border-surface-border bg-surface-card hover:border-surface-raised'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={[
              'Paste raw email headers here…',
              '',
              'In Outlook: File → Properties → Internet headers',
              'In Outlook on the web: ⋯ (More actions) → View → Message details',
              'Drag and drop a .txt or .eml file also works.',
            ].join('\n')}
            className="w-full bg-transparent resize-none text-sm font-mono text-text-primary placeholder:text-text-tertiary p-4 outline-none min-h-[280px] leading-relaxed"
            spellCheck={false}
            aria-label="Raw email headers input"
            disabled={analyzing}
          />
          {dragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-accent-azure/5 pointer-events-none">
              <p className="text-accent-azure font-medium">Drop file to load headers</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-verdict-fail/30 bg-verdict-fail/5 px-4 py-3 text-sm text-verdict-fail">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAnalyzeText(text.trim())}
            disabled={!text.trim() || analyzing}
            className="px-5 py-2 rounded-lg bg-accent-azure text-surface-base font-semibold text-sm hover:bg-accent-azure/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-surface-base/40 border-t-surface-base rounded-full animate-spin" aria-hidden="true" />
                Analyzing…
              </>
            ) : 'Analyze →'}
          </button>
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-text-tertiary text-center pt-1">
          Your header text never leaves this browser. Only extracted domain names are sent to the DNS resolver during analysis. No telemetry.
        </p>
      </div>

      {/* Feature callouts */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        {[
          { icon: '⚡', title: 'Deterministic', body: 'Same input → identical output, every time. No AI guesses.' },
          { icon: '🔬', title: 'Sourced', body: 'Every field carries a Tier A–D trust badge with a doc link where available.' },
          { icon: '🔒', title: 'Client-side', body: 'Parsing runs in your browser. Headers stay on your machine.' },
        ].map(f => (
          <div key={f.title} className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-1.5">
            <div className="text-xl">{f.icon}</div>
            <p className="text-sm font-semibold text-text-primary">{f.title}</p>
            <p className="text-xs text-text-secondary leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
