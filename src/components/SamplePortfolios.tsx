'use client';
import { SAMPLE_PORTFOLIOS } from '@/lib/sampleData';
import { Portfolio } from '@/types/portfolio';

interface SamplePortfoliosProps {
  onSelect: (portfolio: Portfolio) => void;
}

export default function SamplePortfolios({ onSelect }: SamplePortfoliosProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Try a sample portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAMPLE_PORTFOLIOS.map((portfolio) => (
          <button
            key={portfolio.name}
            onClick={() => onSelect(portfolio)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{portfolio.name}</h3>
            <p className="text-sm text-gray-600">{portfolio.holdings.length} holdings</p>
            <p className="text-xs text-gray-500 mt-2">Click to analyze →</p>
          </button>
        ))}
      </div>
    </div>
  );
}
