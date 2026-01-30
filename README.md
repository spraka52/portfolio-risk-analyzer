# Portfolio Risk Analyzer

**AI-powered portfolio risk analysis with real-time stock data integration**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://portfolio-risk-analyzer-seven.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 Problem Statement

**60% of retail investors** believe they're diversified simply by owning multiple stocks. However, many portfolios suffer from hidden concentration risks:

- **Sector concentration**: 5 "different" stocks, all in tech
- **Market cap concentration**: All large-cap growth stocks
- **Geographic concentration**: All US companies

**Real impact**: During the 2022 tech correction, portfolios with >70% tech allocation lost 30-40%, while balanced portfolios lost only 15-20%.

---

## ✨ Solution

Portfolio Risk Analyzer provides **instant, AI-powered insights** into your portfolio's hidden risks:

- 🔍 **Sector concentration analysis** - Visualize where your money really is
- 📊 **Diversification scoring** - Quantify how diversified you actually are
- ⚠️ **Risk level assessment** - Understand your exposure (LOW/MEDIUM/HIGH)
- 🤖 **AI-generated insights** - Plain-English explanations of your risks
- 💾 **Portfolio management** - Save, edit, and track multiple portfolios
- 📈 **Real-time stock data** - Live prices via Finnhub API

---

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Recharts** - Interactive data visualizations
- **Tailwind CSS** - Styling (inline styles for reliability)

### Backend
- **Spring Boot 3.2** - Java REST API
- **Spring Security** - JWT authentication
- **Spring Data JPA** - Database ORM
- **PostgreSQL** - Relational database
- **Finnhub API** - Real-time stock market data

### Infrastructure
- **Frontend**: Vercel (serverless deployment)
- **Backend**: Can be deployed to Railway, Render, or AWS
- **Database**: PostgreSQL (Docker for local, Railway for production)

---

## 🏗️ Architecture

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
            │   Database   │    │ (stocks)    │
            └──────────────┘    └─────────────┘
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- Docker (for PostgreSQL)
- Finnhub API key (free at [finnhub.io](https://finnhub.io))

### Frontend Setup

```bash
# Clone repository
git clone https://github.com/spraka52/portfolio-risk-analyzer.git
cd portfolio-risk-analyzer

# Install dependencies
npm install

# Create environment file
cat > .env.local << 'ENV'
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key_here
NEXT_PUBLIC_API_URL=http://localhost:8081/api
ENV

# Run development server
npm run dev
```

Visit `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend
cd portfolio-backend

# Start PostgreSQL with Docker
docker run --name portfolio-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio_db \
  -p 5432:5432 \
  -d postgres:15

# Configure application.properties
# Edit src/main/resources/application.properties with:
# - Database credentials
# - JWT secret (256+ bits)
# - Finnhub API key

# Build and run
mvn clean install
mvn spring-boot:run
```

API runs on `http://localhost:8081`

---

## 🎮 Usage

### 1. Try Sample Portfolios
- **Tech Growth**: High-risk, tech-heavy portfolio
- **Balanced**: Diversified across sectors
- **Dividend Income**: Conservative, income-focused

### 2. Create Custom Portfolio
1. Click "Create Custom Portfolio"
2. Type stock ticker (e.g., AAPL)
3. Select from autocomplete
4. Enter number of shares
5. Repeat for all holdings
6. Click "Analyze Portfolio"

### 3. User Accounts (Optional)
- Sign up to save portfolios
- Edit saved portfolios
- Track multiple portfolios
- Access from any device

---

## 📁 Project Structure

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

## 🔑 Key Features Breakdown

### Real-Time Stock Data
- Integrates with Finnhub API for live prices
- Autocomplete search for 50,000+ stocks
- Automatic sector classification

### Risk Analysis Engine
```javascript
// Calculates sector concentration
const sectorConcentration = {
  'Technology': 72.5,
  'Healthcare': 15.2,
  'Financial Services': 12.3
};

// Diversification score (inverse of max concentration)
const diversificationScore = 100 - Math.max(...Object.values(sectorConcentration));

// Risk level based on concentration
if (maxConcentration > 70) riskLevel = 'HIGH';
else if (maxConcentration > 50) riskLevel = 'MEDIUM';
else riskLevel = 'LOW';
```

### AI Insights (Anthropic Claude)
Generates plain-English explanations:
- "Your portfolio is heavily concentrated in Technology (72.5%)"
- "Consider adding exposure to defensive sectors"
- "During market downturns, tech-heavy portfolios can decline 30-40%"

### Authentication & Authorization
- JWT tokens with 24-hour expiration
- BCrypt password hashing
- CORS configured for Vercel + localhost
- Protected API endpoints

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Connect GitHub repo to Vercel
# Add environment variables in Vercel dashboard:
NEXT_PUBLIC_FINNHUB_API_KEY=your_key
NEXT_PUBLIC_API_URL=https://your-backend-url/api

# Deploy
vercel --prod
```

### Backend (Railway)
1. Create new project on [railway.app](https://railway.app)
2. Add PostgreSQL database
3. Deploy Spring Boot app
4. Add environment variables:
   - `SPRING_DATASOURCE_URL`
   - `JWT_SECRET`
   - `FINNHUB_API_KEY`

---

## 🎓 Learning Outcomes

This project demonstrates:

✅ **Full-stack development** - Frontend + Backend + Database
✅ **REST API design** - CRUD operations, authentication
✅ **Database modeling** - Relational schema with JPA
✅ **Security** - JWT auth, CORS, password hashing
✅ **External API integration** - Finnhub stock data
✅ **State management** - React Context API
✅ **TypeScript** - Type-safe development
✅ **Responsive UI/UX** - Mobile-friendly design
✅ **Git workflow** - Feature branches, commits

---

## 📈 Roadmap (Future Features)

### v2.0 (Planned)
- [ ] CSV portfolio import
- [ ] Historical performance tracking
- [ ] Portfolio backtesting
- [ ] Email alerts for risk threshold breaches
- [ ] Portfolio comparison tool
- [ ] Advanced metrics (Sharpe ratio, beta, alpha)

### v3.0 (Wishlist)
- [ ] Real-time WebSocket price updates
- [ ] Social features (share portfolios)
- [ ] Mobile app (React Native)
- [ ] Integration with brokerages (Robinhood, Fidelity)

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 👤 Author

**Shreya Prakash**
- Portfolio: [shreya.dev](https://shreya.dev)
- LinkedIn: [linkedin.com/in/shreya-prakash](https://linkedin.com/in/shreya-prakash)
- GitHub: [@spraka52](https://github.com/spraka52)

---

## 🙏 Acknowledgments

- **Finnhub** for free stock market data API
- **Anthropic Claude** for AI-powered insights
- **Spring Boot** community for excellent documentation
- **Next.js** team for the amazing framework

---

**Built with ❤️ for fintech recruiters and portfolio enthusiasts**

*Graduating May 2026 | Seeking Software Engineering roles in Fintech*
