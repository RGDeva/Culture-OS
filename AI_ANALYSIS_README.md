# 🎵 AI-Powered Music Analysis Pipeline

**Complete implementation of Mansuba AI + Cyanite integration for NoCulture OS**

---

## ✅ **What's Been Built**

### **🗄️ Database Layer**
- ✅ `Asset` model - Vault assets with metadata
- ✅ `AssetAnalysis` model - AI analysis results storage
- ✅ Prisma schema configured for SQLite
- ✅ Migration ready to run

### **🔌 API Routes**
- ✅ `/api/analysis/queue` - Queue analysis (POST/GET)
- ✅ `/api/analysis/process` - Background processor
- ✅ `/api/analysis/retry` - Retry failed analyses
- ✅ `/api/vault/upload` - Auto-queues analysis on upload

### **🐍 Python Worker**
- ✅ FastAPI service for Mansuba AI
- ✅ Audio download and processing
- ✅ Gradio client integration
- ✅ Health check endpoint
- ✅ Error handling and logging

### **⚛️ React Components**
- ✅ `AnalysisTab` - Beautiful UI for viewing results
- ✅ `AssetDetailModalV2` - Enhanced modal with tabs
- ✅ Loading/error/success states
- ✅ Retry mechanism with button

### **📚 Documentation**
- ✅ `QUICKSTART_ANALYSIS.md` - 5-minute setup guide
- ✅ `ANALYSIS_SETUP.md` - Detailed setup instructions
- ✅ `VAULT_INTEGRATION.md` - Integration guide
- ✅ `python-worker/README.md` - Worker documentation
- ✅ Setup scripts for Mac/Linux/Windows

---

## 🚀 **Quick Start**

### **1. Add Environment Variables**

Open `.env.local` (you have it open!) and add:

```bash
DATABASE_URL="file:./prisma/dev.db"
PYTHON_WORKER_URL=http://localhost:8000
```

Optional (but recommended):
```bash
CYANITE_ACCESS_TOKEN=your_token_here
GROQ_API_KEY=your_groq_key_here
```

### **2. Run Setup Script**

**Mac/Linux:**
```bash
chmod +x scripts/setup-analysis.sh
./scripts/setup-analysis.sh
```

**Windows:**
```bash
scripts\setup-analysis.bat
```

**Or manually:**
```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup database
npx prisma generate
npx prisma migrate dev --name add_asset_analysis

# Setup Python worker
cd python-worker
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# OR venv\Scripts\activate.bat  # Windows
pip install -r requirements.txt
```

### **3. Start Services**

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

### **4. Test It!**

1. Go to `http://localhost:3000/vault`
2. Upload an MP3/WAV file (must be real Cloudinary URL)
3. Click on the uploaded file
4. Switch to "AI_ANALYSIS" tab
5. Wait 1-2 minutes for analysis
6. View AI-powered insights! 🎉

---

## 📊 **What You Get**

### **Mansuba AI Analysis:**
```
✅ Detected Instruments (Piano, Drums, Bass, Guitar, etc.)
✅ Audio Summary (Natural language description)
✅ AI Insights (Production quality, style analysis)
✅ Instrument Timeline Plot (Visual representation)
✅ Virality Score Plot (Viral potential prediction)
```

### **Cyanite Analysis:**
```
✅ Genres (Trap, R&B, Electronic, Hip-Hop, etc.)
✅ Mood Tags (Energetic, Dark, Chill, Happy, etc.)
✅ BPM (Tempo detection)
✅ Key (Musical key detection - C major, A minor, etc.)
✅ Primary Mood (Overall emotional tone)
```

---

## 🎨 **UI Preview**

### **Analysis Tab States:**

**PENDING:**
```
🔄 ANALYZING_AUDIO...
This may take 1-2 minutes. Feel free to navigate away.
```

