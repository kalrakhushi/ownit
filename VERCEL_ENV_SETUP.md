# Vercel Environment Variables Setup Guide

## Required Environment Variables

Add these environment variables to your Vercel project for the deployed app to work correctly.

### Steps to Add Environment Variables in Vercel:

1. Go to your Vercel Dashboard
2. Select your project (`ownit` or `ownit-alpha`)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New** for each variable below

---

## Essential Variables (Required for Basic Functionality)

### 1. DATABASE_URL
**Required:** ✅ Yes  
**Sensitive:** ✅ Yes  
**Environments:** Production, Preview, Development

```
postgresql://postgres.lrnleepxiwznkfaizpxf:YOUR_PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

**How to get:**
- Go to your Supabase Dashboard
- Project Settings → Database
- Copy the "Connection string" (use the "Pooler" connection string)

---

### 2. LETTA_API_KEY
**Required:** ✅ Yes (for AI Coach)  
**Sensitive:** ✅ Yes  
**Environments:** Production, Preview, Development

```
your-letta-api-key-here
```

**How to get:**
- Go to https://app.letta.com/api-keys
- Create a new API key or copy existing one

---

### 3. LETTA_AGENT_ID
**Required:** ✅ Yes (for AI Coach)  
**Sensitive:** ❌ No  
**Environments:** Production, Preview, Development

```
agent-xxxxxxxxx
```

**How to get:**
- Run `npx tsx scripts/init-letta-agent.ts` locally
- Or check your `.env.local` file
- Or create agent at https://app.letta.com

---

## Optional but Recommended Variables

### 4. UPSTASH_REDIS_REST_URL
**Required:** ⚠️ Optional (for caching, improves performance)  
**Sensitive:** ✅ Yes  
**Environments:** Production, Preview, Development

```
https://your-redis-instance.upstash.io
```

**How to get:**
- Go to Upstash Dashboard
- Select your Redis database
- Copy the REST URL

---

### 5. UPSTASH_REDIS_REST_TOKEN
**Required:** ⚠️ Optional (for caching, improves performance)  
**Sensitive:** ✅ Yes  
**Environments:** Production, Preview, Development

```
your-redis-token-here
```

**How to get:**
- Same Upstash Dashboard page as above
- Copy the REST Token

---

### 6. NEXT_PUBLIC_POSTHOG_KEY
**Required:** ⚠️ Optional (for analytics)  
**Sensitive:** ❌ No (public prefix)  
**Environments:** Production, Preview, Development

```
your-posthog-project-api-key
```

**How to get:**
- Go to PostHog Dashboard
- Project Settings → Project API Key

---

### 7. NEXT_PUBLIC_POSTHOG_HOST
**Required:** ⚠️ Optional (for analytics)  
**Sensitive:** ❌ No (public prefix)  
**Environments:** Production, Preview, Development

```
https://us.i.posthog.com
```

**Default value:** `https://us.i.posthog.com`

---

### 8. CRON_SECRET
**Required:** ⚠️ Optional (for cron job security)  
**Sensitive:** ✅ Yes  
**Environments:** Production, Preview, Development

```
generate-a-random-secret-string-here
```

**How to generate:**
- Use any random string generator
- Or run: `openssl rand -base64 32`

---

## Quick Setup Checklist

- [ ] DATABASE_URL (Required)
- [ ] LETTA_API_KEY (Required for AI Coach)
- [ ] LETTA_AGENT_ID (Required for AI Coach)
- [ ] UPSTASH_REDIS_REST_URL (Optional - for caching)
- [ ] UPSTASH_REDIS_REST_TOKEN (Optional - for caching)
- [ ] NEXT_PUBLIC_POSTHOG_KEY (Optional - for analytics)
- [ ] NEXT_PUBLIC_POSTHOG_HOST (Optional - for analytics)
- [ ] CRON_SECRET (Optional - for cron security)

---

## After Adding Variables

1. **Redeploy your application:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"

2. **Or trigger a new deployment:**
   - Push a commit to your main branch
   - Vercel will automatically redeploy with new env vars

---

## Troubleshooting

### Data entry not working?
- ✅ Check DATABASE_URL is set correctly
- ✅ Verify it's set for Production environment
- ✅ Check Vercel function logs for errors

### AI Coach not working?
- ✅ Check LETTA_API_KEY is set
- ✅ Check LETTA_AGENT_ID is set
- ✅ Verify agent exists at https://app.letta.com

### Slow API responses?
- ✅ Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for caching

---

## Notes

- **Sensitive variables** should be marked as "Sensitive" in Vercel (they'll be hidden after saving)
- **Public variables** (NEXT_PUBLIC_*) are exposed to the browser, don't put secrets there
- **All environments** means the variable works in Production, Preview, and Development
- After adding variables, you **must redeploy** for them to take effect
