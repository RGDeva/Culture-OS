# 🔧 Database Migration Guide - Publishing & Earnings

## ⚠️ **Current Issue**

The project is using **Prisma 7**, which has a different configuration format than previous versions. The migration command is failing because Prisma 7 requires moving the database URL from `schema.prisma` to a separate config file.

---

## ✅ **Solution: Downgrade to Prisma 6 (Recommended)**

This is the simplest and most reliable approach:

### **Step 1: Downgrade Prisma**
```bash
cd "/Users/rishig/Downloads/noculture-os (1)"
npm install prisma@6.8.0 @prisma/client@6.8.0
```

### **Step 2: Run Migration**
```bash
npx prisma migrate dev --name add_publishing_earnings
```

### **Step 3: Generate Client**
```bash
npx prisma generate
```

### **Step 4: Restart Dev Server**
```bash
npm run dev
```

**Done!** ✅ All 8 new models will be added to your database.

---

## 🔄 **Alternative: Use Prisma 7 (Advanced)**

If you want to keep Prisma 7, follow these steps:

### **Step 1: Create Prisma Config File**

Create `prisma/prisma.config.ts`:

```typescript
import { defineConfig } from '@prisma/client'

export default defineConfig({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
})
```

### **Step 2: Update Schema**

Edit `prisma/schema.prisma` - remove the `url` line:

```prisma
datasource db {
  provider = "sqlite"
  // Remove this line: url = "file:./dev.db"
}
```

### **Step 3: Run Migration**
```bash
npx prisma migrate dev --name add_publishing_earnings
```

### **Step 4: Update Prisma Client Initialization**

In your API routes, update how you initialize Prisma:

```typescript
// Old way (Prisma 5/6)
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// New way (Prisma 7)
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({
  adapter: {
    url: 'file:./dev.db'
  }
})
```

---

## 📊 **What the Migration Adds**

### **8 New Tables:**

1. **Work** - Musical works catalog
   - id, title, status, ownerId
   - isrc, iswc, releaseDate
   - spotifyUrl, appleMusicUrl

2. **SplitSheet** - Ownership structure
   - id, workId, locked
   - createdAt, updatedAt

3. **SplitParty** - Collaborators
   - id, splitSheetId, userId, externalName
   - role, walletAddress, pro, ipiCae

4. **SplitShare** - Percentage allocations
   - id, splitSheetId, partyId
   - masterSharePct, publishingSharePct

5. **Earning** - Revenue records
   - id, workId, type, source
   - amountCents, occurredAt

6. **Balance** - User account balances
   - id, userId, currency
   - availableCents, pendingCents

7. **AdvanceAgreement** - Advance tracking
   - id, userId, amountCents, status
   - recoupedCents, terms

8. **PayoutPreference** - Payout settings
   - id, userId, method, cadence
   - walletAddress, bankDetails

### **5 New Enums:**

1. **WorkStatus** - IDEA, IN_PROGRESS, RELEASED, CATALOGED
2. **EarningType** - MASTER, PUBLISHING
3. **AdvanceStatus** - PENDING, ACTIVE, RECOUPED, DEFAULTED
4. **PayoutMethod** - CRYPTO, BANK, BOTH
5. **PayoutCadence** - IMMEDIATE, WEEKLY, MONTHLY, QUARTERLY

---

## 🧪 **Testing After Migration**

### **1. Check Tables Created**
```bash
npx prisma studio
```

This opens a GUI where you can see all tables.

### **2. Test API Endpoints**

**Create a Work:**
```bash
curl -X POST http://localhost:3000/api/works \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Beat",
    "status": "IN_PROGRESS",
    "ownerId": "your-user-id"
  }'
```

**Get Works:**
```bash
curl http://localhost:3000/api/works?userId=your-user-id
```

**Get Balances:**
```bash
curl http://localhost:3000/api/balances/me?userId=your-user-id
```

### **3. Test UI**

1. **Dashboard** - Should show CatalogEarningsPanel
2. **Create Work** - Link a vault asset
3. **Define Splits** - Add parties and percentages
4. **View Work** - Navigate to `/works/[id]`

---

## 🔍 **Troubleshooting**

### **Error: "Prisma schema validation failed"**

**Cause:** Prisma 7 config format issue

**Fix:** Use Solution 1 (downgrade to Prisma 6)

---

### **Error: "Cannot find module '@prisma/client'"**

**Cause:** Prisma client not generated

**Fix:**
```bash
npx prisma generate
```

---

### **Error: "Table 'Work' does not exist"**

**Cause:** Migration not run

**Fix:**
```bash
npx prisma migrate dev --name add_publishing_earnings
```

---

### **Error: "Database locked"**

**Cause:** Another process is using the database

**Fix:**
```bash
# Kill any running processes
lsof -ti:3000 | xargs kill -9

# Try migration again
npx prisma migrate dev --name add_publishing_earnings
```

---

## 📝 **Migration Checklist**

Before running migration:
- [ ] Stop dev server (`Ctrl+C` or kill port 3000)
- [ ] Backup database (`cp prisma/dev.db prisma/dev.db.backup`)
- [ ] Choose Prisma version (6 or 7)

After running migration:
- [ ] Check tables in Prisma Studio
- [ ] Test API endpoints
- [ ] Restart dev server
- [ ] Test dashboard UI
- [ ] Create test work
- [ ] Verify data persists

---

## 🎯 **Expected Result**

After successful migration, you should see:

```bash
✓ Prisma schema loaded from prisma/schema.prisma
✓ Datasource "db": SQLite database "dev.db" at "file:./dev.db"

Applying migration `20250107_add_publishing_earnings`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250107_add_publishing_earnings/
      └─ migration.sql

✓ Generated Prisma Client (v6.8.0) to ./node_modules/@prisma/client

Everything is now in sync.
```

---

## 🚀 **Quick Start (TL;DR)**

```bash
# 1. Downgrade Prisma
npm install prisma@6.8.0 @prisma/client@6.8.0

# 2. Run migration
npx prisma migrate dev --name add_publishing_earnings

# 3. Generate client
npx prisma generate

# 4. Start app
npm run dev

# 5. Open dashboard
open http://localhost:3000
```

**That's it! Your Publishing & Earnings layer is now live! 🎵💚✨**

---

## 📚 **Additional Resources**

- [Prisma 6 Docs](https://www.prisma.io/docs/orm/prisma-migrate)
- [Prisma 7 Migration Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
- [SQLite Best Practices](https://www.sqlite.org/bestpractice.html)

---

**Need help? Check the error message and refer to the Troubleshooting section above.**
