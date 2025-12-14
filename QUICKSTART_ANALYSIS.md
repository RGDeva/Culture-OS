# 🚀 Quick Start: AI Analysis Pipeline

Get the AI-powered music analysis running in **5 minutes**!

---

## ⚡ Super Quick Setup

### 1. **Add to `.env.local`** (you have this file open!)
```bash
# Add these lines:
DATABASE_URL="file:./prisma/dev.db"
PYTHON_WORKER_URL=http://localhost:8000
```

### 2. **Run Setup Script**
```bash
# Mac/Linux:
chmod +x scripts/setup-analysis.sh
./scripts/setup-analysis.sh

# Windows:
scripts\setup-analysis.bat
```

### 3. **Start Python Worker** (Terminal 1)
```bash
cd python-worker
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate.bat  # Windows

python main.py
```

### 4. **Start Next.js** (Terminal 2)
```bash
npm run dev
```

### 5. **Test It!**
1. Go to `http://localhost:3000/vault`
2. Upload an MP3/WAV file
3. Click on the file
4. Go to "AI_ANALYSIS" tab
5. Wait 1-2 minutes
6. See AI-powered insights! 🎉

---

## 🎯 What You Get

### **Mansuba AI Analysis:**
- 🎸 **Detected Instruments** (Piano, Drums, Bass, etc.)
- 📝 **Audio Summary** (Natural language description)
- 💡 **AI Insights** (Production quality, style analysis)
- 📊 **Instrument Timeline** (Visual plot)
- 🔥 **Virality Score** (Viral potential prediction)

### **Cyanite Analysis:**
- 🎵 **Genres** (Trap, R&B, Electronic, etc.)
- 😊 **Mood Tags** (Energetic, Dark, Chill, etc.)
- ⚡ **BPM** (Tempo detection)
- 🎹 **Key** (Musical key detection)
- 🎨 **Primary Mood**

---

## 🐛 Troubleshooting

### **Python Worker Won't Start**
```bash
# Check Python version (need 3.9+)
python3 --version

# Reinstall dependencies
cd python-worker
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **Database Errors**
```bash
# Reset database
npx prisma migrate reset
npx prisma generate
```

### **Analysis Stuck on "PENDING"**
1. Check Python worker is running (`http://localhost:8000/health`)
2. Check browser console for errors
3. Check Python worker logs
4. Try retry button in UI

### **"No Analysis Available"**
- Analysis only works with **real Cloudinary URLs**
- Mock URLs (starting with `/uploads/`) are skipped
- Make sure `CLOUDINARY_*` env vars are set

---

## 📊 How It Works

```
Upload File
    ↓
Asset Created
    ↓
Analysis Queued (status: PENDING)
    ↓
Python Worker Called
    ↓
Mansuba AI Analysis (30-60s)
    ↓
Cyanite API Analysis (30-60s)
    ↓
Results Saved (status: COMPLETE)
    ↓
View in UI! 🎉
```

---

## 🎨 UI States

| Status | What You See |
|--------|-------------|
| **PENDING** | Loading spinner + "Analysis running..." |
| **PROCESSING** | Loading spinner + "Analyzing audio..." |
| **COMPLETE** | Full results with all insights |
| **FAILED** | Error message + Retry button (max 3 retries) |

---

## 🔧 Optional: Get Cyanite API Key

1. Sign up at https://cyanite.ai
2. Go to API Settings
3. Generate access token
4. Add to `.env.local`:
   ```bash
   CYANITE_ACCESS_TOKEN=your_token_here
   ```

**Note:** Cyanite is optional. Mansuba will still work without it!

---

## 🚀 Production Deployment

### **Deploy Python Worker:**

**Option A: Docker**
```bash
cd python-worker
docker build -t noculture-worker .
docker run -p 8000:8000 noculture-worker
```

**Option B: Railway**
1. Push to GitHub
2. Create new Python service on Railway
3. Connect repo
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Deploy

### **Update Environment:**
```bash
PYTHON_WORKER_URL=https://your-worker.railway.app
```

---

## ✅ Verification Checklist

- [ ] `.env.local` has `DATABASE_URL` and `PYTHON_WORKER_URL`
- [ ] Python worker running on port 8000
- [ ] Next.js running on port 3000
- [ ] Can upload files to vault
- [ ] Analysis tab shows in asset detail
- [ ] Analysis completes successfully
- [ ] Can retry failed analyses

---

## 🎉 You're Done!

Your vault now has **AI-powered music analysis**! 

**Next Steps:**
- Upload more tracks to test
- Customize the UI styling
- Add more analysis features
- Deploy to production

**Need Help?** Check `ANALYSIS_SETUP.md` for detailed docs!
