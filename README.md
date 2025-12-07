# 🏋️ OwnIt - Personal Health Coach

AI-powered health tracking with real-time analytics, gamification, and personalized coaching.

## ⚡ Quick Start

```bash
npm install
npm run drizzle:push
npx tsx scripts/init-letta-agent.ts
npm run dev
```

Visit `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Caching**: Upstash Redis (80-96% faster)
- **AI**: Letta (stateful agent)
- **Analytics**: PostHog

## ✨ Features

- 🤖 AI Health Coach with memory
- 📊 Health data tracking (6 metrics)
- 🔥 Streak tracking (90-day calendar)
- 🏆 Real-time leaderboards (4 types)
- 🧠 ML predictions & pattern detection
- 📱 TikTok-style video feed
- 📈 Redis-cached analytics (80-96% faster)

## 🔑 Environment Setup

Create `.env.local`:

```bash
# Database
DATABASE_URL=postgresql://...

# Letta AI
LETTA_API_KEY=sk-let-...
LETTA_AGENT_ID=agent-...

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## 📁 Structure

```
ownit/
├── app/
│   ├── api/          # 12 endpoints + 4 cron jobs
│   ├── components/   # 21 React components
│   └── [pages]/      # 8 pages
├── lib/              # 9 utility files
├── drizzle/          # Database schema
└── scripts/          # Setup scripts
```

## 🎯 Pages

- `/dashboard` - Overview, data entry, charts
- `/coach` - AI chat
- `/streaks` - Streak tracking
- `/insights` - Analytics
- `/goals` - Goal setting
- `/influencers` - Video feed
- `/mood` - Mood logging

## 🔌 Key APIs

- `/api/health-records` - Health data CRUD
- `/api/streaks` - Streak calculations
- `/api/patterns` - Pattern detection
- `/api/predictions` - ML predictions
- `/api/leaderboard` - Real-time rankings
- `/api/chat` - AI coach

## 📦 Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run drizzle:push     # Update database
npm run drizzle:studio   # Database GUI
```

## ⚡ Performance

- Patterns: 1942ms → 73ms (96% faster)
- Predictions: 1034ms → 71ms (93% faster)
- Streaks: 234ms → 77ms (67% faster)

## 🚀 Deploy

Deploy to Vercel:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## 🔐 Security & Authentication (Roadmap)

Currently single-user mode. Future multi-user implementation planned:

### **Authentication Strategy**
- **NextAuth.js v5** - Industry-standard auth for Next.js
- **OAuth Providers**: Google, Apple, GitHub
- **Email/Password**: With email verification
- **2FA**: Time-based one-time passwords (TOTP)
- **Session Management**: Secure JWT tokens

### **Database Security**
- **Row-Level Security (RLS)** - Supabase policies per user
- **Encrypted Fields** - Sensitive health data encryption
- **Audit Logs** - Track data access and changes
- **Backup & Recovery** - Automated daily backups

### **API Security**
- **Rate Limiting** - Prevent abuse (Upstash Rate Limit)
- **CORS Configuration** - Restrict API access
- **API Key Rotation** - Automated secret rotation
- **Input Validation** - Zod schemas for all endpoints

### **Data Privacy**
- **GDPR Compliance** - Data export, deletion rights
- **HIPAA Readiness** - Healthcare data standards
- **End-to-End Encryption** - For sensitive data
- **Anonymous Analytics** - No PII in PostHog

### **Implementation Plan**
```typescript
// 1. NextAuth Configuration
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { SupabaseAdapter } from "@auth/supabase-adapter"

export const { handlers, auth } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.DATABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      session.user.id = user.id
      return session
    },
  },
})

// 2. Middleware Protection
export function middleware(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.redirect('/login')
  }
  return NextResponse.next()
}

// 3. Row-Level Security (Supabase)
CREATE POLICY "Users can only access their own data"
ON health_records
FOR ALL
USING (auth.uid() = user_id);
```

### **Security Checklist**
- [ ] Implement NextAuth.js with OAuth
- [ ] Add Row-Level Security to all tables
- [ ] Encrypt sensitive health data at rest
- [ ] Set up rate limiting (Upstash)
- [ ] Add audit logging
- [ ] Implement 2FA
- [ ] GDPR compliance features
- [ ] Penetration testing
- [ ] Security headers (helmet.js)
- [ ] CSP (Content Security Policy)

---

**Built with ❤️ for health-conscious users**
