import { Portfolio, Holding } from '@/types/portfolio';

export interface HoldingInput {
  ticker: string;
  shares: number;
  price?: number;
  sector?: string;
  name?: string;
}

export function calculatePortfolioValue(holdings: HoldingInput[]): number {
  return holdings.reduce((sum, h) => sum + (h.shares * (h.price || 0)), 0);
}

export function convertToPortfolio(
  name: string,
  holdings: HoldingInput[]
): Portfolio {
  const validHoldings = holdings.filter(h => 
    h.ticker && h.shares > 0 && h.price && h.sector
  );

  const totalValue = calculatePortfolioValue(validHoldings);
  
  const portfolioHoldings: Holding[] = validHoldings.map(h => ({
    ticker: h.ticker,
    shares: h.shares,
    currentPrice: h.price,
    value: h.shares * (h.price || 0),
    weight: ((h.shares * (h.price || 0)) / totalValue) * 100,
    sector: h.sector || 'Unknown',
  }));

  return {
    name: name || 'My Portfolio',
    holdings: portfolioHoldings,
    totalValue,
  };
}

export function validateHoldings(holdings: HoldingInput[]): string | null {
  const validHoldings = holdings.filter(h => 
    h.ticker && h.shares > 0 && h.price && h.sector
  );
  
  if (validHoldings.length === 0) {
    return 'Please enter at least one valid holding with shares';
  }

  return null;
}
