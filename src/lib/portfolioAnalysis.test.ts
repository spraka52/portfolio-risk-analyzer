import { describe, it, expect } from 'vitest';
import { analyzePortfolio } from './portfolioAnalysis';
import { Portfolio } from '@/types/portfolio';

const makePortfolio = (sectors: { sector: string; weight: number }[]): Portfolio => ({
  name: 'Test',
  holdings: sectors.map((s, i) => ({ ticker: `T${i}`, sector: s.sector, weight: s.weight })),
});

describe('analyzePortfolio', () => {
  describe('risk level classification', () => {
    it('returns HIGH when top sector >= 70%', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 80 },
        { sector: 'Finance', weight: 20 },
      ]));
      expect(result.riskLevel).toBe('HIGH');
    });

    it('returns MEDIUM when top sector is between 50% and 69%', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 60 },
        { sector: 'Finance', weight: 40 },
      ]));
      expect(result.riskLevel).toBe('MEDIUM');
    });

    it('returns LOW when top sector < 50%', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 25 },
        { sector: 'Finance', weight: 25 },
        { sector: 'Healthcare', weight: 25 },
        { sector: 'Energy', weight: 25 },
      ]));
      expect(result.riskLevel).toBe('LOW');
    });

    it('returns HIGH at exactly 70% boundary', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 70 },
        { sector: 'Finance', weight: 30 },
      ]));
      expect(result.riskLevel).toBe('HIGH');
    });

    it('returns MEDIUM at exactly 50% boundary', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 50 },
        { sector: 'Finance', weight: 50 },
      ]));
      expect(result.riskLevel).toBe('MEDIUM');
    });
  });

  describe('diversification score', () => {
    it('is 0 for a single-sector portfolio', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 100 },
      ]));
      expect(result.diversificationScore).toBe(0);
    });

    it('is 75 for an evenly split 4-sector portfolio', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 25 },
        { sector: 'Finance', weight: 25 },
        { sector: 'Healthcare', weight: 25 },
        { sector: 'Energy', weight: 25 },
      ]));
      expect(result.diversificationScore).toBe(75);
    });

    it('equals 100 minus the max sector concentration', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 65 },
        { sector: 'Finance', weight: 35 },
      ]));
      expect(result.diversificationScore).toBe(35);
    });
  });

  describe('sector concentration', () => {
    it('merges weights for the same sector across holdings', () => {
      const result = analyzePortfolio(makePortfolio([
        { sector: 'Technology', weight: 40 },
        { sector: 'Technology', weight: 35 },
        { sector: 'Finance', weight: 25 },
      ]));
      expect(result.sectorConcentration['Technology']).toBeCloseTo(75);
      expect(result.sectorConcentration['Finance']).toBeCloseTo(25);
    });

    it('labels unknown sector for holdings with no sector', () => {
      const portfolio: Portfolio = {
        name: 'Test',
        holdings: [{ ticker: 'XYZ', weight: 100 }],
      };
      const result = analyzePortfolio(portfolio);
      expect(result.sectorConcentration['Unknown']).toBe(100);
    });
  });

  describe('top holdings', () => {
    it('returns at most 5 holdings, sorted by weight descending', () => {
      const portfolio = makePortfolio([
        { sector: 'Tech', weight: 30 },
        { sector: 'Tech', weight: 25 },
        { sector: 'Tech', weight: 20 },
        { sector: 'Tech', weight: 15 },
        { sector: 'Tech', weight: 7 },
        { sector: 'Tech', weight: 3 },
      ]);
      const result = analyzePortfolio(portfolio);
      expect(result.topHoldings).toHaveLength(5);
      expect(result.topHoldings[0].weight).toBe(30);
      expect(result.topHoldings[4].weight).toBe(7);
    });
  });
});
