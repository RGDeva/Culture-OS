# 🚀 Next Steps - AI Analysis Pipeline

## ⚡ Immediate Actions (5 minutes)

### 1. **Add Environment Variables**
Open your `.env.local` file (you have it open!) and add these lines:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Python Worker
PYTHON_WORKER_URL=http://localhost:8000

# Optional - Cyanite API (get from https://cyanite.ai)
# CYANITE_ACCESS_TOKEN=your_token_here

# Optional - Groq API (get from https://groq.com)
# GROQ_API_KEY=your_groq_key_here
```

### 2. **Run Database Migration**
```bash
npx prisma migrate dev --name add_asset_analysis
```

This creates the `Asset` and `AssetAnalysis` tables.

---

## 🐍 Python Worker Setup (10 minutes)

### Option A: Automated Setup (Recommended)
```bash
# Mac/Linux
chmod +x scripts/setup-analysis.sh
./scripts/setup-analysis.sh

# Windows
scripts\setup-analysis.bat
```

### Option B: Manual Setup
```bash
cd python-worker

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate.bat  # Windows

# Install dependencies
pip install -r requirements.txt

# Test it
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🧪 Testing (15 minutes)

### 1. **Start Services**

**Terminal 1 - Python Worker:**
```bash
cd python-worker
source venv/bin/activate
python main.py
```

**Terminal 2 - Next.js:**
```bash
npm run dev
```

### 2. **Test Health Endpoint**
```bash
curl http://localhost:8000/health
```

Expected: `{"status":"healthy"}`

### 3. **Upload Test File**
1. Go to `http://localhost:3000/vault`
2. Upload an MP3 or WAV file
3. **Important:** File must be uploaded to Cloudinary (real HTTP URL)
4. Mock URLs (`/uploads/...`) will skip analysis

### 4. **View Analysis**
1. Click on the uploaded file
2. You should see the modal open
3. Look for "AI_ANALYSIS" tab
4. If you see old modal without tabs, you need to integrate `AssetDetailModalV2`

---

## 🔌 Integration (20 minutes)

### Replace Old Modal with New One

**File:** `app/vault/page.tsx` (or wherever you use `AssetDetailModal`)

**Find:**
```tsx
import { AssetDetailModal } from '@/components/vault/AssetDetailModal'
```

**Replace with:**
```tsx
import { AssetDetailModalV2 } from '@/components/vault/AssetDetailModalV2'
```

**Find:**
```tsx
<AssetDetailModal
  asset={selectedAsset}
  isOpen={!!selectedAsset}
  onClose={() => setSelectedAsset(null)}
  // ... other props
/>
```

**Replace with:**
```tsx
<AssetDetailModalV2
  asset={selectedAsset}
  isOpen={!!selectedAsset}
  onClose={() => setSelectedAsset(null)}
  onUpdate={handleUpdateAsset}
  onDelete={handleDeleteAsset}
/>
```

---

## 🎨 Customization (Optional)

### Change Tab Colors
Edit `components/vault/AssetDetailModalV2.tsx`:

```tsx
// Line ~200
<TabsTrigger
  value="analysis"
  className="font-mono data-[state=active]:text-cyan-400" // Change color
>
```

### Add Custom Analysis Fields
1. Update `prisma/schema.prisma`:
```prisma
model AssetAnalysis {
  // ... existing fields
  customField String?
}
```

2. Run migration:
```bash
npx prisma migrate dev --name add_custom_field
```

3. Update `lib/analysis/analyzeAsset.ts` to save the field

4. Display in `components/vault/AnalysisTab.tsx`

---

## 🚀 Production Deployment

### 1. **Deploy Python Worker**

**Railway (Recommended):**
1. Push code to GitHub
2. Go to https://railway.app
3. Create new project → Deploy from GitHub
4. Select `python-worker` folder
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy
7. Copy the public URL

**Render:**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Root directory: `python-worker`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy

**Docker:**
```bash
cd python-worker
docker build -t noculture-worker .
docker run -p 8000:8000 noculture-worker
```

### 2. **Update Production Environment**
```bash
# In your production .env
PYTHON_WORKER_URL=https://your-worker.railway.app
CYANITE_ACCESS_TOKEN=your_production_token
DATABASE_URL=your_production_db_url
```

### 3. **Run Production Migration**
```bash
npx prisma migrate deploy
```

---

## 📊 Monitoring

### Check Analysis Success Rate
```typescript
const stats = await prisma.assetAnalysis.groupBy({
  by: ['status'],
  _count: true
})
```

### View Analysis in Database
```bash
npx prisma studio
```

This opens a GUI to view your database.

---

## 🐛 Common Issues

### Issue: "Analysis stuck on PENDING"
**Solution:**
1. Check Python worker is running: `curl http://localhost:8000/health`
2. Check browser console for errors
3. Check Python worker terminal for logs
4. Try retry button in UI

### Issue: "No analysis available"
**Solution:**
- Analysis only works with real HTTP URLs
- Ensure Cloudinary is configured
- Check file URL starts with `http://` or `https://`

### Issue: "Python worker won't start"
**Solution:**
```bash
cd python-worker
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

### Issue: "Prisma migration fails"
**Solution:**
```bash
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

---

## 📚 Documentation Reference

- **Quick Start:** `QUICKSTART_ANALYSIS.md`
- **Detailed Setup:** `ANALYSIS_SETUP.md`
- **Integration Guide:** `docs/VAULT_INTEGRATION.md`
- **Complete Reference:** `AI_ANALYSIS_README.md`
- **Worker Docs:** `python-worker/README.md`

---

## ✅ Verification Checklist

Before considering it done:

- [ ] `.env.local` has `DATABASE_URL` and `PYTHON_WORKER_URL`
- [ ] Database migration successful
- [ ] Python worker starts without errors
- [ ] Health endpoint responds
- [ ] Can upload files to vault
- [ ] `AssetDetailModalV2` integrated
- [ ] Analysis tab visible in modal
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] Retry works for failed analyses
- [ ] UI looks good in both themes
- [ ] Mobile responsive

---

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ Upload an audio file
2. ✅ See "Analysis queued..." message
3. ✅ Wait 1-2 minutes
4. ✅ Open asset detail modal
5. ✅ Switch to "AI_ANALYSIS" tab
6. ✅ See:
   - Detected instruments
   - Audio summary
   - AI insights
   - Genres and mood tags
   - BPM and key
   - Visual plots

---

## 💡 Pro Tips

1. **Test with various file formats:** MP3, WAV, FLAC, M4A
2. **Monitor Python worker logs** for debugging
3. **Use Prisma Studio** to inspect database
4. **Start with small files** (< 10MB) for faster testing
5. **Get Cyanite API key** for full features
6. **Deploy worker early** to test production setup

---

## 🎉 You're Ready!

Everything is built and documented. Just need to:
1. Add env vars
2. Run migration
3. Start services
4. Test it out!

**Total time: ~30 minutes to get fully running**

Questions? Check the docs or review the implementation summary!
