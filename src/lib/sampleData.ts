import { Portfolio } from '@/types/portfolio';

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
      { ticker: 'SPY', weight: 30, sector: 'Diversified' },
      { ticker: 'VTI', weight: 20, sector: 'Diversified' },
      { ticker: 'JNJ', weight: 10, sector: 'Healthcare' },
      { ticker: 'JPM', weight: 10, sector: 'Financial Services' },
      { ticker: 'PG', weight: 10, sector: 'Consumer Defensive' },
      { ticker: 'XLE', weight: 10, sector: 'Energy' },
      { ticker: 'VNQ', weight: 10, sector: 'Real Estate' },
    ],
  },
  {
    name: 'Dividend Income',
    holdings: [
      { ticker: 'VYM', weight: 25, sector: 'Diversified' },
      { ticker: 'KO', weight: 15, sector: 'Consumer Defensive' },
      { ticker: 'PFE', weight: 15, sector: 'Healthcare' },
      { ticker: 'VZ', weight: 15, sector: 'Communication Services' },
      { ticker: 'T', weight: 10, sector: 'Communication Services' },
      { ticker: 'MCD', weight: 10, sector: 'Consumer Cyclical' },
      { ticker: 'XOM', weight: 10, sector: 'Energy' },
    ],
  },
];

export const SECTOR_COLORS: { [key: string]: string } = {
  'Technology': '#3b82f6',
  'Healthcare': '#10b981',
  'Financial Services': '#f59e0b',
  'Consumer Cyclical': '#8b5cf6',
  'Consumer Defensive': '#06b6d4',
  'Communication Services': '#ec4899',
  'Energy': '#ef4444',
  'Real Estate': '#6366f1',
  'Diversified': '#64748b',
  'Utilities': '#84cc16',
  'Basic Materials': '#f97316',
  'Industrials': '#14b8a6',
};
