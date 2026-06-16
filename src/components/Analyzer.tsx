import { useState, useCallback, useRef } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { analyze } from '@/lib/engine/analyze';
import { PasteView } from './PasteView';
import { ResultsView } from './ResultsView';

export function Analyzer() {
  const [view, setView] = useState<'paste' | 'results'>('paste');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const liveRef = useRef<HTMLSpanElement>(null);

  const runAnalysis = useCallback(async (rawHeaders: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const r = await analyze(rawHeaders);
      setResult(r);
      setView('results');
      if (liveRef.current) liveRef.current.textContent = 'Analysis complete. Results are now displayed below.';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please check the header format and try again.');
      if (liveRef.current) liveRef.current.textContent = '';
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleBack = () => {
    setView('paste');
    setResult(null);
    setError(null);
    if (liveRef.current) liveRef.current.textContent = '';
  };

  return (
    <>
      <span ref={liveRef} className="sr-only" aria-live="assertive" aria-atomic="true" />
      {view === 'results' && result ? (
        <ResultsView result={result} onBack={handleBack} />
      ) : (
        <PasteView
          text={rawText}
          onTextChange={setRawText}
          onAnalyzeText={rawHeaders => void runAnalysis(rawHeaders)}
          analyzing={analyzing}
          error={error}
        />
      )}
    </>
  );
}
