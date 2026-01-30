import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { portfolio, metrics } = await request.json();

    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const topSector: [string, number] = Object.entries(metrics.sectorConcentration)
      .reduce((max: [string, number], entry: [string, any]) => 
        entry[1] > max[1] ? [entry[0], entry[1]] : max
      , ['', 0]);

    const generateNarrative = () => {
      const concentration = topSector[1];
      const sector = topSector[0];
      const score = metrics.diversificationScore;
      const portfolioName = portfolio.name;

      if (metrics.riskLevel === 'HIGH') {
        if (sector === 'Technology') {
          return `Your ${portfolioName} portfolio shows significant concentration risk with ${concentration.toFixed(0)}% allocated to Technology. During sector-specific downturns like the 2022 tech correction, portfolios with this level of concentration typically declined 30-40% compared to 15-20% for diversified portfolios. Consider rebalancing to reduce tech exposure to 40-50% and add positions in defensive sectors like Healthcare, Consumer Staples, or Utilities to better weather market volatility.`;
        } else {
          return `Your portfolio is heavily concentrated in ${sector} at ${concentration.toFixed(0)}%, creating elevated sector risk. When ${sector} faces headwinds, your entire portfolio will move in tandem. Historical data shows concentrated portfolios experience 1.5-2x greater volatility than diversified alternatives. Consider adding exposure to 3-4 additional sectors to reduce correlation risk and improve risk-adjusted returns.`;
        }
      } else if (metrics.riskLevel === 'MEDIUM') {
        return `Your ${portfolioName} portfolio shows moderate concentration with ${sector} representing ${concentration.toFixed(0)}% of holdings (diversification score: ${score}/100). While this isn't dangerously concentrated, there's meaningful room for improvement. During sector rotations, portfolios with 50-70% concentration in one sector can experience unnecessary volatility. Consider gradually rebalancing to achieve 20-30% allocation across 4-5 different sectors for better risk-adjusted performance.`;
      } else {
        return `Your ${portfolioName} portfolio demonstrates strong diversification with no single sector exceeding ${concentration.toFixed(0)}% allocation (diversification score: ${score}/100). This balanced approach helps reduce single-sector risk and provides exposure to multiple economic drivers. Research shows well-diversified portfolios like yours experience 25-35% lower volatility than concentrated alternatives while maintaining competitive returns. Continue monitoring sector weights and rebalance periodically to maintain this healthy allocation.`;
      }
    };

    const narrative = generateNarrative();

    return NextResponse.json({ narrative });
  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
