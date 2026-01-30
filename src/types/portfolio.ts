export interface Holding {
  ticker: string;
  shares?: number;
  weight?: number;
  currentPrice?: number;
  value?: number;
  sector?: string;
}

export interface Portfolio {
  name: string;
  holdings: Holding[];
  totalValue?: number;
  lastUpdated?: Date;
}

export interface RiskMetrics {
  sectorConcentration: { [sector: string]: number };
  topHoldings: Holding[];
  diversificationScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}
