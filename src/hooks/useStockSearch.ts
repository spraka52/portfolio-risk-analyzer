import { useState, useCallback } from 'react';

export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

export function useStockSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

    setLoading(true);

    try {
      const response = await window.fetch(
        `${apiUrl}/stocks/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
  }, []);

  return { results, loading, search, clear };
}
