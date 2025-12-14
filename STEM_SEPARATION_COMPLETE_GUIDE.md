# 🎵 COMPLETE STEM SEPARATION GUIDE - ALL OPTIONS

## 🎯 **3 SEPARATION METHODS IMPLEMENTED:**

Your platform now supports **3 stem separation services** with intelligent fallback:

1. **Spleeter** (FREE, self-hosted) - Priority 1
2. **LALAL.AI** (PAID, cloud, best quality) - Priority 2  
3. **Replicate** (PAID, cloud, easy) - Priority 3
4. **Demo Mode** (fallback) - Priority 4

---

## **✅ OPTION 1: SPLEETER (FREE - RECOMMENDED)**

### **Why Spleeter:**
- ✅ Completely FREE
- ✅ Open source by Deezer
- ✅ High quality (⭐⭐⭐⭐⭐)
- ✅ Fast (2-10x realtime)
- ✅ No API keys needed
- ✅ Full control

### **Setup (10 minutes):**

**Step 1: Install Python Dependencies**
```bash
cd "/Users/rishig/Downloads/noculture-os (1)/python-worker"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download Spleeter models (first time only, ~500MB)
python -c "from spleeter.separator import Separator; Separator('spleeter:4stems')"
```

**Step 2: Start Spleeter Service**
```bash
# In python-worker directory
python split_service.py

# Should see:
# 🎵 Starting Spleeter Stem Separation Service...
# 📍 Running on http://localhost:8001
# 🎼 Models: 2stems, 4stems, 5stems
```

**Step 3: Configure Next.js**
```bash
# Add to .env.local
SPLEETER_URL=http://localhost:8001
# OR
PYTHON_WORKER_URL=http://localhost:8001
```

**Step 4: Restart Next.js**
```bash
npm run dev
```

**Step 5: Test!**
```
1. Upload audio file
2. Click STEM_SEPARATION
3. Click "SEPARATE_STEMS"
4. ✅ Real separation! (FREE!)
5. ✅ Each stem is different!
```

### **Cost:**
- **FREE** (only server costs if deployed)
- No API keys
- No usage limits
- No monthly fees

---

## **✅ OPTION 2: LALAL.AI (PAID - BEST QUALITY)**

### **Why LALAL.AI:**
- ✅ Best quality available (⭐⭐⭐⭐⭐)
- ✅ Professional grade
- ✅ Fast processing
- ✅ Reliable uptime
- ✅ No infrastructure needed
- ✅ Phoenix AI model

### **Setup (5 minutes):**

**Step 1: Sign Up**
```
1. Go to https://www.lalal.ai/api/
2. Create account
3. Buy credits:
   - $15 for 90 minutes
   - $25 for 150 minutes
   - $50 for 300 minutes
```

**Step 2: Get API Key**
```
1. Go to API section
2. Copy your license key
```

**Step 3: Add to .env.local**
```bash
LALAL_API_KEY=your_license_key_here
```

**Step 4: Restart Server**
```bash
npm run dev
```

**Step 5: Test!**
```
1. Upload audio
2. Separate stems
3. ✅ Best quality separation!
```

### **Cost:**
- $0.10-0.17 per minute
- 3-minute song = $0.30-0.51
- Best quality available

### **Features:**
- 10 stem types: vocals, voice, drum, bass, piano, electric_guitar, acoustic_guitar, synthesizer, strings, wind
- Dereverberation
- Enhanced processing
- Noise cancelling

---

## **✅ OPTION 3: REPLICATE (PAID - EASIEST)**

### **Why Replicate:**
- ✅ Easy setup (5 min)
- ✅ Pay-as-you-go
- ✅ Good quality (⭐⭐⭐⭐)
- ✅ No infrastructure
- ✅ $5 free credit

### **Setup (5 minutes):**

**Step 1: Sign Up**
```
https://replicate.com
```

**Step 2: Get API Token**
```
https://replicate.com/account/api-tokens
```

**Step 3: Install Package**
```bash
npm install replicate
```

**Step 4: Add to .env.local**
```bash
REPLICATE_API_TOKEN=r8_your_token_here
```

**Step 5: Restart & Test**
```bash
npm run dev
```

### **Cost:**
- $0.14 per minute
- 3-minute song = $0.41
- $5 free credit to start

---

## **📊 COMPARISON:**

| Service | Cost | Quality | Speed | Setup | Infrastructure |
|---------|------|---------|-------|-------|----------------|
| **Spleeter** | FREE | ⭐⭐⭐⭐⭐ | Fast | 10 min | Self-hosted |
| **LALAL.AI** | $0.10-0.17/min | ⭐⭐⭐⭐⭐ | Very Fast | 5 min | Cloud |
| **Replicate** | $0.14/min | ⭐⭐⭐⭐ | Fast | 5 min | Cloud |
| **Demo Mode** | FREE | ❌ | Instant | 0 min | None |

---

## **🎯 INTELLIGENT FALLBACK SYSTEM:**

Your platform tries each service in order:

```
1. Try Spleeter (if SPLEETER_URL set)
   ↓ If fails...
   
2. Try LALAL.AI (if LALAL_API_KEY set)
   ↓ If fails...
   
3. Try Replicate (if REPLICATE_API_TOKEN set)
   ↓ If fails...
   
4. Use Demo Mode (always works)
```

**This means:**
- ✅ Maximum reliability
- ✅ Cost optimization
- ✅ Always works
- ✅ Graceful degradation

