# 🔧 Connection Troubleshooting

## Current Status

✅ **Connection string updated** in `.env.local`
✅ **SSL configuration added** to `lib/db.ts`
❌ **Authentication error**: `SASL_SIGNATURE_MISMATCH`

## Current Connection String

```
postgresql://postgres.lrnleepxiwznkfaizpxf:Khushi123@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

## Error Details

```
Error: SASL_SIGNATURE_MISMATCH: The server did not return the correct signature
```

This error typically means:
1. **Password might be incorrect** - Double-check your Supabase database password
2. **Username format** - Connection pooling uses `postgres.[PROJECT-REF]` format
3. **Connection method** - Might need to use direct connection instead of pooling

---

## 🔍 Solutions to Try

### Option 1: Verify Password in Supabase

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Click **"Reset database password"** if needed
3. Copy the **exact** password (no extra spaces)
4. Update `.env.local` with the correct password

### Option 2: Try Direct Connection String

Instead of connection pooling, try the direct connection:

1. In Supabase → **Settings** → **Database**
2. Find **"Connection string"** section (not pooling)
3. Copy the **URI** format
4. It should look like:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Update `.env.local` with this string

### Option 3: Use Port 6543 for Pooling

Sometimes Supabase pooling uses port `6543`:

```bash
DATABASE_URL=postgresql://postgres.lrnleepxiwznkfaizpxf:Khushi123@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

### Option 4: URL-Encode Password

If your password has special characters, try URL-encoding:

```bash
# Example: If password is "My@Pass123"
# URL-encoded: My%40Pass123
DATABASE_URL=postgresql://postgres.lrnleepxiwznkfaizpxf:My%40Pass123@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

### Option 5: Use Supabase Client Library

As an alternative, we can use `@supabase/supabase-js` for connection:

```typescript
import { createClient } from '@supabase/supabase-js'
```

---

## ✅ What's Already Configured

- ✅ `.env.local` file created
- ✅ `lib/db.ts` updated with SSL support
- ✅ `drizzle.config.ts` loads environment variables
- ✅ All schema files ready for PostgreSQL
- ✅ Dependencies installed

---

## 🧪 Test Connection

Once you update the connection string, test it:

```bash
# Test connection
npm run test:db

# Push schema
npm run drizzle:push

# Start app
npm run dev
```

---

## 📝 Next Steps

1. **Verify password** in Supabase dashboard
2. **Try direct connection string** (not pooling)
3. **Check Supabase project status** (make sure it's active)
4. **Try port 6543** if using pooling
5. **Update `.env.local`** with correct credentials
6. **Run `npm run test:db`** to verify

---

## 💡 Quick Check

The connection string format should be:
- **Pooling**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:[PORT]/postgres`
- **Direct**: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

Make sure:
- ✅ No extra spaces
- ✅ Password matches exactly
- ✅ Project reference is correct
- ✅ Port matches (5432 for direct, 6543 or 5432 for pooling)
