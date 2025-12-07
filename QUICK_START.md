# ⚡ Quick Start: Cloud Architecture Setup

Follow these steps in order to get your cloud architecture running.

## 🎯 **Step-by-Step Setup (30 minutes)**

### 1️⃣ **Set Up Supabase (5 min)**

```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Copy connection string from Settings → Database
# 4. Add to .env.local:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2️⃣ **Set Up Upstash Redis (5 min)**

```bash
# 1. Create account at upstash.com
# 2. Create Redis database
# 3. Copy REST URL and Token
# 4. Add to .env.local:
UPSTASH_REDIS_REST_URL=https://[YOUR-REDIS].upstash.io
UPSTASH_REDIS_REST_TOKEN=[YOUR-TOKEN]
```

### 3️⃣ **Install Dependencies (2 min)**

```bash
npm install @supabase/supabase-js postgres @upstash/redis @upstash/qstash bullmq
npm install -D @types/pg
```

### 4️⃣ **Run Migration Script (5 min)**

```bash
# Copy schema.postgres.ts (from guide)
# Update lib/db.ts (from guide)
# Generate migrations:
npm run drizzle:generate
npm run drizzle:push
```

### 5️⃣ **Set Up Vercel (10 min)**

```bash
# 1. Create vercel.json (from guide)
# 2. Push to GitHub
# 3. Connect to Vercel
# 4. Add all environment variables
# 5. Deploy!
```

### 6️⃣ **Test Everything (3 min)**

```bash
npm run test:db
npm run test:redis
# Check Vercel logs for cron jobs
```

---

## 📋 **Checklist**

- [ ] Supabase project created
- [ ] Upstash Redis database created
- [ ] Dependencies installed
- [ ] PostgreSQL schema created
- [ ] Database migrated
- [ ] Redis client configured
- [ ] Queue workers set up
- [ ] Cron jobs configured
- [ ] Environment variables set
- [ ] Deployed to Vercel
- [ ] Everything tested

---

## 🚨 **Common Issues**

**"DATABASE_URL not found"**
→ Check `.env.local` file exists and has correct format

**"Redis connection failed"**
→ Verify Upstash credentials are correct

**"Cron jobs not running"**
→ Check `vercel.json` exists and `CRON_SECRET` is set

---

**Ready? Start with Step 1!** 🚀
