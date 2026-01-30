'use client';
import { RiskMetrics } from '@/types/portfolio';
import { AlertTriangle, TrendingUp, Shield } from 'lucide-react';

interface RiskSummaryProps {
  metrics: RiskMetrics;
}

export default function RiskSummary({ metrics }: RiskSummaryProps) {
  const riskConfig = {
    HIGH: {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      message: 'Your portfolio has high concentration risk',
    },
    MEDIUM: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: TrendingUp,
      message: 'Your portfolio has moderate concentration',
    },
    LOW: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: Shield,
      message: 'Your portfolio is well diversified',
    },
  };

  const config = riskConfig[metrics.riskLevel];
  const Icon = config.icon;
  const maxSector = Object.entries(metrics.sectorConcentration).reduce((max, entry) =>
    entry[1] > max[1] ? entry : max
  );

  return (
    <div className={`p-6 rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start gap-4">
        <Icon className={`w-8 h-8 ${config.color}`} />
        <div className="flex-1">
          <h3 className={`text-xl font-semibold ${config.color} mb-2`}>Risk Level: {metrics.riskLevel}</h3>
          <p className="text-gray-700 mb-4">{config.message}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Diversification Score:</span>
              <span className={`text-lg font-bold ${config.color}`}>{metrics.diversificationScore}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Largest sector concentration:</span>
              <span className="text-sm font-semibold text-gray-900">{maxSector[0]}: {maxSector[1].toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Top 5 Holdings:</h4>
            <ul className="space-y-1">
              {metrics.topHoldings.map((holding, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex justify-between">
                  <span>{holding.ticker}</span>
                  <span className="font-medium">{holding.weight?.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
