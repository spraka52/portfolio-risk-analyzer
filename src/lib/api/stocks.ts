// These are now handled client-side in hooks
// Keeping this file for type exports

export interface StockData {
  ticker: string;
  name: string;
  price: number;
  sector: string;
}

export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}
