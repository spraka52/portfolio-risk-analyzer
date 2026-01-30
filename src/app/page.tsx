'use client';
import { useState } from 'react';
import { Portfolio } from '@/types/portfolio';
import { analyzePortfolio } from '@/lib/portfolioAnalysis';
import SamplePortfolios from '@/components/SamplePortfolios';
import SectorBreakdown from '@/components/SectorBreakdown';
import RiskSummary from '@/components/RiskSummary';

export default function Home() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePortfolio> | null>(null);

  const handlePortfolioSelect = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    const metrics = analyzePortfolio(portfolio);
    setAnalysis(metrics);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Portfolio Risk Analyzer</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover hidden risks in your portfolio before they cost you money
          </p>
        </div>
        {!selectedPortfolio && (
          <div className="mb-12">
            <SamplePortfolios onSelect={handlePortfolioSelect} />
          </div>
        )}
        {selectedPortfolio && analysis && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Analyzing: {selectedPortfolio.name}</h2>
              <button
                onClick={() => {
                  setSelectedPortfolio(null);
                  setAnalysis(null);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                ← Try another portfolio
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RiskSummary metrics={analysis} />
              <SectorBreakdown sectorConcentration={analysis.sectorConcentration} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
