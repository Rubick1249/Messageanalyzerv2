import { useState, useRef } from 'react';

interface Props {
  text: string;
  onTextChange: (text: string) => void;
  onAnalyzeText: (text: string) => void;
  analyzing: boolean;
  error: string | null;
}

export function PasteView({ text, onTextChange, onAnalyzeText, analyzing, error }: Props) {
  const [dragging, setDragging] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => onTextChange(String(ev.target?.result ?? ''));
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
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
          className={`relative rounded-xl transition-colors duration-150 ${
            dragging
              ? 'border-2 border-accent-azure bg-accent-azure/5'
              : text
              ? 'border-2 border-surface-border bg-surface-card hover:border-surface-raised'
              : 'border-2 border-dashed border-surface-border/50 bg-surface-card hover:border-accent-azure/40'
          }`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <label htmlFor="header-input" className="sr-only">Raw email headers</label>
          <textarea
            id="header-input"
            ref={textareaRef}
            value={text}
            onChange={e => onTextChange(e.target.value)}
            placeholder="Paste raw email headers here…"
            className="w-full bg-transparent resize-none text-sm font-mono text-text-primary placeholder:text-text-tertiary p-4 outline-none min-h-[280px] leading-relaxed"
            spellCheck={false}
            disabled={analyzing}
          />
          {dragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-accent-azure/5 pointer-events-none">
              <p className="text-accent-azure font-medium">Drop file to load headers</p>
            </div>
          )}
        </div>

        {/* Collapsible instructions */}
        <div>
          <button
            type="button"
            onClick={() => setShowInstructions(v => !v)}
            className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            aria-expanded={showInstructions}
          >
            <span aria-hidden="true" className="transition-transform duration-150" style={{ display: 'inline-block', transform: showInstructions ? 'rotate(90deg)' : 'rotate(0deg)' }}>▸</span>
            Where do I find headers?
          </button>
          {showInstructions && (
            <div className="mt-2 p-3 rounded-lg border border-surface-border bg-surface-raised text-xs space-y-1.5">
              <p><strong className="text-text-primary font-medium">Outlook desktop:</strong> <span className="text-text-secondary">File → Properties → Internet headers</span></p>
              <p><strong className="text-text-primary font-medium">Outlook on the web:</strong> <span className="text-text-secondary">⋯ (More actions) → View → Message details</span></p>
              <p className="text-text-tertiary">Drag and drop a .txt or .eml file also works.</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-verdict-fail/30 bg-verdict-fail/5 px-4 py-3 text-sm text-verdict-fail"
          >
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
            ) : (
              <>Analyze <span aria-hidden="true">→</span></>
            )}
          </button>

          {/* Keyboard-accessible file picker (alternative to drag-and-drop) */}
          <input
            type="file"
            id="file-load"
            accept=".txt,.eml"
            className="sr-only"
            onChange={handleFileInput}
          />
          <label
            htmlFor="file-load"
            className="px-4 py-2 rounded-lg border border-surface-border/60 text-sm text-text-tertiary hover:border-accent-azure/60 hover:text-accent-azure cursor-pointer transition-colors duration-150 bg-transparent"
          >
            Load file
          </label>
        </div>

        {/* Privacy notice */}
        <p className="text-xs text-text-tertiary text-center pt-1">
          Your header text never leaves this browser. Only the sender&apos;s domain names are sent to Cloudflare and Google DNS-over-HTTPS resolvers for SPF, DKIM, and DMARC lookups. No telemetry.
        </p>
      </div>

      {/* Feature callouts */}
      <div className="mt-14 w-full max-w-3xl">
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mb-4">How headers work</p>
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex sm:grid sm:grid-cols-3 gap-4">
            {[
              { icon: '🧮', title: 'SPF Breaks at 10', body: 'RFC 7208 section 4.6.4 caps SPF at exactly 10 DNS lookups. Hit 11 and the spec mandates a hard PermError — even if every lookup would have passed.' },
              { icon: '🔃', title: 'Headers Run Backwards', body: 'Each hop prepends its Received header, so the raw stack is newest-first. The very bottom Received line is where the message was born.' },
              { icon: '👻', title: 'Bcc Disappears at the MTA', body: "Bcc addresses are stripped by the sending MTA before delivery. Even if you're the Bcc recipient, your address never appears anywhere in the raw headers." },
            ].map(f => (
              <div key={f.title} className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-1.5 w-[260px] sm:w-auto shrink-0">
                <div className="text-xl" aria-hidden="true">{f.icon}</div>
                <p className="text-sm font-semibold text-text-primary">{f.title}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
