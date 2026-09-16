# 🚀 AI Sales Agent Platform

> **Discover. Qualify. Engage. Convert — All with AI.**  
> An autonomous end-to-end enterprise sales automation platform that continuously monitors public channels, enriches prospect intelligence, scores predictive intent, and autonomously conducts multilingual voice qualification calls to book meetings on autopilot.

---

## 🌟 Core Highlights

- 🔍 **Autonomous AI Lead Discovery**: Scans and indexes high-intent requirements from public sources (LinkedIn, X / Twitter, company RFP portals, directories, freelance boards, and CRM syncs).
- 🎯 **Predictive Intent Scoring**: Evaluates intent fit (0–100) using LLM heuristic classifiers assessing budget approvals, decision-maker seniority, rollout timelines, and active RFPs.
- 🎙️ **Multilingual AI Voice Agent**: Sub-150ms conversational agent powered by Groq Llama 3.3 and Gemini that conducts outbound voice discovery, handles objections, answers technical questions, and logs call transcripts.
- 📅 **Autonomous Meeting Booking**: Automatically schedules calendar demonstrations with solutions architects upon prospect confirmation.
- 📱 **Executive Mobile Companion & Pipeline Analytics**: Real-time KPI dashboards, multi-line campaign progression curves, source distribution donuts, and live call listen-ins.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js 16 (Turbopack, App Router)](https://nextjs.org/)
- **UI & Runtime**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom glassmorphism design tokens
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (`dev.db`)
- **AI Inference**:
  - **Groq SDK** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) for ultra-low latency voice dialogue
  - **Google Generative AI SDK** (`gemini-2.5-flash`) for deep intent extraction & enrichment
  - Graceful built-in heuristic fallback engine for offline development
- **Voice / Audio**: Web Speech API Text-to-Speech (TTS) + Speech Recognition with live streaming transcript animation

---

## 📂 Project Structure

```
Ai_sales/
├── prisma/
│   └── schema.prisma            # SQLite schema for Leads, Campaigns, CallLogs & Org settings
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── discover/        # Autonomous lead discovery endpoint
│   │   │   ├── leads/           # Leads CRUD & filter query endpoint
│   │   │   ├── stats/           # Real-time KPIs & charts aggregation
│   │   │   └── voice/call/      # Voice dialogue turn manager & auto-scheduler
│   │   ├── globals.css          # Theme tokens, glassmorphism, glowing radial gradients
│   │   ├── layout.tsx           # SEO metadata & root font config
│   │   └── page.tsx             # Interactive AI Sales Agent Platform workspace
│   ├── components/
│   │   ├── dashboard/           # KPI cards, Campaign chart, Donut distributions, Mobile preview
│   │   ├── discovery/           # Discovery search bar, DiscoveredLeadCard, IntentScoreModal
│   │   ├── layout/              # HeaderBanner, Sidebar
│   │   └── voice/               # LiveCallSimulatorModal with real-time audio & transcripts
│   └── lib/
│       ├── ai/
│       │   ├── gemini.ts        # Intent scoring & sentiment analysis
│       │   ├── groq.ts          # Sub-150ms conversational dialogue manager
│       │   └── lead-discovery-engine.ts # Public crawler simulator & lead catalog
│       └── prisma.ts            # Global Prisma Client instance
├── .env.example                 # Sample environment configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/ArchitVaghasiya/Chaos2Commit.git
cd Chaos2Commit
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(Optional)* Add your API keys in `.env` for live LLM inference:
```env
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AIza..."
```
> **Note**: Even without API keys, the application includes a deterministic dialogue manager and realistic fallback data so all interactive features (discovery, calling, meeting booking, scoring) function seamlessly out of the box!

### 4. Database Initialization
Generate the Prisma Client and sync the SQLite schema:
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🧪 Key Workflows to Explore

1. **Autonomous Lead Discovery**: Enter any keyword or select platform pills (LinkedIn, X, Company Websites) to discover high-intent public posts.
2. **Predictive Intent Breakdown**: Click on any lead's **Intent Score** pill to inspect the radial confidence gauge, budget signals, and ranked pipeline.
3. **Launch Live AI Call**: Click **Launch AI Call** on any lead to start the live simulator. Experience real-time audio playback, interactive dialogue turns, and automated outcome tagging (Meeting Booked).
4. **Mobile Sales App**: Preview the executive companion interface displaying live campaign metrics and real-time alerts.

---

## 📄 License
MIT License. Free for open development and enterprise evaluation.
