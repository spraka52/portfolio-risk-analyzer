import { NextResponse } from 'next/server';

const RISK_FREE_RATE_ANNUAL = 0.045; // 4.5% T-bill rate
const TRADING_DAYS = 252;
const DAILY_RF = Math.pow(1 + RISK_FREE_RATE_ANNUAL, 1 / TRADING_DAYS) - 1;

async function fetchYahooHistory(ticker: string): Promise<{ date: string; price: number }[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1y`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp || [];
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];

    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toISOString().split('T')[0],
        price: closes[i],
      }))
      .filter((d): d is { date: string; price: number } => d.price !== null && d.price > 0);
  } catch {
    return [];
  }
}

function dailyReturns(prices: { date: string; price: number }[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i].price - prices[i - 1].price) / prices[i - 1].price);
  }
  return returns;
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function covariance(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len < 2) return 0;
  const ma = mean(a.slice(0, len));
  const mb = mean(b.slice(0, len));
  return a.slice(0, len).reduce((acc, v, i) => acc + (v - ma) * (b[i] - mb), 0) / (len - 1);
}

function maxDrawdown(cumReturns: number[]): number {
  let peak = cumReturns[0] ?? 0;
  let maxDD = 0;
  for (const r of cumReturns) {
    if (r > peak) peak = r;
    const dd = (peak - r) / (1 + peak);
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export async function POST(request: Request) {
  try {
    const { tickers, weights }: { tickers: string[]; weights: number[] } = await request.json();

    if (!tickers?.length) {
      return NextResponse.json({ error: 'No tickers provided' }, { status: 400 });
    }

    // Fetch all tickers + benchmark in parallel
    const allTickers = [...tickers, 'SPY'];
    const histories = await Promise.all(allTickers.map(fetchYahooHistory));
    const historyMap: Record<string, { date: string; price: number }[]> = {};
    allTickers.forEach((t, i) => { historyMap[t] = histories[i]; });

    const spyHistory = historyMap['SPY'];
    if (!spyHistory.length) {
      return NextResponse.json({ error: 'Could not fetch benchmark data' }, { status: 502 });
    }

    // Use SPY dates as the reference timeline (market trading days)
    const referenceDates = spyHistory.map(d => d.date);

    // Build portfolio weighted cumulative return per date
    const portfolioTickers = tickers.filter(t => historyMap[t]?.length > 0);
    const portfolioWeights = portfolioTickers.map((t) => {
      const idx = tickers.indexOf(t);
      return (weights[idx] || 0) / 100;
    });

    // Normalise weights to sum to 1
    const weightSum = portfolioWeights.reduce((a, b) => a + b, 0);
    const normWeights = weightSum > 0 ? portfolioWeights.map(w => w / weightSum) : portfolioWeights;

    // For each ticker get a price map
    const priceMaps: Record<string, Record<string, number>> = {};
    portfolioTickers.forEach(t => {
      priceMaps[t] = {};
      historyMap[t].forEach(d => { priceMaps[t][d.date] = d.price; });
    });

    const spyPriceMap: Record<string, number> = {};
    spyHistory.forEach(d => { spyPriceMap[d.date] = d.price; });

    // Find base prices (first available date for each ticker)
    const basePrices: Record<string, number> = {};
    portfolioTickers.forEach(t => {
      basePrices[t] = historyMap[t][0]?.price ?? 0;
    });
    const spyBase = spyHistory[0]?.price ?? 0;

    // Build performance series aligned to reference dates
    const performance: { date: string; portfolio: number; spy: number }[] = [];

    for (const date of referenceDates) {
      let portReturn = 0;
      let hasAllData = true;

      for (let i = 0; i < portfolioTickers.length; i++) {
        const t = portfolioTickers[i];
        const price = priceMaps[t][date];
        if (!price || !basePrices[t]) { hasAllData = false; break; }
        portReturn += normWeights[i] * ((price - basePrices[t]) / basePrices[t]);
      }

      const spyPrice = spyPriceMap[date];
      if (!spyPrice || !spyBase) continue;
      const spyReturn = (spyPrice - spyBase) / spyBase;

      if (!hasAllData && portfolioTickers.length > 0) continue;

      performance.push({
        date,
        portfolio: parseFloat((portReturn * 100).toFixed(2)),
        spy: parseFloat((spyReturn * 100).toFixed(2)),
      });
    }

    // Compute daily return series for metrics
    const portDailyReturns: number[] = [];
    const spyDailyReturns = dailyReturns(spyHistory);

    if (portfolioTickers.length > 0) {
      // Build portfolio daily price series using weighted returns
      for (let i = 1; i < referenceDates.length; i++) {
        const prevDate = referenceDates[i - 1];
        const currDate = referenceDates[i];
        let r = 0;
        let valid = true;
        for (let j = 0; j < portfolioTickers.length; j++) {
          const t = portfolioTickers[j];
          const prev = priceMaps[t][prevDate];
          const curr = priceMaps[t][currDate];
          if (!prev || !curr) { valid = false; break; }
          r += normWeights[j] * ((curr - prev) / prev);
        }
        if (valid) portDailyReturns.push(r);
      }
    }

    // Advanced metrics
    const portMean = mean(portDailyReturns);
    const portStd = stddev(portDailyReturns);
    const spyMean = mean(spyDailyReturns);
    const spyStd = stddev(spyDailyReturns);

    const annualizedReturn = (Math.pow(1 + portMean, TRADING_DAYS) - 1) * 100;
    const annualizedVol = portStd * Math.sqrt(TRADING_DAYS) * 100;

    const sharpeRatio =
      portStd > 0
        ? parseFloat((((portMean - DAILY_RF) / portStd) * Math.sqrt(TRADING_DAYS)).toFixed(2))
        : 0;

    const len = Math.min(portDailyReturns.length, spyDailyReturns.length);
    const cov = covariance(portDailyReturns.slice(0, len), spyDailyReturns.slice(0, len));
    const spyVar = spyStd * spyStd;
    const beta = spyVar > 0 ? parseFloat((cov / spyVar).toFixed(2)) : 1;

    const annualizedMarketReturn = (Math.pow(1 + spyMean, TRADING_DAYS) - 1) * 100;
    const alpha = parseFloat(
      (annualizedReturn - (RISK_FREE_RATE_ANNUAL * 100 + beta * (annualizedMarketReturn - RISK_FREE_RATE_ANNUAL * 100))).toFixed(2)
    );

    // Max drawdown from cumulative portfolio returns
    const cumReturns = performance.map(d => d.portfolio / 100);
    const maxDD = cumReturns.length > 0 ? parseFloat((maxDrawdown(cumReturns) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      performance,
      metrics: {
        sharpeRatio,
        beta,
        alpha,
        annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
        annualizedVolatility: parseFloat(annualizedVol.toFixed(2)),
        maxDrawdown: maxDD,
      },
    });
  } catch (error: any) {
    console.error('Historical data error:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}
