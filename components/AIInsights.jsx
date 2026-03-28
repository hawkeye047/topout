'use client';
import { useState } from 'react';

export default function AIInsights({ project }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    if (insights) {
      setExpanded(!expanded);
      return;
    }
    setExpanded(true);
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      if (!resp.ok) throw new Error('Failed to load insights');
      const data = await resp.json();
      setInsights(data.insights || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-6 mb-4">
      <button
        onClick={fetchInsights}
        className="w-full bg-surface-container-low p-4 flex items-center gap-3
                   hover:bg-surface-container-high transition-colors duration-100 text-left"
      >
        <div className="w-8 h-8 bg-primary/20 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffc174" strokeWidth="2">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black text-primary tracking-widest uppercase">AI Insights</span>
          {!expanded && (
            <p className="text-xs text-secondary mt-0.5 truncate">Tap to analyze your schedule</p>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b7c8e1" strokeWidth="2"
          className={`transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="bg-surface-container-low border-t border-outline-variant/10 p-4 animate-fade-in">
          {loading && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-4 h-4 border-2 border-transparent border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-secondary font-bold uppercase tracking-widest">Analyzing...</span>
            </div>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
          {insights && (
            <ul className="space-y-3">
              {insights.map((insight, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-1 bg-primary flex-shrink-0 mt-1" style={{ minHeight: '16px' }} />
                  <p className="text-xs text-on-surface leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
