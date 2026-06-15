import { useState, useRef } from 'react';

interface Props {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label, className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (liveRef.current) liveRef.current.textContent = 'Copied!';
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        if (liveRef.current) liveRef.current.textContent = '';
      }, 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <>
      <span ref={liveRef} className="sr-only" aria-live="polite" />
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-text-tertiary border border-surface-border hover:border-accent-azure hover:text-accent-azure transition-colors duration-150 ${className}`}
        aria-label={label ? `Copy ${label}` : 'Copy to clipboard'}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        <span aria-hidden="true">{copied ? '✓' : '⎘'}</span>
        {label && <span className="hidden sm:inline">{copied ? 'Copied' : label}</span>}
      </button>
    </>
  );
}