---

## **💰 RECOMMENDED SETUP:**

### **For Development:**
```bash
# Use Spleeter (free)
SPLEETER_URL=http://localhost:8001
```

### **For Production (Low Volume):**
```bash
# Use Replicate (easy, pay-as-you-go)
REPLICATE_API_TOKEN=r8_...
```

### **For Production (High Volume):**
```bash
# Use Spleeter (free, deploy to server)
SPLEETER_URL=https://your-spleeter-server.com
```

### **For Production (Best Quality):**
```bash
# Use LALAL.AI (paid, best quality)
LALAL_API_KEY=your_key
```

### **For Production (Hybrid - BEST):**
```bash
# Use all three with fallback!
SPLEETER_URL=https://your-spleeter-server.com
LALAL_API_KEY=your_key
REPLICATE_API_TOKEN=r8_...

# System will:
# 1. Try Spleeter first (free)
# 2. If Spleeter down, use LALAL.AI (paid, best)
# 3. If LALAL.AI down, use Replicate (paid, easy)
# 4. If all down, use demo mode
```

---

## **🚀 QUICK START GUIDE:**

### **Fastest Setup (5 min):**
```bash
# 1. Sign up at Replicate
https://replicate.com

# 2. Get token
https://replicate.com/account/api-tokens

# 3. Install
npm install replicate

# 4. Add to .env.local
echo 'REPLICATE_API_TOKEN=r8_your_token' >> .env.local

# 5. Restart
npm run dev

# ✅ Done! Real stem separation working!
```

### **Best Setup (10 min):**
```bash
# 1. Install Spleeter
cd python-worker
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Start Spleeter
python split_service.py

# 3. Configure Next.js
echo 'SPLEETER_URL=http://localhost:8001' >> .env.local

# 4. Restart
npm run dev

# ✅ Done! FREE stem separation!
```

---

## **🎵 SPLEETER MODELS:**

### **2-Stem Model:**
- Vocals
- Accompaniment (everything else)

### **4-Stem Model (DEFAULT):**
- Vocals
- Drums
- Bass
- Other (instruments)

### **5-Stem Model:**
- Vocals
- Drums
- Bass
- Piano
- Other (instruments)

**To change model:**
```python
# In split_service.py, line 206:
formData.append('stems', '5')  # Use 5-stem model
```

---

## **📝 ENVIRONMENT VARIABLES:**

Add to `.env.local`:

```bash
# Option 1: Spleeter (FREE)
SPLEETER_URL=http://localhost:8001
# OR
PYTHON_WORKER_URL=http://localhost:8001

# Option 2: LALAL.AI (PAID, best quality)
LALAL_API_KEY=your_license_key

# Option 3: Replicate (PAID, easy)
REPLICATE_API_TOKEN=r8_your_token

# Use all three for maximum reliability!
```

---

## **🔧 TROUBLESHOOTING:**

### **Spleeter Issues:**

**"Module not found: spleeter"**
```bash
pip install spleeter==2.4.0
```

**"TensorFlow error"**
```bash
pip install tensorflow==2.13.0
```

**"Models not downloading"**
```bash
# Manually download models
python -c "from spleeter.separator import Separator; Separator('spleeter:4stems')"
```

**"Port 8001 already in use"**
```bash
# Change port in split_service.py, line 106:
uvicorn.run(app, host="0.0.0.0", port=8002)

# Update .env.local:
SPLEETER_URL=http://localhost:8002
```

### **LALAL.AI Issues:**

**"License not found"**
- Check API key is correct
- Check you have credits

**"Upload failed"**
- Check file size < 10GB
- Check internet connection

**"Processing timeout"**
- Increase maxAttempts in route.ts
- Check LALAL.AI status

### **Replicate Issues:**

**"Authentication failed"**
- Check API token is correct
- Check token starts with "r8_"

**"Model not found"**
- Check model ID is correct
- Try different model

---

## **💡 TIPS:**

### **Cost Optimization:**
```
1. Use Spleeter for development (FREE)
2. Use Spleeter for production if high volume (FREE)
3. Use LALAL.AI for best quality (PAID)
4. Use Replicate for easy setup (PAID)
5. Use all three with fallback for reliability
```

### **Quality Optimization:**
```
1. LALAL.AI Phoenix model = Best quality
2. Spleeter 5-stem = Very good quality
3. Replicate Demucs = Good quality
```

### **Speed Optimization:**
```
1. Spleeter = Fastest (local)
2. LALAL.AI = Very fast (cloud)
3. Replicate = Fast (cloud)
```

---

## **🎉 SUMMARY:**

**What You Have:**
- ✅ 3 stem separation services
- ✅ Intelligent fallback system
- ✅ FREE option (Spleeter)
- ✅ Best quality option (LALAL.AI)
- ✅ Easy option (Replicate)
- ✅ Always works (demo mode)

**Quick Start:**
1. **Fastest:** Replicate (5 min, $0.14/min)
2. **Best:** Spleeter (10 min, FREE)
3. **Hybrid:** All three (15 min, maximum reliability)

**Recommended:**
```bash
# Development
SPLEETER_URL=http://localhost:8001

# Production
SPLEETER_URL=https://your-server.com
LALAL_API_KEY=backup_key
REPLICATE_API_TOKEN=backup_token
```

**Your complete stem separation system with 3 services + fallback is ready! 🎵🚀**
