# OwnIt - Personal Health Coach

A modern, AI-powered health tracking application that combines real-time analytics, gamification, and personalized coaching to help users achieve their wellness goals.

**Live Application**: [https://ownit-alpha.vercel.app/](https://ownit-alpha.vercel.app/)

---

## Overview

OwnIt is a comprehensive health coaching platform that enables users to track their health metrics, receive AI-powered insights, compete on leaderboards, and maintain streaks. The application features a stateful AI coach that remembers conversations and provides personalized health recommendations based on your data.

### Key Features

- **AI Health Coach**: Stateful AI agent with memory that provides personalized health guidance
- **Health Data Tracking**: Track weight, steps, sleep, calories, protein, and mood across time
- **Streak Tracking**: Visual 90-day calendar to maintain consistency and build habits
- **Real-Time Leaderboards**: Compete with others on steps, sleep, streaks, and calories
- **ML Analytics**: Pattern detection and predictive analytics for health insights
- **Video Content**: TikTok-style vertical video feed for wellness content
- **Performance Optimized**: Redis caching delivers 80-96% faster API responses

---

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Modern UI library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Relational database (hosted on Supabase)

### Infrastructure
- **Vercel** - Serverless hosting and deployment
- **Upstash Redis** - Caching layer for performance
- **Letta AI** - Stateful AI agent platform
- **PostHog** - Product analytics and event tracking

---

## Getting Started

### For Users

Visit the live application at [https://ownit-alpha.vercel.app/](https://ownit-alpha.vercel.app/) to start tracking your health data and interacting with the AI coach.

### For Developers

#### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- Upstash Redis account
- Letta AI account
- PostHog account

#### Installation

1. Clone the repository:
```bash
git clone https://github.com/kalrakhushi/ownit.git
cd ownit
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following:

```bash
# Database
DATABASE_URL=postgresql://your-database-url

# Letta AI
LETTA_API_KEY=your-letta-api-key
LETTA_AGENT_ID=your-letta-agent-id

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Cron Jobs (optional)
CRON_SECRET=your-random-secret-string
```

4. Initialize the database:
```bash
npm run drizzle:push
```

5. Create the AI agent:
```bash
npx tsx scripts/init-letta-agent.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

---

## Project Structure

```
ownit/
├── app/
│   ├── api/              # API endpoints (12 routes + cron jobs)
│   ├── components/       # React components (21 components)
│   ├── coach/           # AI chat interface
│   ├── dashboard/       # Main dashboard page
│   ├── streaks/         # Streak tracking page
│   ├── insights/        # Analytics and predictions
│   ├── goals/           # Goal setting page
│   ├── influencers/     # Video content feed
│   └── mood/            # Mood logging page
├── lib/                 # Utility functions
│   ├── db.ts           # Database connection
│   ├── redis.ts        # Redis caching utilities
│   ├── analytics.ts     # PostHog event tracking
│   └── ...             # Other utilities
├── drizzle/            # Database schema
└── scripts/            # Setup and utility scripts
```

---

## API Endpoints

### Health Data
- `GET /api/health-records` - Retrieve health records
- `POST /api/health-records` - Create new health record

### Analytics
- `GET /api/streaks` - Get streak data
- `GET /api/patterns` - Get pattern detection results
- `GET /api/predictions` - Get ML predictions
- `GET /api/risk-alerts` - Get health risk alerts
- `GET /api/comparison` - Compare metrics over time

### Gamification
- `GET /api/leaderboard` - Get leaderboard rankings
- `POST /api/leaderboard` - Update leaderboard scores

### AI Coach
- `GET /api/chat` - Get message history
- `POST /api/chat` - Send message to AI coach

### Other
- `GET /api/mood` - Get mood entries
- `POST /api/mood` - Create mood entry
- `GET /api/challenges` - Get challenges
- `GET /api/wearables` - Wearable integration endpoint

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run drizzle:push` - Push database schema changes
- `npm run drizzle:studio` - Open Drizzle Studio (database GUI)

---

## Performance

The application uses Redis caching to significantly improve response times:

- **Patterns API**: 1942ms → 73ms (96% faster)
- **Predictions API**: 1034ms → 71ms (93% faster)
- **Streaks API**: 234ms → 77ms (67% faster)
- **Database Load**: 70-80% reduction

---

## Security & Authentication

Currently, the application operates in single-user mode. Future enhancements include:

- Multi-user authentication with NextAuth.js
- OAuth providers (Google, Apple, GitHub)
- Row-level security for database access
- Two-factor authentication
- Rate limiting and API security
- GDPR compliance features

See the Security & Authentication section in the README for detailed implementation plans.

---

## Deployment

The application is deployed on Vercel and automatically deploys from the main branch. Environment variables are configured in the Vercel dashboard.

**Production URL**: [https://ownit-alpha.vercel.app/](https://ownit-alpha.vercel.app/)

### Deployment Process

1. Push changes to GitHub main branch
2. Vercel automatically triggers deployment
3. Build completes in approximately 2-3 minutes
4. Changes are live at the production URL

---

## Documentation

- **Technical Design Document**: See `TECHNICAL_DESIGN.md` for comprehensive architecture details, design decisions, and implementation notes.

---

## Contributing

This is a personal project. For questions or suggestions, please open an issue on GitHub.

---

## License

This project is private and proprietary.

---

## Acknowledgments

- **Letta** - Stateful AI agent platform
- **Supabase** - PostgreSQL hosting
- **Upstash** - Redis caching
- **PostHog** - Product analytics
- **Vercel** - Deployment platform

---

**Built for health-conscious users**
