# Portfolio Risk Analyzer — AI-Powered Portfolio Risk Analysis

[![CI](https://github.com/spraka52/portfolio-risk-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/spraka52/portfolio-risk-analyzer/actions/workflows/ci.yml) [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot) [![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://portfolio-risk-analyzer-seven.vercel.app/) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

"A production-ready full-stack application that surfaces hidden concentration risks in investment portfolios using real-time stock data and AI-generated insights."

---

## Live Demo

**[portfolio-risk-analyzer-seven.vercel.app](https://portfolio-risk-analyzer-seven.vercel.app/)**

| Step | What you'll see |
|------|----------------|
| 1. Pick a sample portfolio (e.g. "All Tech") | Instant sector breakdown chart |
| 2. Check the Risk Summary card | HIGH / MEDIUM / LOW badge + diversification score |
| 3. Read the AI Narrative | Plain-English explanation of your concentration risk |
| 4. Switch to a "Balanced" portfolio | Watch the score jump and risk level drop to LOW |
| 5. Sign up → save your own portfolio | Persists across sessions via the Spring Boot API |

> **Tip:** Use the "Create Custom Portfolio" button to enter your own tickers and shares.

---

## Why this project?

- **60% of retail investors** believe they're diversified simply by owning multiple stocks
- Many portfolios carry hidden sector, market-cap, and geographic concentration risks
- During the 2022 tech correction, portfolios with >70% tech allocation lost 30–40%, while balanced portfolios lost only 15–20%
- Existing tools are either too complex or too shallow — this app gives instant, plain-English risk analysis

## Highlights

- **Sector concentration analysis**: Visualize where your money actually sits across industries
- **Diversification scoring**: A quantitative score showing how balanced your portfolio really is
- **Risk level assessment**: Clear LOW / MEDIUM / HIGH classification based on concentration
- **AI-generated insights**: Plain-English explanations powered by Anthropic Claude
- **Portfolio management**: Save, edit, and track multiple portfolios per account
- **Real-time stock data**: Live prices and metadata via the Finnhub API

## Architecture (at a glance)

- A Next.js 14 frontend deployed on Vercel serves the portfolio UI and calls a Spring Boot REST API
- Spring Boot handles authentication (JWT), portfolio persistence (PostgreSQL), and proxies stock data from Finnhub
- The risk engine runs on the frontend: sector weights are computed from live prices, then scored and classified
- Anthropic Claude generates narrative summaries from the computed risk metrics

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Browser   │─────▶│  Next.js (3000)  │◀────▶│  Vercel CDN │
└─────────────┘      └──────────────────┘      └─────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Spring Boot API  │
                     │    (port 8081)   │
                     └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐    ┌─────────────┐
            │  PostgreSQL  │    │ Finnhub API │
            │   Database   │    │  (stocks)   │
            └──────────────┘    └─────────────┘
```

---

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Recharts, Tailwind CSS
- **Backend**: Spring Boot 3.2, Spring Security (JWT), Spring Data JPA
- **Database**: PostgreSQL 15
- **External APIs**: Finnhub (real-time stock data), Anthropic Claude (AI insights)
- **Infrastructure**: Vercel (frontend), Railway / Render / AWS (backend), Docker (local DB)

---

## Repository Structure

```
portfolio-risk-analyzer/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main application
│   │   └── layout.tsx               # Root layout with auth
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.tsx        # Login/register modal
│   │   ├── portfolio/
│   │   │   ├── CustomPortfolioInput.tsx
│   │   │   ├── HoldingInput.tsx
│   │   │   └── StockSearchDropdown.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   ├── AINarrative.tsx          # AI-generated insights
│   │   ├── RiskSummary.tsx          # Risk metrics card
│   │   ├── SectorBreakdown.tsx      # Donut chart
│   │   ├── SamplePortfolios.tsx     # Pre-built portfolios
│   │   └── SavedPortfolios.tsx      # User's saved portfolios
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── hooks/
│   │   ├── useStockData.ts          # Fetch stock quotes
│   │   ├── useStockSearch.ts        # Search autocomplete
│   │   └── usePortfolioAPI.ts       # Backend API calls
│   ├── lib/
│   │   ├── portfolioAnalysis.ts     # Risk calculations
│   │   └── sampleData.ts            # Sample portfolios
│   └── types/
│       └── portfolio.ts             # TypeScript types
│
├── portfolio-backend/
│   └── src/main/java/com/portfolio/analyzer/
│       ├── config/
│       │   └── SecurityConfig.java  # Spring Security + CORS
│       ├── controller/
│       │   ├── AuthController.java  # Login/register
│       │   ├── PortfolioController.java
│       │   └── StockController.java # Finnhub proxy
│       ├── dto/                     # Request/response objects
│       ├── model/
│       │   ├── User.java
│       │   ├── Portfolio.java
│       │   └── Holding.java
│       ├── repository/              # JPA repositories
│       ├── security/
│       │   ├── JwtUtils.java
│       │   ├── AuthTokenFilter.java
│       │   └── UserDetailsImpl.java
│       └── service/
│           ├── AuthService.java
│           ├── PortfolioService.java
│           └── FinnhubService.java
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.8+
- Docker (for local PostgreSQL)
- A free Finnhub API key from [finnhub.io](https://finnhub.io)

### Clone & Install (Frontend)

```shell
git clone https://github.com/spraka52/portfolio-risk-analyzer.git
cd portfolio-risk-analyzer
npm install
```

### Configure environment (Frontend)

Copy the example below to `.env.local` and fill in your values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FINNHUB_API_KEY` | API key from [finnhub.io](https://finnhub.io) |
| `NEXT_PUBLIC_API_URL` | URL of the running Spring Boot API |

```shell
# Run development server
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```shell
# Start PostgreSQL with Docker
docker run --name portfolio-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio_db \
  -p 5432:5432 \
  -d postgres:15

# Navigate to backend and run
cd portfolio-backend
mvn clean install
mvn spring-boot:run
```

Configure `src/main/resources/application.properties` with your database credentials, a 256-bit JWT secret, and your Finnhub API key before running.

API runs on `http://localhost:8081`

---

## Configuration

These values are set in `application.properties` (backend) and `.env.local` (frontend):

| Variable | Location | Description |
|----------|----------|-------------|
| `SPRING_DATASOURCE_URL` | `application.properties` | PostgreSQL JDBC connection string |
| `JWT_SECRET` | `application.properties` | 256-bit secret for signing tokens |
| `FINNHUB_API_KEY` | `application.properties` | Finnhub key for the stock proxy |
| `NEXT_PUBLIC_FINNHUB_API_KEY` | `.env.local` | Finnhub key for frontend search |
| `NEXT_PUBLIC_API_URL` | `.env.local` | Backend base URL |

---

## How it works

1. User inputs stock tickers and share counts via the frontend
2. Live prices are fetched from Finnhub and sector metadata is classified
3. The risk engine computes sector weights and a diversification score:

```javascript
// Diversification score (inverse of max concentration)
const diversificationScore = 100 - Math.max(...Object.values(sectorConcentration));

// Risk level based on max sector concentration
if (maxConcentration > 70) riskLevel = 'HIGH';
else if (maxConcentration > 50) riskLevel = 'MEDIUM';
else riskLevel = 'LOW';
```

4. Anthropic Claude generates a plain-English summary of the computed risks
5. Authenticated users can save and revisit their portfolios at any time

---

## Deployment

### Frontend (Vercel)

```shell
# Add environment variables in the Vercel dashboard, then:
vercel --prod
```

### Backend (Railway)

1. Create a new project on [railway.app](https://railway.app)
2. Add a PostgreSQL database plugin
3. Deploy the Spring Boot app from the `portfolio-backend` directory
4. Set `SPRING_DATASOURCE_URL`, `JWT_SECRET`, and `FINNHUB_API_KEY` as environment variables

---

## Production notes

- Place the Spring Boot API behind an API Gateway or load balancer with auth
- Use managed secrets (AWS Secrets Manager, Railway Variables) — never commit credentials
- JWT tokens expire after 24 hours; rotate the `JWT_SECRET` periodically
- CORS is configured for Vercel and localhost — update `SecurityConfig.java` for custom domains
- Add health checks and readiness probes if deploying to Kubernetes or ECS

---

## Roadmap

- CSV portfolio import
- Historical performance tracking and backtesting
- Email alerts for risk threshold breaches
- Portfolio comparison tool
- Advanced metrics (Sharpe ratio, beta, alpha)
- Real-time WebSocket price updates
- Mobile app (React Native)
- Brokerage integrations (Robinhood, Fidelity)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Attribution

- Built with Next.js, Spring Boot, and PostgreSQL
- Real-time market data provided by [Finnhub](https://finnhub.io)
- AI insights powered by [Anthropic Claude](https://anthropic.com)
- **Shreya Prakash** — [GitHub](https://github.com/spraka52) · [LinkedIn](https://linkedin.com/in/shreya-prakash)

---

"If you'd like a walkthrough of the architecture or have questions about the risk engine, feel free to reach out. This project is built for production use and is straightforward to extend with new data sources or risk metrics."

*Graduating May 2026 | Seeking Software Engineering roles in Fintech*
