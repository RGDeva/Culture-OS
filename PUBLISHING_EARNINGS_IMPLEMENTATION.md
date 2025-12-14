# 🎵 Publishing & Earnings Layer - Implementation Guide

## ✅ **COMPLETED: Backend & Database**

### **1. Prisma Schema Extended** ✅

**File:** `prisma/schema.prisma`

**Added Models:**
- `Work` - Catalog of musical works with metadata
- `SplitSheet` - Ownership structure for each work
- `SplitParty` - Individual collaborators/rights holders
- `SplitShare` - Percentage allocations (master & publishing)
- `Earning` - Revenue records per work
- `Balance` - User account balances
- `AdvanceAgreement` - Advance/recoupment tracking
- `AdvanceWork` - Link advances to works
- `PayoutPreference` - User payout settings

**Added Enums:**
- `WorkStatus` - IDEA, IN_PROGRESS, RELEASED, CATALOGED
- `EarningType` - MASTER, PUBLISHING
- `AdvanceStatus` - ACTIVE, RECOUPED, CANCELLED
- `PayoutMethod` - BANK, WALLET, BOTH
- `PayoutCadence` - DAILY, WEEKLY, MONTHLY

**Next Step:** Run migration
```bash
npx prisma migrate dev --name add_publishing_earnings
npx prisma generate
```

---

### **2. API Routes Created** ✅

#### **Works API**

**`/api/works` (GET, POST)**
- `GET` - List all works for current user (owner or collaborator)
- `POST` - Create new work with title, status, vault asset links

**`/api/works/[id]` (GET, PATCH)**
- `GET` - Get work details with split sheet and earnings summary
- `PATCH` - Update work metadata (title, status, ISRC, DSP links)

#### **Splits API**

**`/api/splits/[workId]` (GET, POST, PATCH)**
- `GET` - Get split sheet for work
- `POST` - Create initial split sheet with parties and shares
- `PATCH` - Update parties/shares (only if not locked)
- **Validation:** Enforces master & publishing shares = 100%
- **Locking:** Cannot lock unless totals are valid

#### **Earnings API**

**`/api/earnings` (GET, POST)**
- `GET` - Get earnings summary (existing endpoint)
- `POST` - Add earnings from CSV/JSON payload
  - Creates `Earning` records
  - Calculates owed amounts per `SplitParty`
  - Updates `Balance` for each user

#### **Balances API**

**`/api/balances/me` (GET)**
- Get balances for current user
- Grouped by currency
- Returns available, pending, and total cents

---

## 🎯 **TODO: Frontend Components**

### **3. Work Creation from Vault** (Not Started)

**Location:** `app/vault/page.tsx`

**Changes Needed:**
1. Add "LINK TO WORK" button to each vault asset card
2. Show "Work: [title]" label if already linked
3. Create modal for work creation:
   - Title field (pre-filled from filename)
   - Status dropdown (IDEA/IN_PROGRESS/RELEASED/CATALOGED)
   - Submit → POST `/api/works`
4. After creation, show link to work details

**Component to Create:**
```typescript
// components/vault/LinkToWorkModal.tsx
interface LinkToWorkModalProps {
  assetId: string
  assetName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: (workId: string) => void
}
```

---

### **4. Work Detail Page** (Not Started)

**Location:** `app/works/[id]/page.tsx`

**Layout:**
- **Left Panel:** Work info
  - Title, status, owner
  - Linked vault assets
  - Release metadata (ISRC, ISWC, date, label, distributor)
  - DSP links (Spotify, Apple Music)
  
- **Right Panel:** Ownership & Publishing
  - Parties list table
  - Split matrix (Master %, Publishing %)
  - Add party button
  - Save/Lock buttons

**Components to Create:**
```typescript
// components/works/WorkDetails.tsx
// components/works/SplitEditor.tsx
// components/works/PartyForm.tsx
```

---

### **5. Dashboard Snapshot** (Not Started)

**Location:** `app/page.tsx`

**Add Panel:** "My Catalog & Earnings"

