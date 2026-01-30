import { useState, useCallback } from 'react';

export interface StockData {
  ticker: string;
  name: string;
  price: number;
  sector: string;
}

export function useStockData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (ticker: string): Promise<StockData | null> => {
    if (!ticker) return null;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

    setLoading(true);
    setError(null);

    try {
      const response = await window.fetch(
        `${apiUrl}/stocks/quote/${ticker}`
      );

      if (!response.ok) {
        throw new Error('Stock not found');
      }

      const data = await response.json();
      
      setLoading(false);
      return data;
    } catch (err) {
      console.error('Stock fetch error:', err);
      setError('Stock not found');
      setLoading(false);
      return null;
    }
  }, []);

  return { fetch, loading, error };
}
