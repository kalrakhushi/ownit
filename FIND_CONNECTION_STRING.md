# 🔍 How to Find Your Supabase Connection String

You're in the right place! The connection string is on the same Database Settings page, just scroll down a bit more.

---

## 📍 **Where to Find It**

### **Option 1: Scroll Down on Current Page**

On the **Settings → Database** page you're currently viewing:

1. **Scroll down** past the sections you see:
   - Database password ✅ (you see this)
   - Connection pooling configuration ✅ (you see this)
   - SSL Configuration ✅ (you see this)
   - Disk Management ✅ (you see this)
   - Network Restrictions ✅ (you see this)

2. **Keep scrolling** - You'll find:
   - **"Connection string"** section
   - This shows different connection string formats
   - Look for the **"URI"** tab

### **Option 2: Direct Link**

1. In the left sidebar, click **"Settings"** (gear icon)
2. Click **"Database"**
3. Scroll down to find **"Connection string"** section

---

## 🔑 **What You're Looking For**

The connection string section looks like this:

```
Connection string
─────────────────────────────────────────────
[URI] [JDBC] [Golang] [Python] [Node.js] [C#]

postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

**Key details:**
- It starts with `postgresql://`
- Has tabs for different formats (URI, JDBC, etc.)
- The **URI** tab is what you need
- Click the **copy icon** (📋) to copy it

---

## 📝 **Step-by-Step Instructions**

1. **Stay on the Database Settings page** (where you are now)

2. **Scroll down** past all the sections you see:
   - Past "Database password"
   - Past "Connection pooling configuration"
   - Past "SSL Configuration"
   - Past "Disk Management"
   - Past "Network Restrictions"

3. **Look for "Connection string"** section
   - It should be near the bottom of the page
   - Has multiple tabs: URI, JDBC, Golang, Python, Node.js, C#

4. **Click the "URI" tab** (if not already selected)

5. **Copy the connection string**
   - Click the copy icon next to the connection string
   - It looks like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

6. **Replace `[YOUR-PASSWORD]`**
   - The connection string has `[YOUR-PASSWORD]` as a placeholder
   - Replace it with the actual password you created when setting up the project
   - Example:
     ```
     postgresql://postgres:MySecurePass123@db.abcdefghijklmnop.supabase.co:5432/postgres
     ```

---

## 🎯 **Alternative: Use Connection Info**

If you can't find the connection string section, you can build it manually:

### **What You Need:**

1. **Host**: Found in your Supabase project URL
   - Go to your project dashboard
   - Look at the URL: `https://app.supabase.com/project/[PROJECT-REF]`
   - Your host is: `db.[PROJECT-REF].supabase.co`

2. **Port**: `5432` (standard PostgreSQL port)

3. **Database**: `postgres` (default database)

4. **User**: `postgres` (default user)

5. **Password**: The password you created (or reset it)

### **Build Connection String:**

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

---

## 🔄 **If You Can't Find It**

### **Try These:**

1. **Refresh the page** - Sometimes sections load slowly

2. **Check different tabs** - Make sure you're on the "Database" tab in Settings

3. **Use the search** - Press `Cmd+F` (Mac) or `Ctrl+F` (Windows) and search for "Connection string"

4. **Check Project Settings** - Sometimes it's under "Project Settings" → "Database"

5. **Use the API approach**:
   - Go to **Settings → API**
   - Look for database connection info there

---

## ✅ **Once You Have It**

1. **Copy the connection string**

2. **Replace `[YOUR-PASSWORD]`** with your actual password

3. **Add to `.env.local`**:
   ```bash
   DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   ```

4. **Save the file**

5. **Test it**:
   ```bash
   npm run test:db
   ```

---

## 🆘 **Still Can't Find It?**

### **Quick Alternative - Get Info from Project URL:**

1. **Go to your Supabase project dashboard**
   - The main page when you click on your project

2. **Look at the URL bar**
   - It shows: `https://app.supabase.com/project/[PROJECT-REF]`
   - Copy the `[PROJECT-REF]` part

3. **Build connection string manually:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

4. **Get your password:**
   - If you forgot it, click **"Reset database password"** on the Database Settings page
   - Set a new password
   - Use that in the connection string

---

## 💡 **Pro Tip: Use Connection Pooling (Recommended)**

For better performance, use the **Connection pooling** string instead:

1. On the Database Settings page, look for **"Connection pooling"** section
2. Find the connection string that uses port **6543** (not 5432)
3. It looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

**Why use pooling?**
- Better for serverless (Vercel)
- Handles multiple connections better
- More efficient

---

**Need more help?** The connection string section should be visible if you scroll down on the Database Settings page. It's usually the last section before the bottom of the page.
