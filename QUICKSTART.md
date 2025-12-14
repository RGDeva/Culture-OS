# 🚀 NoCulture OS - Quick Start Guide

## **Get Started in 10 Minutes**

This guide will get your complete unified music platform running locally.

---

## 📋 **Prerequisites**

- Node.js 18+ installed
- Python 3.9+ installed
- PostgreSQL database (or use Supabase/Neon)
- Cloudinary account (free tier works)

---

## ⚡ **Quick Setup**

### **1. Install Dependencies**

```bash
# Install Node.js dependencies
npm install --legacy-peer-deps

# Install Python dependencies
cd python-worker-enhanced
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### **2. Set Up Environment Variables**

Create `.env.local` in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/noculture"

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Privy (Authentication)
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_secret"

# Stripe (Payments) - Optional for testing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PLATFORM_FEE_PERCENTAGE="5"

# AI Services - Optional
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk_..."
HUGGINGFACE_API_KEY="hf_..."

# Python Worker
PYTHON_WORKER_URL="http://localhost:8001"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### **3. Set Up Database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### **4. Start Services**

Open **3 terminals**:

#### **Terminal 1: Python Worker**
```bash
cd python-worker-enhanced
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

#### **Terminal 2: Next.js Server**
```bash
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3001
```

#### **Terminal 3: (Optional) Test Commands**
```bash
# Test Python worker health
curl http://localhost:8001/health

# Test Next.js
curl http://localhost:3001
```

---

## 🎯 **Test the Platform**

### **1. Upload & Analyze Audio**

1. Go to http://localhost:3001/vault
2. Drag & drop an MP3/WAV file
3. Wait for upload to complete
4. Click on the asset
5. Go to "ENHANCED_ANALYSIS" tab
6. Click "RUN_ANALYSIS"
7. Wait ~30 seconds
8. View comprehensive analysis!

### **2. Search for Providers**

1. Go to http://localhost:3001/marketplace
2. Browse available service providers
3. Click on a provider profile
4. View their portfolio, reviews, availability
5. Click "BOOK_ME" to test booking wizard

### **3. Create a Booking**

1. From provider profile, click "BOOK_ME"
2. **Step 1:** Select service type (e.g., Mixing)
3. **Step 2:** Choose date, time, duration
4. **Step 3:** Set location (in-person or remote)
5. **Step 4:** Review and confirm
6. Booking created! (Check `/api/bookings/my-bookings`)

### **4. Test AI Assistant**

```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I have 10 trap beats. How should I organize them?"
      }
    ],
    "context": {
      "userId": "test_user"
    }
  }'
```

---

## 📊 **Available Features**

### **✅ Working Out of the Box:**
- File vault & upload
- Audio analysis (basic features)
- Provider search
- Booking system
- Project organization

### **🔑 Requires API Keys:**
- **Stripe:** Payment processing
- **OpenAI/Groq:** AI assistant
- **HuggingFace:** Advanced ML models
- **Dreamster/TakeRecord/WaveWarZ:** Platform integrations

### **🚧 Coming Soon:**
- Real-time chat (Socket.io)
- Calendar UI (FullCalendar)
- Review system UI
- Map-based discovery

---

## 🎨 **Key Pages**

| Page | URL | Description |
|------|-----|-------------|
| **Vault** | `/vault` | Upload & organize files |
| **Marketplace** | `/marketplace` | Browse service providers |
| **Provider Profile** | `/marketplace/provider/[id]` | View provider details |
| **Network** | `/network` | Find collaborators |
| **Session Vault** | `/session-vault` | Project management |

---

## 🔧 **Common Issues**

### **Python Worker Won't Start**

```bash
# Check Python version
python3 --version  # Need 3.9+

# Reinstall dependencies
cd python-worker-enhanced
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### **librosa Installation Fails**

```bash
# On macOS
brew install libsndfile

# On Ubuntu/Debian
sudo apt-get install libsndfile1

# Then reinstall
pip install librosa
```

### **Database Connection Error**

```bash
# Check PostgreSQL is running
psql -U postgres

# Or use a cloud database:
# - Supabase: https://supabase.com
# - Neon: https://neon.tech
# - Railway: https://railway.app
```

### **Cloudinary Upload Fails**

1. Check environment variables are set
2. Verify Cloudinary credentials
3. Check upload preset is configured
4. Fallback: Files will use mock URLs

---

## 📚 **Documentation**

- **Complete Implementation:** `UNIFIED_PLATFORM_IMPLEMENTATION.md`
- **Phase 2 (AI Analysis):** `PHASE2_COMPLETE.md`
- **Phase 3 (Marketplace):** `PHASE3_PROGRESS.md`
- **Roadmap:** `UNIFIED_PLATFORM_ROADMAP.md`

---

## 🎯 **Next Steps**

### **For Development:**
1. Add your own audio files to test
2. Create mock provider profiles
3. Test booking flow end-to-end
4. Experiment with AI assistant
5. Customize UI/branding

### **For Production:**
1. Set up production database (Supabase/Neon)
2. Configure Stripe Connect for real payments
3. Add API keys for all services
4. Deploy to Vercel/Railway
5. Set up custom domain
6. Configure webhooks
7. Enable SSL/HTTPS

---

## 🚀 **Deploy to Production**

### **Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### **Python Worker (Railway/Render)**

```bash
# Create Dockerfile in python-worker-enhanced/
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]

# Deploy to Railway
railway up
```

---

## 💡 **Pro Tips**

### **Speed Up Development:**
- Use `npm run dev --turbo` for faster builds
- Enable hot reload for Python worker
- Use mock data for testing
- Skip AI analysis for faster uploads

### **Optimize Performance:**
- Enable Cloudinary auto-optimization
- Use CDN for static assets
- Implement Redis caching
- Add database indexes

### **Security Best Practices:**
- Never commit `.env.local`
- Use environment variables for all secrets
- Enable CORS only for your domain
- Validate all user inputs
- Use Stripe webhooks for payment confirmation

---

## 🎉 **You're Ready!**

Your complete music industry operating system is now running with:

✅ **File Vault** - Upload & organize audio files
✅ **AI Analysis** - Tempo, genre, quality, virality
✅ **Marketplace** - Find & book service providers
✅ **Payments** - Stripe + x402 with auto-splits
✅ **Distribution** - Submit to Spotify, Apple Music, etc.
✅ **AI Assistant** - LLM-powered organization & matching
✅ **Integrations** - Dreamster, TakeRecord, WaveWarZ

**Start building the future of music! 🎵🚀**

---

## 📞 **Need Help?**

- Check documentation in `/docs`
- Review API endpoints in route files
- Test with provided scripts
- Check console logs for errors

**Happy building! 🎶**
