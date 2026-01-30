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

    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    setLoading(true);

    try {
      const response = await window.fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`
      );

      const data = await response.json();
      
      const searchResults = (data.result || [])
        .filter((item: any) => item.type === 'Common Stock' && !item.symbol.includes('.'))
        .map((item: any) => ({
          ticker: item.symbol,
          name: item.description,
          exchange: item.displaySymbol,
        }))
        .slice(0, 5);

      setResults(searchResults);
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
