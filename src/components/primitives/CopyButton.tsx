import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label, className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyFailed(false);
      if (liveRef.current) liveRef.current.textContent = 'Copied!';
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        if (liveRef.current) liveRef.current.textContent = '';
      }, 1500);
    } catch {
      setCopyFailed(true);
      if (liveRef.current) liveRef.current.textContent = 'Copy unavailable';
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopyFailed(false);
        if (liveRef.current) liveRef.current.textContent = '';
      }, 2000);
    }
  };

  const icon = copied ? '✓' : copyFailed ? '✗' : '⎘';
  const labelText = copied ? 'Copied' : copyFailed ? 'Unavailable' : label;

  return (
    <>
      <span ref={liveRef} className="sr-only" aria-live="polite" />
      <button
        type="button"
        onClick={handleCopy}
        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs border transition-colors duration-150 ${
          copyFailed
            ? 'text-verdict-fail border-verdict-fail/40'
            : 'text-text-tertiary border-surface-border hover:border-accent-azure hover:text-accent-azure'
        } ${className}`}
        aria-label={label ? `Copy ${label}` : 'Copy to clipboard'}
        title={copied ? 'Copied!' : copyFailed ? 'Copy unavailable in this context' : 'Copy to clipboard'}
      >
        <span aria-hidden="true">{icon}</span>
        {label && <span className="hidden sm:inline">{labelText}</span>}
      </button>
    </>
  );
}
