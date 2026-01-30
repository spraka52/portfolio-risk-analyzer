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

    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    setLoading(true);
    setError(null);

    try {
      // Get stock quote (price)
      const quoteResponse = await window.fetch(
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
      );
      
      const quoteData = await quoteResponse.json();
      
      if (!quoteData.c || quoteData.c === 0) {
        throw new Error('Stock not found');
      }

      // Get company profile (name, sector)
      const profileResponse = await window.fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
      );
      
      const profileData = await profileResponse.json();

      const stockData: StockData = {
        ticker: ticker.toUpperCase(),
        name: profileData.name || ticker,
        price: quoteData.c, // current price
        sector: profileData.finnhubIndustry || 'Technology',
      };

      setLoading(false);
      return stockData;
    } catch (err) {
      console.error('Stock fetch error:', err);
      setError('Stock not found');
      setLoading(false);
      return null;
    }
  }, []);

  return { fetch, loading, error };
}
