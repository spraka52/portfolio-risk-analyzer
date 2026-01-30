import { Portfolio, Holding, RiskMetrics } from '@/types/portfolio';

export function analyzePortfolio(portfolio: Portfolio): RiskMetrics {
  const sectorConcentration: { [sector: string]: number } = {};
  
  portfolio.holdings.forEach(holding => {
    const sector = holding.sector || 'Unknown';
    const weight = holding.weight || 0;
    sectorConcentration[sector] = (sectorConcentration[sector] || 0) + weight;
  });

  const topHoldings = [...portfolio.holdings]
    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
    .slice(0, 5);

  const maxConcentration = Math.max(...Object.values(sectorConcentration));
  const diversificationScore = Math.round(100 - maxConcentration);

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  if (maxConcentration >= 70) {
    riskLevel = 'HIGH';
  } else if (maxConcentration >= 50) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'LOW';
  }

  return {
    sectorConcentration,
    topHoldings,
    diversificationScore,
    riskLevel,
  };
}
