'use client';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Portfolio, RiskMetrics } from '@/types/portfolio';

interface AINarrativeProps {
  portfolio: Portfolio;
  metrics: RiskMetrics;
}

export default function AINarrative({ portfolio, metrics }: AINarrativeProps) {
  const [narrative, setNarrative] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchNarrative() {
      setLoading(true);
      setError(false);
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolio, metrics }),
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        setNarrative(data.narrative);
      } catch (err) {
        console.error('Failed to fetch AI narrative:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchNarrative();
  }, [portfolio, metrics]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
      <div className="flex items-start gap-3 mb-3">
        <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Risk Analysis
          </h3>
          
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your portfolio...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">
              Unable to generate AI analysis. Please try again.
            </p>
          )}

          {!loading && !error && narrative && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {narrative}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-purple-200">
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Powered by GPT-4
        </p>
      </div>
    </div>
  );
}
