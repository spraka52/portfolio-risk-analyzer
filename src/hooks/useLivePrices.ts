'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Portfolio } from '@/types/portfolio';

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export interface LivePriceState {
  prices: Record<string, number>;
  lastUpdated: Date | null;
  isPolling: boolean;
  secondsAgo: number;
}

export function useLivePrices(portfolio: Portfolio | null): LivePriceState {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const lastUpdatedRef = useRef<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!portfolio) return;
    const tickers = [...new Set(portfolio.holdings.map((h) => h.ticker).filter(Boolean))];
    if (tickers.length === 0) return;

    try {
      const results = await Promise.allSettled(
        tickers.map((ticker) =>
          fetch(`/api/stock?ticker=${encodeURIComponent(ticker)}`).then((r) =>
            r.ok ? r.json() : null
          )
        )
      );

      const newPrices: Record<string, number> = {};
      results.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value?.price) {
          newPrices[tickers[i]] = result.value.price;
        }
      });

      if (Object.keys(newPrices).length > 0) {
        setPrices((prev) => ({ ...prev, ...newPrices }));
        const now = new Date();
        setLastUpdated(now);
        lastUpdatedRef.current = now;
        setSecondsAgo(0);
      }
    } catch {
      // Silently fail — stale prices are fine
    }
  }, [portfolio?.name]);

  // Start/stop polling when portfolio changes
  useEffect(() => {
    if (!portfolio) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    fetchPrices();

    const pollInterval = setInterval(fetchPrices, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [portfolio?.name, fetchPrices]);

  // Tick "seconds ago" counter every second
  useEffect(() => {
    if (!lastUpdated) return;
    const ticker = setInterval(() => {
      setSecondsAgo(Math.round((Date.now() - (lastUpdatedRef.current?.getTime() ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(ticker);
  }, [lastUpdated]);

  return { prices, lastUpdated, isPolling, secondsAgo };
}
