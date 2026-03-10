import { NextResponse } from 'next/server';
import { SECTOR_MAP } from '@/lib/constants/sectors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  try {
    // Fetch price (quote) and sector (assetProfile) in parallel
    const [quoteRes, summaryRes] = await Promise.all([
      fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      ),
      fetch(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=assetProfile`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      ),
    ]);

    let price = 0;
    let name = ticker;
    if (quoteRes.ok) {
      const quoteData = await quoteRes.json();
      const meta = quoteData?.chart?.result?.[0]?.meta;
      price = meta?.regularMarketPrice ?? meta?.previousClose ?? 0;
      name = meta?.longName || meta?.shortName || ticker;
    }

    let sector = '';
    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      sector = summaryData?.quoteSummary?.result?.[0]?.assetProfile?.sector ?? '';
    }

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      name,
      price,
      sector: SECTOR_MAP[sector] || sector || 'Unknown',
    });
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
  }
}
