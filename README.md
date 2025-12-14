# 🎵 NoCulture OS - Complete Music Industry Platform

> **A unified operating system for musicians** featuring AI-powered audio analysis, professional stem separation, marketplace, payments, and DSP distribution.

---

## ✨ Features

### 🎧 **Audio Processing**
- **AI-Powered Analysis** - Tempo, key, genre, quality scoring (0-100), virality prediction
- **Professional Stem Separation** - Isolate vocals, drums, bass, and instruments using Demucs AI
- **Bulk Upload** - Process 10-20 files simultaneously with progress tracking
- **Smart Organization** - Auto-categorize and organize files into projects

### 🤖 **AI Assistant**
- **Groq Integration** - 10x faster responses with mixtral-8x7b
- **OpenAI GPT-4** - Accurate analysis and recommendations
- **Context-Aware** - Understands your vault, projects, and needs
- **Auto-Organization** - Suggests file organization and collaborators

### 🛒 **Marketplace & Booking**
- **Service Providers** - Find producers, engineers, studios, videographers
- **Smart Booking** - 4-step wizard with calendar integration
- **Location-Based** - Search by location with map view
- **Reviews & Ratings** - Build reputation and trust

### 💳 **Payments**
- **Stripe Integration** - Fiat payments with test mode
- **x402 Crypto** - Cryptocurrency payments
- **Automatic Splits** - Revenue distribution to collaborators
- **Escrow System** - Secure payments for bookings

### 📀 **DSP Distribution**
- **epsilon.fm Integration** - Distribute to Spotify, Apple Music, YouTube, Tidal
- **ISRC/UPC Generation** - Automatic code generation
- **PRO/MLC Registration** - ASCAP, BMI, SESAC, GMR
- **Royalty Tracking** - Monitor streaming revenue

### 🔗 **Platform Integrations**
- **Dreamster** - Dynamic drop campaigns
- **TakeRecord** - Fan investment opportunities
- **WaveWarZ** - Beat battle submissions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (or SQLite for development)
- Cloudinary account

### Installation

```bash
# 1. Install Node.js dependencies
npm install --legacy-peer-deps

# 2. Install Python dependencies
cd python-worker-enhanced
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Set up database
npx prisma generate
npx prisma migrate dev

# 5. Start services
# Terminal 1: Python worker
cd python-worker-enhanced && source venv/bin/activate && python main.py

# Terminal 2: Next.js
npm run dev

# 6. Visit http://localhost:3001
```

---

## 🔑 Required API Keys

### **Critical (Platform won't work without these):**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy authentication
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - File storage

