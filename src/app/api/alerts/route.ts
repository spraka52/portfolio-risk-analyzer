import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, portfolioName, riskLevel, threshold, diversificationScore, topSector } =
      await request.json();

    if (!email || !portfolioName || !riskLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const riskColor: Record<string, string> = {
      HIGH: '#ef4444',
      MEDIUM: '#f59e0b',
      LOW: '#10b981',
    };

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">Portfolio Risk Alert</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Portfolio Risk Analyzer</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:16px;margin:0 0 24px;">
        Your portfolio <strong>${portfolioName}</strong> has triggered a risk alert.
      </p>

      <div style="background:#f9fafb;border-radius:8px;padding:24px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <span style="background:${riskColor[riskLevel] || '#6b7280'};color:white;padding:6px 16px;border-radius:9999px;font-size:14px;font-weight:700;">
            ${riskLevel} RISK
          </span>
          <span style="color:#6b7280;font-size:14px;">Threshold: ${threshold}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Diversification Score</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${diversificationScore}/100</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Top Concentration</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${topSector}</td>
          </tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your portfolio's risk level has reached or exceeded your alert threshold of
        <strong>${threshold}</strong>. Consider reviewing your sector allocations and
        rebalancing to reduce concentration risk.
      </p>

      <a href="https://portfolio-risk-analyzer-seven.vercel.app"
         style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        View Portfolio
      </a>
    </div>
    <div style="padding:16px 32px;background:#f9fafb;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        You're receiving this because you set up a risk alert for ${portfolioName}.
        This is not financial advice.
      </p>
    </div>
  </div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Risk Analyzer <alerts@resend.dev>',
        to: [email],
        subject: `[${riskLevel} RISK] Portfolio Alert: ${portfolioName}`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Alert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