**COMPLETE:**
```
✅ ANALYSIS_COMPLETE

🎸 MANSUBA_AI_ANALYSIS
  ├─ Instruments: Piano, Drums, Bass
  ├─ Audio Summary: "This track features..."
  ├─ AI Insights: "The production quality is..."
  ├─ Instrument Timeline: [Plot Image]
  └─ Virality Score: [Plot Image]

🎵 CYANITE_ANALYSIS
  ├─ Genres: Trap, R&B, Electronic
  ├─ Mood Tags: Energetic, Dark, Chill
  ├─ BPM: 140
  └─ Key: A minor
```

**FAILED:**
```
❌ ANALYSIS_FAILED
Error message here
Retry attempts: 1 / 3
[RETRY_ANALYSIS Button]
```

---

## 🔧 **Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                    User Uploads File                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              POST /api/vault/upload                      │
│  • Uploads to Cloudinary                                 │
│  • Creates Asset in database                             │
│  • Queues analysis                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           POST /api/analysis/queue                       │
│  • Creates AssetAnalysis (status: PENDING)               │
│  • Triggers background job                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         POST /api/analysis/process                       │
│  • Updates status to PROCESSING                          │
│  • Calls analyzeAsset()                                  │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  Python Worker   │  │  Cyanite API     │
│  (Mansuba AI)    │  │  (GraphQL)       │
│  • Download file │  │  • Upload file   │
│  • Run analysis  │  │  • Poll results  │
│  • Return data   │  │  • Parse data    │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Update AssetAnalysis                        │
│  • Save Mansuba results                                  │
│  • Save Cyanite results                                  │
│  • Set status to COMPLETE                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              User Views Results                          │
│  • Opens asset detail modal                              │
│  • Switches to AI_ANALYSIS tab                           │
│  • Sees beautiful insights!                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 **File Structure**

```
noculture-os/
├── prisma/
│   ├── schema.prisma          # Database models (Asset, AssetAnalysis)
│   └── prisma.config.ts       # Prisma 7 configuration
│
├── app/api/
│   ├── analysis/
│   │   ├── queue/route.ts     # Queue analysis endpoint
│   │   ├── process/route.ts   # Background processor
│   │   └── retry/route.ts     # Retry failed analyses
│   └── vault/
│       └── upload/route.ts    # Auto-queues analysis
│
├── lib/analysis/
│   ├── analyzeAsset.ts        # Main orchestrator
│   └── cyaniteAnalysis.ts     # Cyanite API integration
│
├── components/vault/
│   ├── AnalysisTab.tsx        # Analysis UI component
│   └── AssetDetailModalV2.tsx # Enhanced modal with tabs
│
├── python-worker/
│   ├── main.py                # FastAPI service
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Worker documentation
│
├── scripts/
│   ├── setup-analysis.sh      # Mac/Linux setup
│   └── setup-analysis.bat     # Windows setup
│
└── docs/
    ├── QUICKSTART_ANALYSIS.md    # 5-minute guide
    ├── ANALYSIS_SETUP.md         # Detailed setup
    └── VAULT_INTEGRATION.md      # Integration guide
```

---

## 🔍 **Troubleshooting**

### **Python Worker Won't Start**
```bash
# Check Python version
python3 --version  # Need 3.9+

# Reinstall dependencies
cd python-worker
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### **Database Errors**
```bash
# Reset and recreate
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

### **Analysis Stuck on PENDING**
1. Check Python worker is running: `curl http://localhost:8000/health`
2. Check browser console for errors
3. Check Python worker terminal for logs
4. Try the retry button in UI

### **"No Analysis Available"**
- Analysis only works with **real HTTP URLs**
- Mock URLs (`/uploads/...`) are skipped
- Ensure Cloudinary is configured:
  ```bash
  CLOUDINARY_CLOUD_NAME=your_cloud
  CLOUDINARY_API_KEY=your_key
  CLOUDINARY_API_SECRET=your_secret
  ```

---

## 🚀 **Production Deployment**

### **1. Deploy Python Worker**

