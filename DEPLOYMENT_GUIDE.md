# 🚀 NoCulture OS - Production Deployment Guide

## Overview

This guide covers deploying your complete music platform to production with:
- Next.js frontend on Vercel
- Python worker on Railway/Render
- PostgreSQL database on Supabase/Neon
- File storage on Cloudinary

---

## 📋 Pre-Deployment Checklist

### **1. Environment Variables**
- [ ] All API keys configured
- [ ] Production database URL
- [ ] Production Cloudinary account
- [ ] Stripe live keys (not test keys)
- [ ] Domain name configured

### **2. Code Preparation**
- [ ] All features tested locally
- [ ] Database migrations run
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Rate limiting configured

### **3. Security**
- [ ] CORS configured for production domain
- [ ] API routes protected
- [ ] Environment variables secured
- [ ] SSL/HTTPS enabled
- [ ] Webhook secrets configured

---

## 🗄️ Step 1: Deploy Database (Supabase)

### **Option A: Supabase (Recommended)**

1. **Create Account**
   - Go to https://supabase.com
   - Sign up for free

2. **Create Project**
   - Click "New Project"
   - Choose region closest to users
   - Set strong database password

3. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" (Transaction mode)
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

4. **Update Schema**
   ```bash
   # Update .env.local
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   
   # Run migrations
   npx prisma migrate deploy
   ```

### **Option B: Neon (Alternative)**

1. Go to https://neon.tech
2. Create project
3. Copy connection string
4. Run migrations

---

## 🐍 Step 2: Deploy Python Worker (Railway)

### **Option A: Railway (Recommended)**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Create Project**
   ```bash
   cd python-worker-enhanced
   railway init
   ```

