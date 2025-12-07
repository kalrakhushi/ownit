# 🚀 PostHog Quick Start

## ✅ Setup Complete!

PostHog analytics is integrated and tracking user behavior!

---

## 📊 View Your Analytics

### PostHog Dashboard
1. Go to: **https://us.i.posthog.com**
2. Login with your PostHog account
3. View live events coming in!

---

## 🎯 What's Being Tracked

### Automatically Tracked
- ✅ Page views (all pages)
- ✅ Button clicks (autocapture)
- ✅ Form submissions

### Custom Events Tracked
- ✅ **Health Records**: When added (CSV/Quick Entry)
- ✅ **Chat**: Messages sent, sessions started
- ✅ **Leaderboard**: Views and type changes
- ✅ **Streaks**: Views and achievements
- ✅ **Analytics**: Patterns and predictions viewed

---

## 🧪 Test It Out

### 1. Generate Events
- Visit different pages (Dashboard, Coach, etc.)
- Add a health record
- Send a chat message
- View the leaderboard
- Switch leaderboard types

### 2. Check PostHog Dashboard
Within a few seconds, you'll see events appear!

### 3. Verify in DevTools
- Open DevTools → Network tab
- Look for requests to `us.i.posthog.com/e/`
- These are your events being sent!

---

## 📈 Events You Can Track

All available in `lib/analytics.ts`:

```typescript
import { analytics } from '@/lib/analytics'

// Examples:
analytics.healthRecordAdded({ method: 'csv', recordCount: 10 })
analytics.chatMessageSent({ messageLength: 50 })
analytics.leaderboardViewed('steps')
analytics.streakAchievement({ streakDays: 7, isNewRecord: true })
analytics.featureUsed('export_data')
```

---

## 🎨 Create Dashboards

### In PostHog:

1. **Insights** → Create new insight
2. **Choose event**: e.g., `health_record_added`
3. **Add filters**: e.g., method = 'csv'
4. **Select chart type**: Line, Bar, Pie, etc.
5. **Save to dashboard**

### Suggested Dashboards
- User engagement (page views, session time)
- Feature adoption (health records, chat usage)
- Health tracking (records added over time)
- Leaderboard preferences (by type)

---

## 🔍 Debug Mode

Enable in browser console:
```javascript
posthog.debug()
```

This shows all events being captured in console!

---

## 📚 Documentation

- Full guide: `POSTHOG_IMPLEMENTATION.md`
- Analytics functions: `lib/analytics.ts`
- PostHog Docs: https://posthog.com/docs

---

## ✨ Quick Tips

1. **Real-time**: Events appear in ~5 seconds
2. **Retention**: Data stored for 1 year (on free plan)
3. **Privacy**: No PII tracked by default
4. **A/B Testing**: Available in PostHog
5. **Session Recording**: Can be enabled

---

**Status**: ✅ **LIVE & TRACKING**  
**Your Dashboard**: https://us.i.posthog.com  
**Events**: Flowing in real-time! 🎉