**Option A: Docker**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t noculture-worker ./python-worker
docker run -p 8000:8000 noculture-worker
```

**Option B: Railway**
1. Push to GitHub
2. Create Python service on Railway
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy

**Option C: Render**
1. Connect GitHub repo
2. Select Python environment
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy

### **2. Update Environment Variables**
```bash
# Production
PYTHON_WORKER_URL=https://your-worker.railway.app
CYANITE_ACCESS_TOKEN=your_production_token
DATABASE_URL=your_production_db_url
```

### **3. Database Migration**
```bash
# Run on production
npx prisma migrate deploy
```

---

## 📈 **Performance & Scaling**

### **Current Limits:**
- **Analysis Time:** 1-2 minutes per track
- **Concurrent Jobs:** Depends on Python worker instances
- **Retry Limit:** 3 attempts per asset

### **Optimization Tips:**
1. **Use Redis Queue** - Replace fire-and-forget with BullMQ
2. **Scale Workers** - Run multiple Python worker instances
3. **Cache Results** - Cache Cyanite responses in Redis
4. **Batch Processing** - Process multiple files in parallel
5. **CDN Caching** - Cache analysis results at edge

---

## 💰 **Cost Estimates**

### **Cyanite API:**
- Free tier: 100 analyses/month
- Paid: $0.10 - $0.50 per analysis
- https://cyanite.ai/pricing

### **Groq API (Optional):**
- Free tier: 14,400 requests/day
- Very fast LLM inference
- https://groq.com/pricing

### **Infrastructure:**
- **Python Worker:** $5-10/month (Railway/Render)
- **Database:** Free (SQLite) or $5-20/month (PostgreSQL)
- **Total:** ~$10-30/month for moderate usage

---

## ✅ **Verification Checklist**

Before going live, verify:

- [ ] `.env.local` has all required variables
- [ ] Database migration successful
- [ ] Python worker starts without errors
- [ ] Health endpoint responds: `curl http://localhost:8000/health`
- [ ] Can upload files to vault
- [ ] Analysis tab shows in asset detail modal
- [ ] Analysis completes successfully
- [ ] Retry works for failed analyses
- [ ] UI looks good in light/dark mode
- [ ] Mobile responsive
- [ ] Production worker deployed
- [ ] Production environment variables set

---

## 🎯 **Next Steps**

1. **Test the Pipeline:**
   - Upload various audio formats (MP3, WAV, FLAC)
   - Test with different file sizes
   - Verify all analysis fields populate

2. **Customize UI:**
   - Match your brand colors
   - Add custom analysis fields
   - Enhance visualizations

3. **Optimize Performance:**
   - Add Redis queue
   - Scale Python workers
   - Implement caching

4. **Monitor & Improve:**
   - Track success rates
   - Monitor processing times
   - Gather user feedback

5. **Deploy to Production:**
   - Deploy Python worker
   - Update environment variables
   - Run database migrations
   - Test end-to-end

---

## 📚 **Additional Resources**

- **Mansuba AI:** https://huggingface.co/spaces/Mansuba/AI-Powered-Music-Analysis
- **Cyanite API:** https://cyanite.ai/docs
- **Groq API:** https://console.groq.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

## 🎉 **You're All Set!**

Your vault now has **AI-powered music analysis** with:
- 🎸 Instrument detection
- 📝 Natural language summaries
- 💡 AI-generated insights
- 🎵 Genre & mood classification
- ⚡ BPM & key detection
- 🔥 Virality prediction

**Happy analyzing! 🚀**

---

## 📞 **Support**

Need help? Check these docs:
1. `QUICKSTART_ANALYSIS.md` - Quick setup
2. `ANALYSIS_SETUP.md` - Detailed guide
3. `VAULT_INTEGRATION.md` - Integration tips
4. `python-worker/README.md` - Worker docs

**Issues?** Check troubleshooting section above or review logs:
- Python worker: Check terminal output
- Next.js: Check browser console
- Database: Run `npx prisma studio` to inspect data