3. **Configure Environment**
   ```bash
   # Set environment variables in Railway dashboard
   railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
   railway variables set CLOUDINARY_API_KEY=your_api_key
   railway variables set CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this URL

### **Option B: Render (Alternative)**

1. **Create `Dockerfile`** in `python-worker-enhanced/`:
   ```dockerfile
   FROM python:3.11-slim
   
   WORKDIR /app
   
   # Install system dependencies
   RUN apt-get update && apt-get install -y \
       libsndfile1 \
       ffmpeg \
       && rm -rf /var/lib/apt/lists/*
   
   # Copy requirements and install
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   # Copy application
   COPY . .
   
   # Expose port
   EXPOSE 8001
   
   # Run application
   CMD ["python", "main.py"]
   ```

2. **Deploy to Render**
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repo
   - Select `python-worker-enhanced` directory
   - Deploy

---

## 🌐 Step 3: Deploy Next.js (Vercel)

### **1. Install Vercel CLI**
```bash
npm install -g vercel
vercel login
```

### **2. Configure Project**
```bash
# In project root
vercel
```

Follow prompts:
- Link to existing project or create new
- Set project name
- Choose framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`

### **3. Set Environment Variables**

In Vercel dashboard (Settings → Environment Variables):

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_secret"

# File Storage
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Python Worker (from Railway)
PYTHON_WORKER_URL="https://your-app.railway.app"

# AI
GROQ_API_KEY="gsk_..."
OPENAI_API_KEY="sk-..."

# Payments (LIVE KEYS!)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL (your domain)
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# Platform Fee
PLATFORM_FEE_PERCENTAGE="5"
```

### **4. Deploy**
```bash
vercel --prod
```

---

## 🔗 Step 4: Configure Custom Domain

### **1. Add Domain in Vercel**
- Go to Vercel dashboard
- Project Settings → Domains
- Add your domain (e.g., `noculture.io`)

### **2. Update DNS**
Add these records to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **3. Wait for SSL**
- Vercel automatically provisions SSL certificate
- Usually takes 5-10 minutes

---

## 🔔 Step 5: Configure Webhooks

### **Stripe Webhooks**

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint**
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events to send:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.succeeded`

3. **Get Signing Secret**
   - Copy webhook signing secret
   - Add to Vercel environment variables:
     ```bash
     STRIPE_WEBHOOK_SECRET="whsec_..."
     ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

---

## 📊 Step 6: Monitoring & Analytics

### **1. Vercel Analytics**
- Automatically enabled
- View in Vercel dashboard

### **2. Error Tracking (Sentry)**

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

Add to `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    silent: true,
    org: 'your-org',
    project: 'noculture-os',
  }
)
```

### **3. Uptime Monitoring**
- Use UptimeRobot (free)
- Monitor: `https://your-domain.com/api/health`

---

## 🔒 Step 7: Security Hardening

### **1. Rate Limiting**

Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const max = 100 // 100 requests per minute

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
  } else {
    const record = rateLimit.get(ip)
    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
    } else {
      record.count++
      if (record.count > max) {
        return new NextResponse('Too Many Requests', { status: 429 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### **2. CORS Configuration**

Update API routes:
```typescript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
]

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  
  if (origin && allowedOrigins.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }
  
  return new Response(null, { status: 403 })
}
```

### **3. Environment Variable Validation**

Create `lib/env.ts`:
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_PRIVY_APP_ID',
  'CLOUDINARY_CLOUD_NAME',
  'STRIPE_SECRET_KEY',
  'PYTHON_WORKER_URL',
]

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

---

## 🧪 Step 8: Post-Deployment Testing

### **1. Smoke Tests**

```bash
# Test homepage
curl https://your-domain.com

# Test API health
curl https://your-domain.com/api/health

# Test Python worker
curl https://your-app.railway.app/health

# Test AI assistant
curl -X POST https://your-domain.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### **2. Feature Tests**

- [ ] Upload audio file
- [ ] Run AI analysis
- [ ] Separate stems
- [ ] Create booking
- [ ] Process payment
- [ ] Test webhooks

### **3. Performance Tests**

- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Stem separation completes
- [ ] File uploads work

---

## 📈 Step 9: Scaling Considerations

### **Database**
- **Supabase:** Auto-scales, upgrade plan as needed
- **Connection Pooling:** Use Prisma connection pooling
- **Indexes:** Ensure all foreign keys are indexed

### **Python Worker**
- **Railway:** Scale horizontally (add more instances)
- **Caching:** Cache analysis results
- **Queue:** Use Redis for job queue

### **Next.js**
- **Vercel:** Auto-scales
- **Edge Functions:** Use for API routes
- **ISR:** Use Incremental Static Regeneration

---

## 💰 Step 10: Cost Optimization

### **Estimated Monthly Costs**

**Free Tier (Development):**
- Vercel: Free (Hobby plan)
- Railway: $5/month
- Supabase: Free (up to 500MB)
- Cloudinary: Free (25GB)
- **Total: ~$5/month**

**Production (Low Traffic):**
- Vercel: $20/month (Pro plan)
- Railway: $20/month
- Supabase: $25/month (Pro plan)
- Cloudinary: $99/month (Advanced plan)
- **Total: ~$164/month**

**Production (High Traffic):**
- Vercel: $20/month
- Railway: $50-100/month (scaled)
- Supabase: $25-100/month
- Cloudinary: $224/month (Advanced Plus)
- **Total: ~$319-444/month**

---

## 🚨 Rollback Plan

### **If Deployment Fails:**

1. **Revert Vercel Deployment**
   ```bash
   vercel rollback
   ```

2. **Revert Database Migration**
   ```bash
   npx prisma migrate resolve --rolled-back [migration-name]
   ```

3. **Revert Python Worker**
   ```bash
   railway rollback
   ```

---

## ✅ Post-Deployment Checklist

- [ ] All services running
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Webhooks configured
- [ ] Monitoring enabled
- [ ] Error tracking active
- [ ] Backups configured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] All features tested
- [ ] Performance optimized
- [ ] Documentation updated

---

## 📞 Support

For deployment issues:
1. Check Vercel logs
2. Check Railway logs
3. Check Supabase logs
4. Review error tracking (Sentry)

---

## 🎉 You're Live!

Your complete music industry platform is now in production!

**Next Steps:**
1. Monitor performance
2. Gather user feedback
3. Iterate and improve
4. Scale as needed

**Your platform is ready to revolutionize the music industry! 🎵🚀**
