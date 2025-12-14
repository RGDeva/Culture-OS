# 🎵 Vault Analysis Pipeline Setup Guide

Complete setup guide for the Mansuba AI + Cyanite music analysis integration.

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL or SQLite database
- Cyanite API access token (optional but recommended)

---

## 🚀 Step 1: Database Setup

### 1.1 Install Prisma CLI
```bash
npm install -D prisma
npm install @prisma/client
```

### 1.2 Initialize Prisma (if not already done)
```bash
npx prisma init
```

### 1.3 Run Migration
```bash
npx prisma migrate dev --name add_asset_analysis
```

### 1.4 Generate Prisma Client
```bash
npx prisma generate
```

---

## 🐍 Step 2: Python Worker Setup

### 2.1 Navigate to Python Worker Directory
```bash
cd python-worker
```

### 2.2 Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 2.4 Test the Worker
```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2.5 Test Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

---

## 🔑 Step 3: Environment Variables

### 3.1 Update `.env.local`
```bash
# Python Worker
PYTHON_WORKER_URL=http://localhost:8000

# Cyanite API (optional - get from https://cyanite.ai)
CYANITE_ACCESS_TOKEN=your_cyanite_token_here

# Groq API (optional - for faster LLM inference)
GROQ_API_KEY=your_groq_api_key_here
```

### 3.2 Get Cyanite API Token
1. Sign up at https://cyanite.ai
2. Go to API Settings
3. Generate an access token
4. Add to `.env.local`

---

## 🧪 Step 4: Test the Pipeline

### 4.1 Start Python Worker
```bash
cd python-worker
source venv/bin/activate
python main.py
```

### 4.2 Start Next.js Dev Server (in another terminal)
```bash
npm run dev
```

### 4.3 Test Analysis API
```bash
# Create a test asset first (replace with actual assetId)
curl -X POST http://localhost:3000/api/analysis/queue \
  -H "Content-Type: application/json" \
  -d '{"assetId": "your_asset_id_here"}'
```

### 4.4 Check Analysis Status
```bash
curl http://localhost:3000/api/analysis/queue?assetId=your_asset_id_here
```

---

## 📁 Step 5: Integrate with Vault Upload

The analysis is automatically triggered when you upload a file to the vault.

### How it works:
1. User uploads audio file → Asset created in database
2. Upload API calls `/api/analysis/queue` with assetId
3. Analysis record created with status `PENDING`
4. Background job calls Python worker
5. Python worker runs Mansuba AI analysis
6. Node.js server calls Cyanite API
7. Results saved to database with status `COMPLETE`
8. User sees results in Analysis tab

---

## 🎨 Step 6: View Analysis in UI

### 6.1 Upload an Audio File
1. Go to `/vault`
2. Upload an MP3, WAV, or other audio file
3. Wait for upload to complete

### 6.2 View Analysis
1. Click on the uploaded asset
2. Go to "Analysis" tab
3. See:
   - **PENDING** → Analysis is running
   - **COMPLETE** → View full results
   - **FAILED** → Retry button available

### 6.3 Analysis Results Include:
- **Mansuba AI:**
  - Detected instruments
  - Audio summary
  - AI insights
  - Instrument timeline plot
  - Virality score

- **Cyanite:**
  - Genres
  - Mood tags
  - BPM
  - Key
  - Primary mood

---

## 🔧 Step 7: Production Deployment

### 7.1 Deploy Python Worker

**Option A: Docker**
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

Build and deploy:
```bash
docker build -t noculture-worker ./python-worker
docker run -p 8000:8000 noculture-worker
```

**Option B: Railway/Render**
1. Create new Python service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Deploy

### 7.2 Update Environment Variables
```bash
# Production Python worker URL
PYTHON_WORKER_URL=https://your-worker.railway.app

# Cyanite token
CYANITE_ACCESS_TOKEN=your_production_token
```

### 7.3 Database Migration
```bash
npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Python Worker Not Starting
```bash
# Check Python version
python3 --version  # Should be 3.9+

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Check for port conflicts
lsof -ti:8000 | xargs kill -9
```

### Mansuba Analysis Failing
```bash
# Test Mansuba directly
python3 -c "from gradio_client import Client; print(Client('Mansuba/AI-Powered-Music-Analysis'))"

# Check Groq API key
echo $GROQ_API_KEY
```

### Cyanite API Errors
```bash
# Verify token
curl -H "Authorization: Bearer $CYANITE_ACCESS_TOKEN" \
  https://api.cyanite.ai/graphql \
  -d '{"query": "{ __typename }"}'
```

### Database Connection Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

---

## 📊 Monitoring & Logs

### View Python Worker Logs
```bash
# Development
tail -f python-worker/logs.txt

# Production (Docker)
docker logs -f noculture-worker
```

### View Next.js Logs
```bash
# Check analysis queue
grep "ANALYSIS_QUEUE" .next/server.log

# Check processing
grep "ANALYSIS_PROCESS" .next/server.log
```

---

## 🎯 Performance Optimization

### 1. Use Background Queue (Production)
Install a proper job queue:
```bash
npm install bullmq ioredis
```

Replace fire-and-forget with BullMQ:
```typescript
import { Queue } from 'bullmq'

const analysisQueue = new Queue('analysis', {
  connection: { host: 'localhost', port: 6379 }
})

await analysisQueue.add('analyze', { assetId })
```

### 2. Cache Cyanite Results
Add Redis caching for Cyanite API calls to avoid duplicate requests.

### 3. Parallel Processing
Run multiple Python workers:
```bash
uvicorn main:app --workers 4
```

---

## ✅ Verification Checklist

- [ ] Prisma migration complete
- [ ] Python worker running on port 8000
- [ ] Next.js dev server running on port 3000
- [ ] Environment variables set
- [ ] Test upload triggers analysis
- [ ] Analysis completes successfully
- [ ] Results visible in UI
- [ ] Retry works for failed analyses

---

## 📚 API Reference

### POST /api/analysis/queue
Queue asset for analysis.

**Request:**
```json
{
  "assetId": "clx123abc"
}
```

**Response:**
```json
{
  "message": "Analysis queued successfully",
  "analysis": {
    "id": "cly456def",
    "assetId": "clx123abc",
    "status": "PENDING"
  }
}
```

### GET /api/analysis/queue?assetId=xxx
Get analysis status.

**Response:**
```json
{
  "analysis": {
    "id": "cly456def",
    "status": "COMPLETE",
    "instruments": "[\"Piano\", \"Drums\"]",
    "audioSummary": "This track features...",
    "cyaniteBpm": 120,
    "cyaniteKey": "C major"
  }
}
```

### POST /api/analysis/retry?assetId=xxx
Retry failed analysis.

**Response:**
```json
{
  "message": "Analysis retry queued successfully",
  "retryCount": 1
}
```

---

## 🎉 You're All Set!

Your vault now has AI-powered music analysis! 🚀

**Next Steps:**
1. Upload audio files to test
2. Monitor analysis completion
3. Customize UI to match your brand
4. Deploy to production

**Need Help?**
- Check logs in Python worker and Next.js
- Review Prisma schema for data structure
- Test API endpoints with curl/Postman
