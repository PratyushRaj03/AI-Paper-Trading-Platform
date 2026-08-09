# AuraPulse AI — AI-Powered Paper Trading & Financial Intelligence Platform

AuraPulse AI is an advanced, full-stack paper trading platform designed for risk-free market execution, quantitative analytics, automated AI trade coaching, and contextual financial education powered by RAG (Retrieval-Augmented Generation).

---

## 🌟 Key Features

- **Virtual Stock Trading**: Real-time paper order execution (Market & Limit orders) with pre-credited ₹10,00,000 virtual paper capital.
- **Portfolio Management**: Real-time asset valuation, holding cost averaging, cash balance updates, and realized/unrealized P&L tracking.
- **Market Data & Timeframe Charts**: Interactive candlestick/area charts (`1D`, `1W`, `1M`, `3M`, `1Y`) for top equities with live WebSocket tick streams.
- **Watchlist**: Custom stock tracking list with quick paper order execution triggers.
- **Order Management**: Comprehensive order book tracking `OPEN`, `EXECUTED`, and `CANCELLED` states with eligible limit order cancellation.
- **Trade History & Single-Trade AI Review**: Complete trade audit logs with one-click AI trade review analyzing execution quality, risk exposure, and mistake identification.
- **Performance Analytics**: Mathematical metrics calculated from actual trade history — Win/Loss Rate, Profit Factor, Sharpe Ratio, Annual Volatility, Maximum Drawdown %, Position Sizing %, and Buy/Sell Ratio.
- **AI Trade Coach**: Autonomous evaluation engine scoring portfolio concentration, drawdown, and strategy consistency into **Overall**, **Risk**, and **Strategy** scores.
- **RAG Financial Assistant**: ChatGPT-style financial intelligence assistant utilizing local TF-IDF document retrieval over structured financial education guides.
- **Demo & Offline Mode**: Gracefully handles missing API keys by running on realistic simulated tick data and deterministic fallback responses.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React (v18) + Vite
- **Styling**: Tailwind CSS (Dark-first glassmorphic visual system)
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons & Markdown**: Lucide React, React Markdown

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ORM
- **Auth & Security**: JWT Authentication, bcrypt password hashing
- **Real-Time Data**: WebSockets (`ws`)

### AI Service
- **Framework**: Python + FastAPI + Uvicorn
- **Vector Pipeline**: TF-IDF Document Retrieval + Cosine Similarity
- **NLP / ML**: scikit-learn, NumPy

---

## 🏗 Architecture Overview

```
Frontend (React / Vite) ──────► Backend REST API & WebSockets (Node/Express) ──────► MongoDB
          │
          └──────────────────► AI Service & Local RAG Pipeline (FastAPI / Python)
```

---

## 📸 Screenshots

*(Screenshots can be added here)*

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally at `mongodb://localhost:27017`)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/PratyushRaj03/aurapulse-ai.git
cd aurapulse-ai
```

### Step 2: Install Node Dependencies
```bash
npm run install:all
```

### Step 3: Set Up Python AI Virtual Environment
```bash
cd ai-service
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\activate

# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### Step 4: Seed Database
Populate local MongoDB with demo stocks, holdings, and demo account (`demo@example.com` / `Demo@123`):
```bash
npm run seed
```

### Step 5: Start All Services Concurrently
```bash
npm run dev
```

Port mapping:
- **Frontend Portal**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **AI Service**: [http://localhost:8000/](http://localhost:8000/)

---

## 🔑 Environment Variables

The project includes pre-configured `.env.example` templates in each service directory.

### Backend (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/paper-trading
JWT_SECRET=supersecretjwtkey_paper_trading_2026
PORT=5000
MARKET_API_KEY=
AI_SERVICE_URL=http://localhost:8000
```

### AI Service (`ai-service/.env`):
```env
AI_API_KEY=
EMBEDDING_MODEL=all-MiniLM-L6-v2
VECTOR_DB_PATH=knowledge
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛡 Demo / Offline Mode

When external API keys (`MARKET_API_KEY`, `AI_API_KEY`) are not supplied in `.env`, **AuraPulse AI** runs in **DEMO MODE**. All trading simulations, price ticks, portfolio analytics, AI coach scoring, and RAG document queries work 100% offline out-of-the-box.

---

## ⚠️ Disclaimer

> This project is an educational paper-trading platform. It does not execute real financial transactions and does not provide financial advice.

---

## 👤 Developer

**Pratyush Raj Srivastava**  
GitHub: [https://github.com/PratyushRaj03](https://github.com/PratyushRaj03)