**Metrics to Show:**
- Works count (owner + collaborator)
- Total master earnings
- Total publishing earnings
- Balances (available + pending)

**Quick Actions:**
- VIEW WORKS
- VIEW SPLITS
- ADD EARNINGS (admin only)

**API Calls:**
```typescript
// GET /api/works?userId={userId}
// GET /api/balances/me?userId={userId}
```

---

## 📊 **Data Flow**

### **Creating a Work**
```
Vault Asset → "LINK TO WORK" → Modal
  ↓
POST /api/works
  {
    title: "Beat Name",
    status: "IN_PROGRESS",
    vaultAssetIds: ["asset_123"],
    ownerId: "user_456"
  }
  ↓
Work Created → Redirect to /works/[id]
```

### **Defining Splits**
```
Work Detail Page → Add Parties
  ↓
Add Party Form
  {
    userId: "user_789" OR externalName: "John Doe",
    role: "PRODUCER",
    walletAddress: "0x...",
    pro: "BMI",
    ipiCae: "123456789"
  }
  ↓
POST /api/splits/[workId]
  {
    parties: [...],
    shares: [
      { partyIndex: 0, masterSharePct: 50, publishingSharePct: 50 },
      { partyIndex: 1, masterSharePct: 50, publishingSharePct: 50 }
    ]
  }
  ↓
Validation: totals must = 100%
  ↓
Split Sheet Created
```

### **Adding Earnings**
```
Admin Panel → Upload CSV/JSON
  ↓
POST /api/earnings
  {
    earnings: [
      {
        workId: "work_123",
        type: "MASTER",
        source: "Spotify",
        amountCents: 10000,
        occurredAt: "2025-01-01"
      }
    ]
  }
  ↓
For each earning:
  1. Create Earning record
  2. Get SplitSheet for work
  3. Calculate owed amounts per party
  4. Update Balance for each user
```

### **Viewing Balances**
```
Dashboard → "My Catalog & Earnings"
  ↓
GET /api/balances/me?userId={userId}
  ↓
{
  balances: {
    "USD": {
      availableCents: 12345,
      pendingCents: 6789,
      totalCents: 19134
    }
  }
}
  ↓
Display: "$191.34 total ($123.45 available, $67.89 pending)"
```

---

## 🎨 **UI Design Guidelines**

### **Terminal Aesthetic**
- Dark background with neon green text
- Monospace font (font-mono)
- Border style: `border-2 border-green-400`
- Buttons: `bg-green-400/10 text-green-400 border-green-400`
- Labels: `> LABEL_NAME` format

### **Component Structure**
```tsx
// Example Work Card
<div className="border-2 border-green-400/50 bg-black p-4">
  <h3 className="font-mono text-green-400 text-lg">
    &gt; {work.title}
  </h3>
  <div className="text-xs font-mono text-green-400/70">
    Status: {work.status}
  </div>
  <div className="text-xs font-mono text-green-400/70">
    Earnings: ${(totalCents / 100).toFixed(2)}
  </div>
</div>
```

### **Split Matrix Table**
```tsx
<table className="w-full font-mono text-xs">
  <thead className="bg-green-400/10">
    <tr className="text-green-400">
      <th>NAME</th>
      <th>ROLE</th>
      <th>MASTER_%</th>
      <th>PUB_%</th>
    </tr>
  </thead>
  <tbody>
    {parties.map(party => (
      <tr key={party.id} className="border-t border-green-400/20">
        <td>{party.externalName || party.user?.displayName}</td>
        <td>{party.role}</td>
        <td>
          <input 
            type="number" 
            className="bg-black border border-green-400/30 text-green-400"
          />
        </td>
        <td>
          <input 
            type="number" 
            className="bg-black border border-green-400/30 text-green-400"
          />
        </td>
      </tr>
    ))}
  </tbody>
  <tfoot className="border-t-2 border-green-400 bg-green-400/10">
    <tr className="font-bold text-green-400">
      <td colSpan={2}>TOTAL:</td>
      <td className={masterTotal === 100 ? 'text-green-400' : 'text-red-400'}>
        {masterTotal}%
      </td>
      <td className={pubTotal === 100 ? 'text-green-400' : 'text-red-400'}>
        {pubTotal}%
      </td>
    </tr>
  </tfoot>
</table>
```

