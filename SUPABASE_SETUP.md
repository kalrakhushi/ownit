# 🚀 Supabase Setup Guide - Step by Step

Complete guide to set up Supabase PostgreSQL database for your OwnIt app.

---

## 📋 **Prerequisites**

- ✅ An email address (for account creation)
- ✅ 5-10 minutes
- ✅ Your project ready (we've already migrated the code!)

---

## 🎯 **Step 1: Create Supabase Account**

1. **Go to Supabase**
   - Visit [https://supabase.com](https://supabase.com)
   - Click the **"Start your project"** button (top right)

2. **Sign Up**
   - Click **"Sign Up"** or **"Sign In"** if you already have an account
   - Choose one of these options:
     - **GitHub** (recommended - fastest)
     - **Google**
     - **Email** (enter email and password)

3. **Verify Email** (if using email signup)
   - Check your email inbox
   - Click the verification link
   - You'll be redirected back to Supabase

---

## 🏗️ **Step 2: Create a New Project**

1. **Click "New Project"**
   - After logging in, you'll see the Supabase dashboard
   - Click the green **"New Project"** button

2. **Fill in Project Details**

   **Organization:**
   - If this is your first project, create a new organization
   - Name it something like: `My Projects` or `Personal`
   - Click **"Create new organization"**

   **Project Details:**
   - **Name**: `ownit` (or any name you prefer)
   - **Database Password**: 
     - ⚠️ **IMPORTANT:** Create a strong password (12+ characters)
     - Save this password securely! You'll need it for the connection string
     - Example: `MySecurePass123!@#`
   - **Region**: 
     - Choose the region closest to you or your users
     - Options: US East, US West, EU West, Asia Pacific, etc.
     - For US users: `US East (North Virginia)` is usually good
   - **Pricing Plan**: 
     - Select **"Free"** (perfect for getting started)
     - Free tier includes:
       - 500 MB database
       - 2 GB file storage
       - 50,000 monthly active users
       - Unlimited API requests

3. **Click "Create new project"**
   - Wait 2-3 minutes for Supabase to set up your project
   - You'll see a loading screen with progress

---

## 🔑 **Step 3: Get Your Connection String**

Once your project is ready:

1. **Go to Project Settings**
   - In the left sidebar, click **"Settings"** (gear icon)
   - Then click **"Database"**

2. **Find Connection String**
   - Scroll down to **"Connection string"** section
   - You'll see different connection string formats
   - Look for **"URI"** format (it starts with `postgresql://`)

3. **Copy the Connection String**
   - Click the **copy icon** next to the URI
   - It looks like this:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - **Replace `[YOUR-PASSWORD]`** with the password you created in Step 2
   - Example:
     ```
     postgresql://postgres:MySecurePass123!@#@db.abcdefghijklmnop.supabase.co:5432/postgres
     ```

   ⚠️ **Important Notes:**
   - If your password contains special characters (`@`, `#`, `!`, etc.), you may need to URL-encode them
   - Or use the **"Connection pooling"** string instead (recommended for production)
   - For now, the regular URI string works fine

---

## 🔧 **Step 4: Add Connection String to Your Project**

1. **Open Your Project**
   - Navigate to your `ownit` project folder in your code editor

2. **Create/Update `.env.local`**
   - In the root of your project, create or open `.env.local`
   - Add this line:
     ```bash
     DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
     ```
   - Replace:
     - `YOUR_PASSWORD` with your actual database password
     - `YOUR_PROJECT_REF` with your actual project reference (from the connection string)

3. **Example `.env.local` file:**
   ```bash
   # Supabase PostgreSQL
   DATABASE_URL=postgresql://postgres:MySecurePass123!@#@db.abcdefghijklmnop.supabase.co:5432/postgres
   
   # Other environment variables (if you have them)
   GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
   ```

4. **Save the file**
   - Make sure `.env.local` is in your `.gitignore` (it should be by default)
   - Never commit this file to GitHub!

---

## 📦 **Step 5: Install Dependencies**

In your terminal, run:

```bash
npm install
```

This will install:
- `postgres` - PostgreSQL client
- `@supabase/supabase-js` - Supabase SDK (for future features)

---

## 🗄️ **Step 6: Push Schema to Database**

Now let's create all your database tables:

```bash
npm run drizzle:push
```

This will:
- Connect to your Supabase database
- Create all tables (HealthRecord, WearableSample, Streak, etc.)
- Set up indexes and constraints

**Expected output:**
```
✓ Pushing schema to database...
✓ Tables created successfully
```

---

## ✅ **Step 7: Verify Setup**

1. **Test Database Connection**
   ```bash
   npm run test:db
   ```

   You should see:
   ```
   🔌 Testing PostgreSQL connection...
   ✅ PostgreSQL connection successful!
   Sample record: []
   ✅ Insert test successful: [...]
   ✅ Cleanup successful
   ```

2. **Check Tables in Supabase**
   - Go back to Supabase dashboard
   - Click **"Table Editor"** in the left sidebar
   - You should see all your tables:
     - `HealthRecord`
     - `WearableSample`
     - `Streak`
     - `Calendar`
     - `MoodEntry`
     - `Challenge`
     - `ChallengeProgress`
     - `Reward`

---

## 🚀 **Step 8: Test Your App**

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test the App**
   - Open [http://localhost:3000](http://localhost:3000)
   - Go to Dashboard
   - Try creating a health record (Quick Entry)
   - Check if it saves successfully

3. **Verify in Supabase**
   - Go back to Supabase → Table Editor
   - Click on `HealthRecord` table
   - You should see your test record!

---

## 🎯 **Quick Reference**

### **Connection String Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **Where to Find It:**
1. Supabase Dashboard
2. Settings → Database
3. Connection string → URI

### **Environment Variable:**
```bash
DATABASE_URL=your-connection-string-here
```

---

## 🔒 **Security Best Practices**

1. **Never commit `.env.local`**
   - Already in `.gitignore` ✅
   - Double-check it's not tracked by git

2. **Use Strong Passwords**
   - 12+ characters
   - Mix of letters, numbers, symbols

3. **For Production (Later)**
   - Use connection pooling string
   - Set up Row Level Security (RLS) policies
   - Use environment variables in Vercel

---

## 🆘 **Troubleshooting**

### **"Connection refused" or "Connection timeout"**
- ✅ Check your internet connection
- ✅ Verify connection string is correct
- ✅ Make sure password is correct (no typos)
- ✅ Check if Supabase project is active (not paused)

### **"Password authentication failed"**
- ✅ Double-check your password
- ✅ Make sure you replaced `[YOUR-PASSWORD]` in the connection string
- ✅ Try resetting password in Supabase → Settings → Database

### **"Table does not exist"**
- ✅ Run `npm run drizzle:push` again
- ✅ Check Supabase → Table Editor to see if tables exist
- ✅ Verify you're using the correct database

### **"SSL required"**
- ✅ The `postgres` package handles SSL automatically
- ✅ If issues persist, check Supabase connection settings
- ✅ Try using the "Connection pooling" string instead

### **"Cannot find module 'postgres'"**
- ✅ Run `npm install` to install dependencies
- ✅ Make sure `postgres` is in your `package.json`

---

## 📚 **Next Steps**

Once Supabase is set up:

1. ✅ **Test your app** - Make sure everything works
2. ✅ **Migrate existing data** (if you have SQLite data):
   ```bash
   npm run migrate
   ```
3. ✅ **Deploy to Vercel** - Add `DATABASE_URL` to Vercel environment variables
4. ✅ **Set up Redis** (next step in cloud migration)
5. ✅ **Set up Background Workers** (after Redis)

---

## 🎉 **You're Done!**

Your Supabase PostgreSQL database is now set up and connected to your app! 

**What you've accomplished:**
- ✅ Created Supabase account
- ✅ Created PostgreSQL database
- ✅ Connected your app to the database
- ✅ Created all database tables
- ✅ Verified everything works

**Your app is now using a cloud database!** 🚀

---

## 💡 **Pro Tips**

1. **Connection Pooling** (for production):
   - Use the "Connection pooling" string from Supabase
   - Better performance for multiple connections
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

2. **Supabase Dashboard Features:**
   - **Table Editor**: View/edit data directly
   - **SQL Editor**: Run custom SQL queries
   - **API Docs**: Auto-generated API documentation
   - **Logs**: View database logs and queries

3. **Free Tier Limits:**
   - 500 MB database storage
   - 2 GB file storage
   - 50,000 monthly active users
   - Perfect for getting started!

---

**Need help?** Check the Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
