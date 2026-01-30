import { Portfolio } from '@/types/portfolio';

export const SECTOR_COLORS: { [sector: string]: string } = {
  'Technology': '#3b82f6',
  'Healthcare': '#ef4444',
  'Financial Services': '#10b981',
  'Consumer Cyclical': '#f59e0b',
  'Consumer Defensive': '#8b5cf6',
  'Communication Services': '#ec4899',
  'Energy': '#14b8a6',
  'Utilities': '#6366f1',
  'Real Estate': '#06b6d4',
  'Basic Materials': '#84cc16',
  'Industrials': '#f97316',
  
  // Additional sectors from Finnhub
  'Automobiles': '#f59e0b',
  'Chemicals': '#84cc16',
  'Transportation': '#f97316',
  'Pharmaceuticals': '#ef4444',
  'Banks': '#10b981',
  'Insurance': '#059669',
  'Software': '#3b82f6',
  'Hardware': '#2563eb',
  'Semiconductors': '#1d4ed8',
  'Retail': '#f59e0b',
  'Food & Beverage': '#8b5cf6',
  'Aerospace & Defense': '#6366f1',
  'Construction': '#f97316',
  'Metals & Mining': '#84cc16',
  'Oil & Gas': '#14b8a6',
  'Electric Utilities': '#6366f1',
  'Telecommunications': '#ec4899',
  'Media': '#db2777',
  'Biotechnology': '#dc2626',
  'Medical Devices': '#f87171',
  'Capital Markets': '#059669',
  
  // Fallback
  'Other': '#94a3b8',
};

export const SAMPLE_PORTFOLIOS: Portfolio[] = [
  {
    name: 'Tech Growth',
    holdings: [
      { ticker: 'AAPL', weight: 25, sector: 'Technology' },
      { ticker: 'MSFT', weight: 20, sector: 'Technology' },
      { ticker: 'NVDA', weight: 15, sector: 'Technology' },
      { ticker: 'GOOGL', weight: 15, sector: 'Communication Services' },
      { ticker: 'TSLA', weight: 10, sector: 'Consumer Cyclical' },
      { ticker: 'META', weight: 10, sector: 'Communication Services' },
      { ticker: 'AMZN', weight: 5, sector: 'Consumer Cyclical' },
    ],
  },
  {
    name: 'Balanced',
    holdings: [
      { ticker: 'AAPL', weight: 15, sector: 'Technology' },
      { ticker: 'JPM', weight: 15, sector: 'Financial Services' },
      { ticker: 'JNJ', weight: 15, sector: 'Healthcare' },
      { ticker: 'PG', weight: 15, sector: 'Consumer Defensive' },
      { ticker: 'XOM', weight: 15, sector: 'Energy' },
      { ticker: 'VZ', weight: 15, sector: 'Communication Services' },
      { ticker: 'NEE', weight: 10, sector: 'Utilities' },
    ],
  },
  {
    name: 'Dividend Income',
    holdings: [
      { ticker: 'JNJ', weight: 20, sector: 'Healthcare' },
      { ticker: 'PG', weight: 18, sector: 'Consumer Defensive' },
      { ticker: 'KO', weight: 15, sector: 'Consumer Defensive' },
      { ticker: 'T', weight: 15, sector: 'Communication Services' },
      { ticker: 'XOM', weight: 12, sector: 'Energy' },
      { ticker: 'VZ', weight: 10, sector: 'Communication Services' },
      { ticker: 'PFE', weight: 10, sector: 'Healthcare' },
    ],
  },
];