---

## 🧪 **Testing Checklist**

### **Backend APIs**
- [ ] POST /api/works - Create work
- [ ] GET /api/works - List user's works
- [ ] GET /api/works/[id] - Get work details
- [ ] PATCH /api/works/[id] - Update work
- [ ] POST /api/splits/[workId] - Create split sheet
- [ ] GET /api/splits/[workId] - Get split sheet
- [ ] PATCH /api/splits/[workId] - Update splits
- [ ] POST /api/earnings - Add earnings
- [ ] GET /api/balances/me - Get balances

### **Validation**
- [ ] Split shares must total 100% (master)
- [ ] Split shares must total 100% (publishing)
- [ ] Cannot lock split sheet if totals != 100%
- [ ] Cannot modify locked split sheet
- [ ] ISRC must be unique

### **Frontend (TODO)**
- [ ] Link vault asset to work
- [ ] Create work from vault
- [ ] View work details
- [ ] Add split parties
- [ ] Edit split percentages
- [ ] Lock split sheet
- [ ] View earnings on work
- [ ] View balances on dashboard

---

## 🚀 **Next Steps**

1. **Run Prisma Migration**
   ```bash
   cd /Users/rishig/Downloads/noculture-os\ \(1\)
   npx prisma migrate dev --name add_publishing_earnings
   npx prisma generate
   ```

2. **Create Frontend Components**
   - `components/vault/LinkToWorkModal.tsx`
   - `components/works/WorkDetails.tsx`
   - `components/works/SplitEditor.tsx`
   - `app/works/[id]/page.tsx`

3. **Update Dashboard**
   - Add "My Catalog & Earnings" panel to `app/page.tsx`

4. **Update Vault Page**
   - Add "LINK TO WORK" buttons to asset cards

5. **Test End-to-End Flow**
   - Create work from vault
   - Define splits
   - Add earnings
   - View balances

---

## 📝 **API Examples**

### **Create Work**
```bash
curl -X POST http://localhost:3000/api/works \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hard Trap Beat",
    "status": "IN_PROGRESS",
    "ownerId": "user_123",
    "vaultAssetIds": ["asset_456"]
  }'
```

### **Create Split Sheet**
```bash
curl -X POST http://localhost:3000/api/splits/work_789 \
  -H "Content-Type: application/json" \
  -d '{
    "parties": [
      {
        "userId": "user_123",
        "role": "PRODUCER",
        "walletAddress": "0x..."
      },
      {
        "externalName": "John Artist",
        "role": "ARTIST"
      }
    ],
    "shares": [
      {
        "partyIndex": 0,
        "masterSharePct": 50,
        "publishingSharePct": 100
      },
      {
        "partyIndex": 1,
        "masterSharePct": 50,
        "publishingSharePct": 0
      }
    ]
  }'
```

### **Add Earnings**
```bash
curl -X POST http://localhost:3000/api/earnings \
  -H "Content-Type: application/json" \
  -d '{
    "earnings": [
      {
        "workId": "work_789",
        "type": "MASTER",
        "source": "Spotify",
        "amountCents": 10000,
        "occurredAt": "2025-01-01T00:00:00Z"
      }
    ]
  }'
```

---

## ✅ **Status Summary**

**Completed:**
- ✅ Prisma schema with all models and enums
- ✅ Works API (GET, POST, PATCH)
- ✅ Splits API (GET, POST, PATCH) with validation
- ✅ Earnings API (POST) with balance updates
- ✅ Balances API (GET)

**In Progress:**
- ⏳ Frontend components
- ⏳ Dashboard integration
- ⏳ Vault integration

**Not Started:**
- ❌ Work detail page
- ❌ Split editor UI
- ❌ Dashboard earnings panel

**Ready for:** Database migration and frontend development! 🚀