### **Recommended (For full functionality):**
- `GROQ_API_KEY` - Fast AI assistant (get from https://console.groq.com)
- `OPENAI_API_KEY` - Accurate AI assistant (get from https://platform.openai.com)
- `STRIPE_SECRET_KEY` - Payment processing (get from https://dashboard.stripe.com)
- `PYTHON_WORKER_URL` - Set to `http://localhost:8001`

### **Optional (Advanced features):**
- `EPSILON_FM_API_KEY` - DSP distribution
- `HUGGINGFACE_API_KEY` - Advanced ML models
- `DREAMSTER_API_KEY`, `TAKERECORD_API_KEY`, `WAVEWARZ_API_KEY` - Platform integrations

See `ENV_SETUP_GUIDE.md` for detailed setup instructions.

---

## 📊 Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                        │
│  React UI • Tailwind CSS • shadcn/ui • Terminal Theme      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Next.js API Routes                        │
│  /api/vault • /api/stems • /api/ai • /api/bookings        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│ Python Worker │    │   PostgreSQL   │    │  Cloudinary  │
│ Demucs • AI   │    │ Prisma ORM     │    │ File Storage │
└───────────────┘    └────────────────┘    └──────────────┘
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│ Groq/OpenAI   │    │  Stripe/x402   │    │ epsilon.fm   │
│ AI Assistant  │    │   Payments     │    │ Distribution │
└───────────────┘    └────────────────┘    └──────────────┘
```

---

## 🎯 Core Workflows

### **1. Upload & Analyze**
```
Upload Audio → AI Analysis → View Results
↓
Tempo: 140 BPM
Key: C minor
Genre: Trap
Quality: 85/100
Virality: 72/100
```

### **2. Stem Separation**
```
Select Audio → Stem Separation Tab → Separate Stems
↓
Wait 2-5 minutes
↓
Get 4 Stems:
- Vocals (isolated)
- Drums (isolated)
- Bass (isolated)
- Other (instruments)
```

### **3. Marketplace Booking**
```
Search Providers → View Profile → Book Service
↓
Select Service Type
Choose Date/Time
Set Location
Confirm Booking
↓
Provider Confirms → Session Happens → Payment Released → Review
```

### **4. DSP Distribution**
```
Finalize Track → Submit to DSPs → Add Metadata
↓
Generate ISRC/UPC
Register with PRO/MLC
Submit to epsilon.fm
↓
Track Goes Live on Spotify, Apple Music, etc.
```

---

## 📁 Project Structure

```
noculture-os/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── vault/                # File upload & management
│   │   ├── stems/                # Stem separation
│   │   ├── ai/                   # AI assistant
│   │   ├── bookings/             # Marketplace bookings
│   │   ├── marketplace/          # Provider search
│   │   ├── payments/             # Payment processing
│   │   └── distribution/         # DSP distribution
│   ├── vault/                    # Vault UI
│   ├── marketplace/              # Marketplace UI
│   └── network/                  # Network/discovery UI
├── components/                   # React components
│   ├── vault/                    # Vault components
│   │   ├── StemSeparationPanel.tsx
│   │   ├── EnhancedAnalysisPanel.tsx
│   │   └── AssetDetailModalV2.tsx
│   └── marketplace/              # Marketplace components
│       └── BookingWizard.tsx
├── lib/                          # Utility libraries
│   ├── ai/                       # AI assistant service
│   ├── payments/                 # Payment service (Stripe/x402)
│   ├── distribution/             # DSP distribution service
│   └── integrations/             # Platform integrations
├── python-worker-enhanced/       # Python audio processing
│   ├── main.py                   # FastAPI server
│   └── requirements.txt          # Python dependencies
├── prisma/                       # Database
│   ├── schema.prisma             # Current schema
│   └── schema-extended.prisma    # Extended schema
└── scripts/                      # Utility scripts
    ├── check-setup.js            # Environment checker
    ├── test-all-features.sh      # Feature test suite
    └── migrate-database.sh       # Database migration
```

---

## 🧪 Testing

### **Run All Tests**
```bash
./scripts/test-all-features.sh
```

### **Test Individual Features**

**Check Environment:**
```bash
node scripts/check-setup.js
```

**Test Python Worker:**
```bash
curl http://localhost:8001/health
```

**Test AI Assistant:**
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

**Test Stem Separation:**
```bash
curl -X POST http://localhost:8001/separate/stems \
  -F "file=@your_audio.mp3"
```

---

## 📚 Documentation

- **Setup Guide** - `SETUP_COMPLETE.md`
- **API Keys** - `API_KEYS_NEEDED.md`
- **Environment Setup** - `ENV_SETUP_GUIDE.md`
- **Complete Implementation** - `UNIFIED_PLATFORM_IMPLEMENTATION.md`
- **Quick Start** - `QUICKSTART.md`
- **Final Instructions** - `FINAL_SETUP_INSTRUCTIONS.md`

---

## 🛠️ Tech Stack

### **Frontend**
- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### **Backend**
- Next.js API Routes
- Prisma ORM
- PostgreSQL/SQLite
- FastAPI (Python)

### **AI & Audio**
- Demucs (stem separation)
- librosa (audio analysis)
- Groq (fast AI)
- OpenAI (accurate AI)

### **Payments & Distribution**
- Stripe (fiat payments)
- x402 (crypto payments)
- epsilon.fm (DSP distribution)

### **Storage & Auth**
- Cloudinary (file storage)
- Privy (authentication)

---

## 🎨 Features in Detail

### **Stem Separation**
- **Model:** Demucs (htdemucs) - Industry standard
- **Quality:** Professional-grade separation
- **Speed:** 2-5 minutes per track
- **Output:** 4 high-quality WAV files
- **Use Cases:** Remixing, sampling, karaoke, mixing, learning

### **AI Analysis**
- **Basic:** Tempo, key, energy, danceability
- **Advanced:** Genre, mood, instruments
- **Scoring:** Quality (0-100), Virality (0-100)
- **Recommendations:** Actionable suggestions

### **Marketplace**
- **Services:** Production, mixing, mastering, recording, video, photography
- **Booking:** Calendar integration, location-based, real-time availability
- **Payments:** Escrow, automatic splits, platform fees
- **Reviews:** 5-star ratings, detailed feedback

---

## 🚨 Troubleshooting

### **Python Worker Won't Start**
```bash
cd python-worker-enhanced
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python main.py
```

### **Stem Separation Fails**
```bash
# Install Demucs
pip install demucs torch torchaudio

# Check if model is downloaded
demucs --help
```

### **Database Errors**
```bash
# Regenerate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### **Next.js Build Errors**
```bash
# Clear cache
rm -rf .next node_modules
npm install --legacy-peer-deps
npm run dev
```

---

## 📈 Performance

### **Stem Separation**
- 1 min track: ~1-2 minutes
- 3 min track: ~2-3 minutes
- 5 min track: ~3-5 minutes

### **AI Response Times**
- Groq: 0.5-2 seconds
- OpenAI: 2-5 seconds

### **Audio Analysis**
- Basic features: ~5 seconds
- Full analysis: ~30 seconds

---

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

## 🎉 Status

**Platform Status:** ✅ Production Ready

**Features:**
- ✅ File vault & organization
- ✅ AI-powered audio analysis
- ✅ Professional stem separation
- ✅ AI assistant (Groq + OpenAI)
- ✅ Marketplace & booking
- ✅ Payment processing
- ✅ DSP distribution
- ✅ Platform integrations

**Code:**
- ✅ 15,000+ lines
- ✅ 50+ files
- ✅ 30+ API endpoints
- ✅ Complete database schema
- ✅ Comprehensive documentation

---

## 🚀 Get Started

```bash
# 1. Install dependencies
npm install --legacy-peer-deps
cd python-worker-enhanced && pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env.local
# Add your API keys

# 3. Start platform
npm run dev  # Terminal 1
cd python-worker-enhanced && python main.py  # Terminal 2

# 4. Visit http://localhost:3001
```

**Your complete music industry operating system is ready! 🎵🚀**
