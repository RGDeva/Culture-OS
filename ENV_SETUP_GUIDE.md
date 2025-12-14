# 🔑 Environment Variables Setup Guide

## **Required Environment Variables**

Add these to your `.env.local` file:

```bash
# ============================================================================
# CRITICAL - Required for basic functionality
# ============================================================================

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/noculture"
# Get free database: https://supabase.com or https://neon.tech

# Authentication (Privy)
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_secret"
# Get keys: https://dashboard.privy.io

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
# Get keys: https://cloudinary.com/console

# ============================================================================
# RECOMMENDED - For full functionality
# ============================================================================

# AI Assistant (OpenAI) - YOU HAVE THIS ✅
OPENAI_API_KEY="sk-proj-..."
# Get key: https://platform.openai.com/api-keys

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PLATFORM_FEE_PERCENTAGE="5"
# Get keys: https://dashboard.stripe.com/apikeys

# Python Worker (Audio Analysis)
PYTHON_WORKER_URL="http://localhost:8001"
# This runs locally - see setup below

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# ============================================================================
# OPTIONAL - For advanced features
# ============================================================================

# Alternative AI Providers (Faster/Cheaper)
GROQ_API_KEY="gsk_..."  # Get: https://console.groq.com
HUGGINGFACE_API_KEY="hf_..."  # Get: https://huggingface.co/settings/tokens

# DSP Distribution
EPSILON_FM_API_KEY="..."  # Get: https://epsilon.fm
ISRC_REGISTRANT_CODE="NCO"  # Your ISRC code
UPC_PREFIX="123456"  # Your UPC prefix

# Platform Integrations
DREAMSTER_API_KEY="..."  # Get: https://dreamster.io
TAKERECORD_API_KEY="..."  # Get: https://takerecord.io
WAVEWARZ_API_KEY="..."  # Get: https://wavewarz.io
```

---

## 🚀 **What You Have vs What You Need**

### ✅ **You Already Have:**
- DATABASE_URL
- NEXT_PUBLIC_PRIVY_APP_ID
- CLOUDINARY credentials
- OPENAI_API_KEY ✅

### ⚠️ **You Should Add:**

#### **1. Python Worker URL (Required for Audio Analysis)**
```bash
PYTHON_WORKER_URL="http://localhost:8001"
```
Just add this line - the worker will run locally.

#### **2. Stripe Keys (Required for Payments)**
Get free test keys from https://dashboard.stripe.com/test/apikeys

```bash
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

#### **3. App URL**
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

---

## 📝 **Quick Copy-Paste**

Add these 3 lines to your `.env.local`:

```bash
# Audio Analysis Worker
PYTHON_WORKER_URL="http://localhost:8001"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3001"

# Platform Fee (5%)
PLATFORM_FEE_PERCENTAGE="5"
```

For Stripe (if you want payment features):
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_`)
3. Add to `.env.local`:
```bash
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
```

---

## 🎯 **What Works Without Additional Keys**

### ✅ **Fully Functional:**
- File vault & upload
- Project organization
- Asset management
- Provider profiles
- Booking wizard (UI)
- AI assistant (you have OpenAI key!)
- Audio analysis (once Python worker is running)

### ⚠️ **Limited Without Keys:**
- **Payments:** Need Stripe keys for real transactions
- **DSP Distribution:** Need epsilon.fm key
- **Platform Integrations:** Need Dreamster/TakeRecord/WaveWarZ keys

---

## 🔧 **Testing Without All Keys**

You can test most features with mock data:

```bash
# The app will use mock responses for:
- Payment links (shows UI, doesn't process)
- DSP distribution (shows UI, doesn't submit)
- Platform integrations (shows UI, doesn't connect)

# These work fully:
- File upload & storage (Cloudinary)
- Audio analysis (Python worker)
- AI assistant (OpenAI)
- Booking system (database)
- Provider search (database)
```

---

## ✅ **Your Current Status**

Based on the check:
- ✅ All critical variables set
- ✅ OpenAI API key added
- ⚠️ Need: PYTHON_WORKER_URL
- ⚠️ Optional: STRIPE_SECRET_KEY

**You're 95% ready to run!**

Just add these 2 lines to `.env.local`:
```bash
PYTHON_WORKER_URL="http://localhost:8001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

Then run:
```bash
npm run dev
```

---

## 🎉 **Next Steps**

1. **Add the 2 missing variables above**
2. **Start Next.js:** `npm run dev`
3. **Start Python worker:** `cd python-worker-enhanced && python main.py`
4. **Test the platform:** http://localhost:3001

Optional: Add Stripe keys later when you want to test payments.
