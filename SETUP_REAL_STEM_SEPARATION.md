# 🎵 SETUP REAL STEM SEPARATION - 5 MINUTES

## ⚠️ **CURRENT STATUS:**

**You're in DEMO MODE** - stems aren't actually separated, all play the same audio.

**To get REAL stem separation**, follow these steps:

---

## 🚀 **OPTION 1: REPLICATE (EASIEST - 5 MIN)**

### **Step 1: Sign Up (2 min)**

```
1. Go to https://replicate.com
2. Click "Sign Up"
3. Sign up with GitHub or email
4. ✅ Free account created
```

### **Step 2: Get API Token (1 min)**

```
1. Go to https://replicate.com/account/api-tokens
2. Click "Create token"
3. Copy the token (starts with "r8_")
4. ✅ Token copied
```

### **Step 3: Add to Project (1 min)**

```bash
# In your project root, create .env.local file
cd "/Users/rishig/Downloads/noculture-os (1)"

# Create .env.local (if doesn't exist)
touch .env.local

# Add this line (replace with your token):
echo 'REPLICATE_API_TOKEN=r8_your_token_here' >> .env.local
```

**Or manually:**
1. Open `.env.local` file
2. Add this line:
```
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

### **Step 4: Install Package (1 min)**

```bash
npm install replicate
```

### **Step 5: Restart Server**

```bash
# Stop server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### **Step 6: Test!**

```
1. Go to http://localhost:3000/vault
2. Upload audio file
3. Click STEM_SEPARATION
4. Click "SEPARATE_STEMS"
5. ✅ Real separation! (takes 2-5 min)
6. ✅ Each stem is different!
```

---

## 💰 **PRICING:**

**Replicate:**
- **Cost:** $0.0023 per second of audio
- **Example:** 3-minute song = 180 seconds = $0.41
- **Free tier:** $5 credit to start

**Calculation:**
```
1 minute song  = 60s  × $0.0023 = $0.14
3 minute song  = 180s × $0.0023 = $0.41
5 minute song  = 300s × $0.0023 = $0.69
10 minute song = 600s × $0.0023 = $1.38
```

**Very affordable for professional use!**

---

## 🎯 **HOW IT WORKS:**

### **Before (Demo Mode):**
```
Upload: my-song.mp3
Separate stems
Result:
  - Vocals:  plays my-song.mp3(original)
  - Drums:   plays my-song.mp3 (original)
  - Bass:    plays my-song.mp3 (original)
  - Other:   plays my-song.mp3 (original)
❌ All stems are the same
```

### **After (Replicate API):**
```
Upload: my-song.mp3
Separate stems (2-5 min processing)
Result:
  - Vocals:  plays ONLY vocals
  - Drums:   plays ONLY drums
  - Bass:    plays ONLY bass
  - Other:   plays ONLY instruments
✅ Each stem is different!
✅ Professional quality!
```

---

## 🔧 **VERIFICATION:**

### **Check if Replicate is Configured:**

```bash
# Check .env.local file
cat .env.local

# Should show:
# REPLICATE_API_TOKEN=r8_...
```

### **Check Server Logs:**

When you separate stems, look for:
```
✅ [STEMS] Using Replicate API...
✅ [STEMS] ✅ Replicate separation complete!
```

**NOT:**
```
⚠️ [STEMS] ⚠️ No API configured, using demo mode
```

---

## 🎵 **ALTERNATIVE OPTIONS:**

### **Option 2: LALAL.AI (Best Quality)**

**Pros:**
- Best quality available
- Simple REST API
- Very reliable

**Cons:**
- More expensive ($0.10-0.17 per minute)
- Need to buy credits upfront

**Setup:**
```
1. Go to https://www.lalal.ai/api/
2. Sign up
3. Buy credits ($15 for 90 minutes)
4. Get API key
5. Add to .env.local:
   LALAL_API_KEY=your_key_here
```

---

### **Option 3: Spleeter (FREE)**

**Pros:**
- Completely free
- High quality
- Open source

**Cons:**
- Need to set up Python server
- More complex setup
- Need server infrastructure

**Setup:**
```bash
# Install Python dependencies
pip install spleeter

# Create Python API server
# (See ALTERNATIVE_STEM_APIS.md for full guide)

# Add to .env.local:
PYTHON_WORKER_URL=http://localhost:8001
```

---

## ✅ **RECOMMENDED: USE REPLICATE**

**Why Replicate:**
1. ✅ Easiest setup (5 minutes)
2. ✅ No infrastructure needed
3. ✅ Pay-as-you-go
4. ✅ Good quality
5. ✅ Reliable uptime
6. ✅ $5 free credit

**Perfect for:**
- Getting started quickly
- Testing the feature
- Low-medium volume
- Not managing servers

---

## 🎯 **QUICK START CHECKLIST:**

- [ ] Sign up at https://replicate.com
- [ ] Get API token
- [ ] Create `.env.local` file
- [ ] Add `REPLICATE_API_TOKEN=r8_...`
- [ ] Run `npm install replicate`
- [ ] Restart server (`npm run dev`)
- [ ] Test stem separation
- [ ] ✅ Real stems!

---

## 📊 **COMPARISON:**

| Service | Setup Time | Cost | Quality | Complexity |
|---------|------------|------|---------|------------|
| **Replicate** | 5 min | $0.14/min | ⭐⭐⭐⭐ | Easy |
| **LALAL.AI** | 10 min | $0.10-0.17/min | ⭐⭐⭐⭐⭐ | Easy |
| **Spleeter** | 30 min | FREE | ⭐⭐⭐⭐⭐ | Hard |
| **Demo Mode** | 0 min | FREE | ❌ | Easy |

---

## 🎉 **SUMMARY:**

**Current Status:**
- ❌ Demo mode (fake stems)
- ❌ All stems play original audio
- ❌ No actual separation

**After Setup:**
- ✅ Real stem separation
- ✅ Each stem is different
- ✅ Professional quality
- ✅ Vocals, drums, bass, other

**Setup Time:** 5 minutes
**Cost:** $0.41 per 3-minute song
**Quality:** Professional

**Get started now: https://replicate.com** 🚀
