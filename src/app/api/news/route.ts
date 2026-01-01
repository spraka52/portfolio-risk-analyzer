import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tickers } = await request.json();
    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ news: {} });
    }

    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Finnhub API key not configured' }, { status: 500 });
    }

    const to = new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 14); // last 2 weeks
    const from = fromDate.toISOString().split('T')[0];

    const results: Record<string, any[]> = {};

    await Promise.all(
      tickers.slice(0, 6).map(async (ticker: string) => {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${apiKey}`,
            { next: { revalidate: 3600 } }
          );
          if (!res.ok) { results[ticker] = []; return; }
          const articles = await res.json();
          results[ticker] = (Array.isArray(articles) ? articles : [])
            .filter((a: any) => a.headline && a.url)
            .slice(0, 3)
            .map((a: any) => ({
              headline: a.headline,
              url: a.url,
              source: a.source,
              datetime: a.datetime,
              summary: a.summary?.slice(0, 120),
            }));
        } catch {
          results[ticker] = [];
        }
      })
    );

    return NextResponse.json({ news: results });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
