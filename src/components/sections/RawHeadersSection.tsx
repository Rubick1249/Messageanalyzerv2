import { useState } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { CopyButton } from '../primitives/CopyButton';

interface Props {
  result: AnalysisResult;
}

export function RawHeadersSection({ result }: Props) {
  const [filter, setFilter] = useState('');
  const lines = result.rawHeaders.split('\n');

  const filteredLines = filter
    ? lines.filter(line => line.toLowerCase().includes(filter.toLowerCase()))
    : lines;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="search"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter headers…"
          className="flex-1 min-w-[180px] bg-surface-raised border border-surface-border rounded-lg px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent-azure transition-colors"
          aria-label="Filter raw headers"
        />
        <CopyButton value={result.rawHeaders} label="all headers" />
        {filter && (
          <span className="text-xs text-text-tertiary">
            {filteredLines.length} of {lines.length} lines
          </span>
        )}
      </div>

      <pre className="bg-surface-base rounded-lg border border-surface-border p-4 overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed max-h-[500px] overflow-y-auto">
        {filteredLines.length > 0
          ? filteredLines.join('\n')
          : <span className="text-text-tertiary italic">No lines match "{filter}"</span>
        }
      </pre>
    </div>
  );
}
