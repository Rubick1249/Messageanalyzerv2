import { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { analyze } from '@/lib/engine/analyze';
import { PasteView } from './PasteView';
import { ResultsView } from './ResultsView';

export function Analyzer() {
  const [view, setView] = useState<'paste' | 'results'>('paste');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (rawHeaders: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const r = await analyze(rawHeaders);
      setResult(r);
      setView('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please check the header format and try again.');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleBack = () => {
    setView('paste');
    setResult(null);
    setError(null);
  };

  if (view === 'results' && result) {
    return <ResultsView result={result} onBack={handleBack} />;
  }

  return (
    <PasteView
      onAnalyzeText={rawHeaders => void runAnalysis(rawHeaders)}
      analyzing={analyzing}
      error={error}
    />
  );
}
